"""
Module for visualizing electronic band structures from AMS/BAND .rkf files.

Author: Dominique Akassong Dinga Wonanke
License: MIT
"""

import argparse
import re
import numpy as np
from ase import Atoms
import matplotlib.pyplot as plt
import matplotlib.cm as cm
from read_rkf.parserkf import KFFile
import seekpath

plt.rcParams.update({'font.family': 'serif', 'font.size': 14})

class BandStructure:
    """
    Class to parse and plot band structure from AMS BAND output.

    Parameters
    ----------
    path_to_band : str
        Path to the BAND .rkf file containing band structure data.
    ylim : tuple, optional
        Tuple specifying the y-axis limits for the energy plot (default is (-5, 5)).
    shift_to_fermi : bool, optional
        If True, shifts the Fermi level to 0 eV in the plot.
    save_path : str or None, optional
        If provided, the plot will be saved to the specified path instead of shown.
    """

    def __init__(self, path_to_band, ylim=(-5, 5), shift_to_fermi=True, save_path=None):
        self.path_to_band = path_to_band
        self.rkf_data = KFFile(path_to_band)
        self.HaToEv = 27.2113845249047
        self.ylim = ylim
        self.shift_to_fermi = shift_to_fermi
        self.save_path = save_path

    def get_bands(self):
        return self.rkf_data.read_section('BandStructure')

    def get_fermi_energy(self):
        return self.get_bands().get('FermiEnergy', 0) * self.HaToEv

    def get_nspin(self):
        return self.get_bands().get('nSpin')

    def get_band_gap(self):
        return round(self.get_bands().get('BandGap', 0) * self.HaToEv, 4)

    def get_bottom_conduction_band(self):
        return round(self.get_bands().get('BottomConductionBand', 0) * self.HaToEv, 4)

    def get_top_valence_band(self):
        return round(self.get_bands().get('TopValenceBand', 0) * self.HaToEv, 4)

    def get_coords_bottom_conduction_band(self):
        return self.get_bands().get('CoordsBottomConductionBand', [])

    def get_coords_top_valence_band(self):
        return self.get_bands().get('CoordsTopValenceBand', [])

    def has_bandgap(self):
        return self.get_bands().get('HasGap')

    def get_ase_atom(self):
        """
        Convert the BAND data to ASE Atoms object.
        """
        molecule = self.rkf_data.read_section('Molecule')
        nAtoms = molecule.get('nAtoms')
        cell = molecule.get('LatticeVectors', None)
        positions = np.array(molecule.get('Coords')).reshape(nAtoms, 3)
        symbols = molecule.get('AtomSymbols').split()

        ase_atoms = Atoms(
            symbols=symbols,
            positions=positions
        )

        if cell is not None:
            n_vec = molecule.get('nLatticeVectors')
            cell = np.array(cell).reshape(n_vec, n_vec)
            ase_atoms.set_cell(cell)
            ase_atoms.set_pbc(True)

        return ase_atoms


    def plot(self):
        energies = self.get_energies()
        kpath, xtick_locs, xtick_labels_raw = self.get_kpoints_and_labels()
        fermi = self.get_fermi_energy()
        shift = fermi if self.shift_to_fermi else 0

        fig, ax = plt.subplots(figsize=(16, 10), dpi=150)
        colors = cm.viridis(np.linspace(0, 1, energies.shape[2]))

        linestyles = ['-', '--']  # spin up: solid, spin down: dashed
        for spin in range(energies.shape[0]):
            for band in range(energies.shape[2]):
                ax.plot(kpath, energies[spin, :, band] - shift,
                        color=colors[band],
                        lw=2.0, linestyle=linestyles[spin])

        fermi_line = ax.axhline(y=0 if self.shift_to_fermi else fermi, color='darkred', lw=2.5, linestyle='--')

        xtick_labels_latex = [self.latexify_label(lbl) for lbl in xtick_labels_raw]
        # xtick_locs, xtick_labels = filter_xticks_and_labels(xtick_locs, xtick_labels_latex)
        xtick_locs, xtick_labels = filter_xticks_and_labels(xtick_locs, xtick_labels_latex)

        ax.set_xticks(xtick_locs)
        ax.set_xticklabels(xtick_labels, fontsize=14)


        for x in xtick_locs:
            ax.axvline(x, color='gray', linestyle='--', linewidth=1)

        ax.set_ylabel("Energy (eV)", fontsize=18)
        ax.set_xlabel("Wave Vector", fontsize=18)
        ax.set_ylim(*self.ylim)

        legend_handles = [(fermi_line, "Fermi Level")]
        legend_handles.append(ax.plot([], [], color='black', linestyle='-', label='Spin Up')[0])
        legend_handles.append(ax.plot([], [], color='black', linestyle='--', label='Spin Down')[0])


        # if self.has_bandgap():
        vbm = self.get_top_valence_band()
        cbm = self.get_bottom_conduction_band()
        # vbm_k = self.get_coords_top_valence_band()[0]
        # cbm_k = self.get_coords_bottom_conduction_band()[0]
        vbm_frac = self.get_coords_top_valence_band()[0]
        cbm_frac = self.get_coords_bottom_conduction_band()[0]
        vbm_k = self.get_1d_kpoint_position(vbm_frac)
        cbm_k = self.get_1d_kpoint_position(cbm_frac)

        direct = vbm_k == cbm_k
        gap = self.get_band_gap()

        vbm_marker = ax.plot(vbm_k, vbm - shift, 'o', color='#1f77b4', markersize=13)[0]
        cbm_marker = ax.plot(cbm_k, cbm - shift, 'o', color='#d62728', markersize=13)[0]

        legend_handles.extend([
            (cbm_marker, f'CBM ({cbm:.2f} eV)'),
            (vbm_marker, f'VBM ({vbm:.2f} eV)'),
            (ax.plot([], [], ' ', label=f'Gap = {gap:.2f} eV ({"Direct" if direct else "Indirect"})')[0],
                f'BG : {gap:.2f} eV ({"Direct" if direct else "Indirect"})')
        ])

        ax.legend(*zip(*legend_handles), fontsize=12, loc='upper left', bbox_to_anchor=(1, 0.5))
        # ax.set_title("Band Structure", fontsize=18, weight='bold')
        ax.grid(True, linestyle='--', alpha=0.6)
        plt.tight_layout()
        if self.save_path:
            plt.savefig(self.save_path)
        else:
            plt.show()


    def get_1d_kpoint_position(self, target_frac_kpt, atol=1e-3):
        """
        Maps a 3D fractional k-point (from CoordsTopValenceBand/CoordsBottomConductionBand)
        to the 1D x-axis value used in the band structure plot.
        """
        n_edges = self.rkf_data.read("band_curves", "nEdges")
        total_offset = 0.0

        for edge in range(1, n_edges + 1):
            try:
                frac_kpts = np.array(self.rkf_data.read("band_curves", f"Edge_{edge}_kPoints"))
                x_k = np.array(self.rkf_data.read("band_curves", f"Edge_{edge}_xFor1DPlotting"))
                frac_kpts = frac_kpts.reshape((-1, 3))

                for i, kpt in enumerate(frac_kpts):
                    if np.allclose(kpt, target_frac_kpt, atol=atol):
                        return total_offset + x_k[i]
                total_offset += x_k[-1]
            except Exception as e:
                print(f"[WARNING] Error reading edge {edge}: {e}")
                continue

        print(f"[WARNING] Could not find 1D x-coordinate for fractional k-point {target_frac_kpt}")
        return None


    def get_energies(self):
        n_bands = self.rkf_data.read("band_curves", "nBands")
        n_spin = self.rkf_data.read("band_curves", "nSpin")
        n_edges = self.rkf_data.read("band_curves", "nEdges")

        band_data = []
        min_nbands = None

        for edge in range(1, n_edges + 1):
            key_bands = f"Edge_{edge}_bands"
            key_nk = f"Edge_{edge}_nKPoints"

            try:
                raw_flat = self.rkf_data.read("band_curves", key_bands)
                n_kpts = self.rkf_data.read("band_curves", key_nk)
                edge_array = np.array(raw_flat).reshape((n_kpts, n_bands))
            except Exception as e:
                print(f"[WARNING] Skipping edge {edge}: {e}")
                continue

            min_nbands = edge_array.shape[1] if min_nbands is None else min(min_nbands, edge_array.shape[1])
            band_data.append(edge_array)

        if not band_data or min_nbands is None:
            raise ValueError("No valid edge band data found.")

        band_data_ev = [arr[:, :min_nbands] * self.HaToEv for arr in band_data]
        full_band_data = np.vstack(band_data_ev)

        if n_spin == 2:
            nb_half = full_band_data.shape[1] // 2
            return np.array([full_band_data[:, :nb_half], full_band_data[:, nb_half:]])
        return np.array([full_band_data])

    def get_kpoints_and_labels(self):
        n_edges = self.rkf_data.read("band_curves", "nEdges")
        k_dists, tick_locs, tick_labels = [], [], []
        total_offset = 0.0

        for edge in range(1, n_edges + 1):
            kpts = np.array(self.rkf_data.read("band_curves", f"Edge_{edge}_xFor1DPlotting"))
            kpts_shifted = total_offset + kpts
            k_dists.extend(kpts_shifted)
            total_offset += kpts[-1]

            raw_labels = self.rkf_data.read("band_curves", f"Edge_{edge}_labels")
            for i, label in enumerate(raw_labels):
                label_clean = label.strip()
                if label_clean and i < len(kpts_shifted):
                    tick_locs.append(kpts_shifted[i])
                    tick_labels.append(label_clean)

        return np.array(k_dists), tick_locs, tick_labels

    # def latexify_label(self, lbl):
    #     if not lbl:
    #         return ""
    #     lbl = str(lbl).strip()
    #     if lbl.upper() in {"G", "GAMMA", "Γ"}:
    #         return r"$\Gamma$"
    #     try:
    #         lbl = re.sub(r"\^(\d+)", r"^{\1}", lbl)
    #         lbl = re.sub(r"_(\d+)", r"_{\1}", lbl)
    #         stripped = lbl.strip('^_{} ')
    #         if not stripped:
    #             return ""  # Avoid $$ or empty labels
    #         test_label = f"${lbl}$"
    #         plt.figure().text(0, 0, test_label)
    #         plt.close()
    #         return test_label
    #     except Exception:
    #         return str(lbl)
    def latexify_label(self, lbl):
        if not lbl:
            return ""
        lbl = str(lbl).strip()

        # Remove numeric prefixes like '1Γ', '2M'
        lbl = re.sub(r"^\d+", "", lbl)

        if lbl.upper() in {"G", "GAMMA", "Γ"}:
            return r"$\Gamma$"

        try:
            lbl = re.sub(r"\^(\d+)", r"^{\1}", lbl)
            lbl = re.sub(r"_(\d+)", r"_{\1}", lbl)
            stripped = lbl.strip('^_{} ')
            if not stripped:
                return ""  # Avoid $$ or empty labels
            test_label = f"${lbl}$"
            plt.figure().text(0, 0, test_label)
            plt.close()
            return test_label
        except Exception:
            return str(lbl)


def filter_xticks_and_labels(locations, labels, min_spacing=0.01):
    filtered_locs, filtered_labels = [], []
    last_x = -np.inf
    for loc, lbl in zip(locations, labels):
        if lbl and abs(loc - last_x) > min_spacing:
            filtered_locs.append(loc)
            filtered_labels.append(lbl)
            last_x = loc
    return filtered_locs, filtered_labels


# def filter_xticks_and_labels(locations, labels):
#     filtered_locs, filtered_labels, last_label = [], [], None
#     for loc, lbl in zip(locations, labels):
#         lbl = lbl.strip()
#         if lbl and lbl != last_label:
#             filtered_locs.append(loc)
#             filtered_labels.append(lbl)
#             last_label = lbl
#     return filtered_locs, filtered_labels

def main():
    parser = argparse.ArgumentParser(description="Plot band structure from AMS BAND RKF file.")
    parser.add_argument("rkf", type=str, help="Path to BAND .rkf file")
    parser.add_argument("--ylim", nargs=2, type=float, default=[-5, 5], help="Y-axis limits for energy plot")
    parser.add_argument("--shift_to_fermi", action="store_true", default=False, help="Do not shift Fermi level to 0 eV")
    parser.add_argument("--save_path", type=str, default='bandstructure.png', help="Save path for output image (e.g. band.png)")
    args = parser.parse_args()

    bs = BandStructure(args.rkf, ylim=tuple(args.ylim), shift_to_fermi=args.shift_to_fermi, save_path=args.save_path)
    bs.plot()

if __name__ == "__main__":
    main()

#     plt.show()