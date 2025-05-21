import os
import glob
from ase import Atoms
from ase.io import read
from ase.geometry import get_distances
from mofstructure import mofdeconstructor, filetyper
#from ase.geometry import distance
from ase.data import covalent_radii, atomic_numbers
import numpy as np
import itertools


def check_no_overlap(host: Atoms, guest: Atoms) -> bool:
    """Check if all guest atoms are far enough from host atoms."""
    all_positions_host = host.positions
    all_positions_guest = guest.positions
    cell = host.get_cell()
    pbc = host.get_pbc()

    distances = get_distances(all_positions_host, all_positions_guest, cell=cell, pbc=pbc)[1]

    for i, host_atom in enumerate(host):
        for j, guest_atom in enumerate(guest):
            min_allowed_dist = covalent_radii[host_atom.number] + covalent_radii[guest_atom.number] + 0.4
            if distances[i, j] < min_allowed_dist:
                return False
    return True


def get_section(contents, start_key, stop_key, start_offset=0, stop_offset=0):
    all_start_indices = [i + start_offset for i, line in enumerate(contents) if start_key in line]
    start_index = all_start_indices[-1]
    for i in range(start_index, len(contents)):
        if stop_key in contents[i]:
            stop_index = i + 1 + stop_offset
            break
    return contents[start_index:stop_index]


def get_charge(data):
    aim = []
    elements = []
    section = get_section(data, 'Atomic Charge Analysis', 'Total:', start_offset=8, stop_offset=-2)
    for line in section:
        parts = line.split()
        aim.append(float(parts[6]))  # AIM charge
        elements.append(parts[1])
    return elements, aim



def get_ase_atom(data):
    section = get_section(data, 'G E O M E T R Y    I N    X - Y - Z    F O R M A T', 'Total nr. of atoms:', start_offset=3, stop_offset=-2)
    positions = []
    elements = []
    cell = []

    for line in section:
        if 'VEC' in line:
            cell.append([float(x) for x in line.split()[1:]])
        else:
            parts = line.split()
            elements.append(parts[0])
            positions.append([float(x) for x in parts[1:]])

    return Atoms(symbols=elements, positions=positions, cell=cell)


def generate_guest_complexes(host: Atoms, guest: Atoms, charges: list) -> list:
    assert len(host) == len(charges), "Host and charges must be the same length"

    guest_compositions = [atom.symbol for atom in guest]
    guest_covalent_radius = max(covalent_radii[atomic_numbers[s]] for s in guest_compositions)

    non_h_indices = [i for i, atom in enumerate(host) if atom.symbol != 'H']
    non_h_charges = [(i, charges[i], host[i].symbol) for i in non_h_indices]

    grouped_by_symbol = {}
    for i, q, sym in non_h_charges:
        grouped_by_symbol.setdefault(sym, []).append((i, q))

    placements = []

    for symbol, atoms in grouped_by_symbol.items():
        if len(atoms) < 3:
            continue
        atoms.sort(key=lambda x: x[1], reverse=True)

        selected_atoms = [atoms[0], atoms[len(atoms) // 2], atoms[-1]]
        for idx, charge in [(a[0], a[1]) for a in selected_atoms]:
            host_atom = host[idx]
            pos = host_atom.position

            # Try placing the guest in multiple directions until a valid spot is found
            directions = np.eye(3).tolist() + (-np.eye(3)).tolist()
            radius = covalent_radii[host_atom.number] + guest_covalent_radius + 0.4

            for direction in directions:
                guest_pos = pos + np.array(direction) * radius
                guest_shifted = guest.copy()
                guest_shifted.translate(guest_pos - guest.get_center_of_mass())

                if check_no_overlap(host, guest_shifted):
                    combined = host + guest_shifted
                    placements.append((charge, combined))
                    break  # Stop after finding the first valid direction

    # Sort by charge from most positive to most negative
    placements.sort(key=lambda x: x[0], reverse=True)

    # Choose 7 structures: first (most positive), last (most negative), and 5 intermediates
    if len(placements) >= 7:
        indices = np.linspace(0, len(placements) - 1, 7, dtype=int)
        final_complexes = [placements[i][1] for i in indices]
    else:
        final_complexes = [x[1] for x in placements]  # Return as many as found

    return final_complexes


def generate_guest_complexes2(host: Atoms, guest: Atoms, charges: list, direction=np.array([1.0, 0.0, 0.0])) -> list:
    assert len(host) == len(charges), "Host and charges must match"

    guest_compositions = [atom.symbol for atom in guest]
    guest_covalent_radius = max(covalent_radii[atomic_numbers[s]] for s in guest_compositions)

    # Filter out hydrogens
    non_h_indices = [i for i, atom in enumerate(host) if atom.symbol != 'H']
    non_h_charges = [(i, charges[i], host[i].symbol) for i in non_h_indices]

    # Group by element type
    grouped_by_symbol = {}
    for i, q, sym in non_h_charges:
        grouped_by_symbol.setdefault(sym, []).append((i, q))

    placements = []

    for symbol, atoms in grouped_by_symbol.items():
        if len(atoms) < 3:
            continue

        atoms.sort(key=lambda x: x[1], reverse=True)
        selected_atoms = [atoms[0], atoms[len(atoms) // 2], atoms[-1]]  # most+, mid, least+

        for idx, charge in [(a[0], a[1]) for a in selected_atoms]:
            host_atom = host[idx]
            pos = host_atom.position
            radius = covalent_radii[host_atom.number] + guest_covalent_radius + 0.4

            # Place guest in fixed direction
            guest_pos = pos + direction / np.linalg.norm(direction) * radius
            guest_shifted = guest.copy()
            guest_shifted.translate(guest_pos - guest.get_center_of_mass())

            if check_no_overlap(host, guest_shifted):
                combined = host + guest_shifted
                placements.append((charge, combined))
            else:
                print(f"Overlap detected for atom {symbol} with charge {charge:.2f}, skipping.")

    # Sort all by charge from most positive to most negative
    placements.sort(key=lambda x: x[0], reverse=True)

    # Select exactly 7 spaced structures
    if len(placements) >= 7:
        indices = np.linspace(0, len(placements) - 1, 7, dtype=int)
        final_complexes = [placements[i][1] for i in indices]
    else:
        final_complexes = [x[1] for x in placements]

    return final_complexes


def generate_guest_complexes3(host: Atoms, guest: Atoms, charges: list) -> list:
    assert len(host) == len(charges), "Host and charges must be the same length"

    guest_symbols = [atom.symbol for atom in guest]
    guest_covalent_radius = max(covalent_radii[atomic_numbers[s]] for s in guest_symbols)

    # Filter out hydrogens
    non_h_indices = [i for i, atom in enumerate(host) if atom.symbol != 'H']
    non_h_charges = [(i, charges[i], host[i].symbol) for i in non_h_indices]

    # Group by atom type
    grouped_by_symbol = {}
    for i, q, sym in non_h_charges:
        grouped_by_symbol.setdefault(sym, []).append((i, q))

    placements = []

    # Directions to try, normalized
    trial_directions = np.array([
        [1, 0, 0], [0, 1, 0], [0, 0, 1],
        [-1, 0, 0], [0, -1, 0], [0, 0, -1],
        [1, 1, 0], [-1, 1, 0], [1, -1, 0], [0, 1, 1],
        [1, 0, 1], [1, 1, 1], [-1, -1, -1]
    ])
    trial_directions = [v / np.linalg.norm(v) for v in trial_directions]

    for symbol, atoms in grouped_by_symbol.items():
        if len(atoms) < 3:
            continue
        atoms.sort(key=lambda x: x[1], reverse=True)

        selected_atoms = [atoms[0], atoms[len(atoms) // 2], atoms[-1]]

        for idx, charge in [(a[0], a[1]) for a in selected_atoms]:
            host_atom = host[idx]
            pos = host_atom.position
            host_radius = covalent_radii[host_atom.number]
            placement_successful = False

            for direction in trial_directions:
                radius = host_radius + guest_covalent_radius + 0.4
                guest_pos = pos + direction * radius

                guest_shifted = guest.copy()
                guest_shifted.translate(guest_pos - guest.get_center_of_mass())

                if check_no_overlap(host, guest_shifted):
                    combined = host + guest_shifted
                    placements.append((charge, combined))
                    placement_successful = True
                    break

            if not placement_successful:
                print(f"Could not place guest near {symbol} (charge: {charge:.2f}) due to overlap.")

    # Sort all placements by charge (descending)
    placements.sort(key=lambda x: x[0], reverse=True)

    # Choose exactly 7 spaced structures
    if len(placements) >= 7:
        indices = np.linspace(0, len(placements) - 1, 7, dtype=int)
        final_complexes = [placements[i][1] for i in indices]
    else:
        final_complexes = [x[1] for x in placements]

    return final_complexes

def get_test_charges(data):
    charge = []
    section = get_section(data, 'Mulliken Charges', 'Total ', start_offset=3, stop_offset=-1)
    for lines in section:
        line = float(lines.split()[2])
        charge.append(line)
    return charge


def get_test_atom(data):
    element = []
    coords = []
    lattice = []
    all_data = []
    indices = []

    section = get_section(data, 'Index Symbol   x (angstrom)   y (angstrom)   z (angstrom)', 'Lattice vectors (angstrom)', 1, -2)

    for lines in section:
        line = lines.split()
        element.append(line[1])
        coords.append([float(i) for i in line[2:]])

    for i, lines in enumerate(data):
        all_data.append(lines.split())
        if "Lattice vectors" in lines:
            indices.append(i)
    index = indices[-1]
    vec1 = [float(i) for i in all_data[index+1][1:]]
    vec2 = [float(i) for i in all_data[index+2][1:]]
    vec3 = [float(i) for i in all_data[index+3][1:]]
    lattice = [vec1, vec2, vec3]
    ase_atom = Atoms(symbols=element, positions=coords, cell=lattice)
    return ase_atom




def generate_ams_neb_input(complexes: list, neb_name: str = "NEBJob", directory="neb_input"):
    assert len(complexes) >= 2, "At least two complexes required for NEB"
    os.makedirs(directory, exist_ok=True)

    initial = complexes[0]
    final = complexes[-1]
    intermediates = complexes[1:-1]
    all_images = [initial] + intermediates + [final]
    n_host_atoms = len(complexes[0]) - len(complexes[0][-1:])  # assumes guest is added at the end

    neb_input_path = os.path.join(directory, f"{neb_name}.run")
    with open(neb_input_path, "w") as f:
        f.write("#!/bin/sh\n\n")
        f.write("$AMSBIN/ams <<eor\n")
        f.write("Task NEB\n")
        f.write("NEB\n")
        f.write("  Images 30\n")
        f.write("End\n")

        def write_system_block(name, atoms):
            f.write(f"System {name}\n")
            f.write("  Atoms\n")
            for atom in atoms:
                f.write(f"{atom.symbol:<2} {atom.position[0]:>10.6f} {atom.position[1]:>10.6f} {atom.position[2]:>10.6f}\n")
            f.write("  End\n")

            if atoms.get_pbc().any():
                f.write("  Lattice\n")
                for vec in atoms.get_cell():
                    f.write(f" {vec[0]:>10.6f} {vec[1]:>10.6f} {vec[2]:>10.6f}\n")
                f.write("  End\n")

            f.write("  Constraints\n")
            f.write("    Atoms\n")
            f.write("      ")
            f.write(" ".join(str(i+1) for i in range(n_host_atoms)))  # AMS uses 1-based indexing
            f.write(" : Fixed\n")
            f.write("    End\n")
            f.write("  End\n")
            f.write("End\n")

        # Write initial system
        write_system_block("Initial", initial)

        # Write intermediates
        for i, intermediate in enumerate(intermediates):
            write_system_block(f"Intermediate-{i+1}", intermediate)

        # Write final system
        write_system_block("Final", final)

        f.write("Engine DFTB\n")
        f.write("EndEngine\n")
        f.write("eor\n")

    os.chmod(neb_input_path, 0o755)
    print(f"NEB input written to {neb_input_path}")





# #host_path = '../Saturation/MOFs/Al_cluster_1/DUMJAY_fair_gfn_opt.out'

# host_path = sorted(glob.glob( "/Volumes/scratch/hpc-prf-pfmof/Battery_Result_folder/Redox/MOFs_bands/*/*opt.out"))
# guest_path = '../Saturation/metal_atoms/'

# ned_path = '../NEB'

# for host_file in host_path:
#     basename = os.path.basename(host_file).split('_')[0]
#     foldername = host_file.split('/')[-2]
#     try:
#         data = filetyper.get_contents(host_file)

#         atom_name = foldername.split('_c')[0]
#         guest_atom = read(f'{guest_path}/{atom_name}.xyz' )
#         _, charges = get_charge(data)
#         host_atom = get_ase_atom(data)

#         complexes = generate_guest_complexes3(host_atom, guest_atom, charges)
#         final_neb_folder = f'{ned_path}/{foldername}'
#         if len(complexes) < 4:
#             complexes = generate_guest_complexes(host_atom, guest_atom, charges)

#         generate_ams_neb_input(complexes, neb_name=basename,directory=final_neb_folder)

#         print(basename, foldername, atom_name)
#     except Exception:
#         print ('failed', foldername, basename)


#guest = read('../Saturation/metal_atoms/Al.xyz')
#data = filetyper.get_contents(host_path)

#charges = get_test_charges(data)
#host_atoms = get_test_atom(data)
#
#complexes = generate_guest_complexes3(host_atoms, guest, charges)
#generate_ams_neb_input(complexes)
