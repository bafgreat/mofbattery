import os
import json
import json
import gzip
from ase import Atoms
import seekpath
from ase.io import read
import numpy as np
from ase.data import chemical_symbols
from mofstructure import filetyper as read_writer


class NumpyJSONEncoder(json.JSONEncoder):
    """Custom encoder to handle NumPy types and reduce float precision."""
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, (np.float32, np.float64)):
            return round(float(obj), 4)
        elif isinstance(obj, (np.int32, np.int64)):
            return int(obj)
        return super().default(obj)

def truncate_floats(obj, precision=4):
    """Recursively round floats in dicts/lists."""
    if isinstance(obj, float):
        return round(obj, precision)
    elif isinstance(obj, list):
        return [truncate_floats(item, precision) for item in obj]
    elif isinstance(obj, dict):
        return {key: truncate_floats(value, precision) for key, value in obj.items()}
    return obj

def write_minified_json_gz(data, output_path='data_min.json.gz', precision=4):
    """
    Saves a Python dict (with possible NumPy arrays) as a minified, compressed JSON file.

    Args:
        data (dict): Your data to save.
        output_path (str): Filename to save as, with `.gz` extension.
        precision (int): Decimal places to keep for floats.
    """
    # Round floats manually before serializing
    truncated_data = truncate_floats(data, precision)

    # Write minified + gzip-compressed JSON
    with gzip.open(output_path, 'wt', encoding='utf-8') as f:
        json.dump(truncated_data, f, cls=NumpyJSONEncoder, separators=(',', ':'))

    print(f"Saved minified, compressed JSON to {output_path}")


def load_data(file_path):
    """
    Load data from a file based on its type.

    Args:
        file_path (str): The path to the file to be loaded.

    Returns:
        dict: The loaded data.
    """
    return read_writer.load_data(file_path)

def custom_bzpath(path_data):
    """
    Convert the path data to a custom format for band structure calculations.
    Args:
        path_data (dict): The path data from seekpath.
    Returns:
        list: A list of strings formatted for band structure calculations.
    """
    new_path = ["    Path\n"]
    point_coords = path_data.get('point_coords')
    for key, value in point_coords.items():
        if key=="GAMMA":
            key = 'G'
        path = ['      '] + [str(i) for i in value] + [' '] + [key] + ['\n']
        b = '\t'.join(path)
        new_path.append(b)
    new_path.append("   End\n")
    return new_path

def get_cart_positions(path_data):
    new_input = []
    frac_positions = path_data.get('primitive_positions')
    primitive_cell = path_data.get('primitive_lattice')
    cart_positions = np.dot(frac_positions, primitive_cell)
    numbers = path_data.get('primitive_types')
    symbols = [chemical_symbols[number] for number in numbers]

    new_input.append("  Atoms\n")
    for symbol, position in zip(symbols, cart_positions):
        new_input.append(f"      {symbol}    {position[0]}    {position[1]}    {position[2]}\n")
    new_input.append("   End\n\n")

    new_input.append("   Lattice\n")
    for i in range(len(primitive_cell)):
        new_input.append(f"    {primitive_cell[i][0]}   {primitive_cell[i][1]}   {primitive_cell[i][2]}\n")
    new_input.append("   End\n")
    new_input.append("End\n\n")
    return new_input


def ams_bandstructure_input(file_path):
    """
    create input for ams band structure calculations and pdos calculations

    **parameters:**
        file_path (str): The path to the .band file.
    """

    structure = read(file_path)
    seekcell = (
        structure.cell,
        structure.get_scaled_positions(),
        structure.get_atomic_numbers()
    )

    path_data = seekpath.get_path(seekcell)
    k_path = custom_bzpath(path_data)

    coords = get_cart_positions(path_data)

    new_input = ['#!/bin/sh\n\n', '$ADFBIN/ams << eor\n\n', "Task SinglePoint\n", "System\n"]
    new_input.extend(coords)
    new_input.append('\n')
    new_input.append('Engine BAND\n')
    new_input.append('  AIMCriticalPoints\n')
    new_input.append('      Enabled Yes\n')
    new_input.append('  End\n')

    new_input.append('  Basis\n')
    new_input.append('      Type TZ2P\n')
    new_input.append('      Core None\n')
    new_input.append('  End\n')

    new_input.append('  BandStructure\n')
    new_input.append('      Enabled Yes\n')
    new_input.append('      Automatic No\n')
    new_input.append('      DeltaK 0.05 [1/Angstrom]\n')
    new_input.append('  End\n')

    new_input.append('   EffectiveMass\n')
    new_input.append('       Enabled Yes\n')
    new_input.append('   End\n')

    new_input.append('   GridBasedAIM\n')
    new_input.append('       Enabled Yes\n')
    new_input.append('   End\n')

    new_input.append('    DOS\n')
    new_input.append('      CalcPDOS Yes\n')
    new_input.append('    End\n')

    new_input.append('    BZPath\n')
    new_input.extend(k_path)
    new_input.append('\n')
    new_input.append('    End\n')

    new_input.append('NumericalQuality Normal\n')

    new_input.append('   XC\n')
    new_input.append('       SpinOrbitMagnetization CollinearZ\n')
    new_input.append('       LibXC r2SCAN\n')
    new_input.append('       DISPERSION GRIMME4\n')
    new_input.append('    End\n')
    new_input.append('EndEngine\n\n')

    base_path = os.path.basename(file_path).split(".")[0]
    os.makedirs(base_path, exist_ok=True)
    save_path = os.path.join(base_path, f"{base_path}.run")

    read_writer.put_contents(save_path, new_input)
    os.chmod(save_path, 0o755)










