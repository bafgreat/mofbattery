import os
import json
import json
import gzip
import numpy as np
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

