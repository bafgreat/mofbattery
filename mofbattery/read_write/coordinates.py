import numpy as np
import torch
from torch_geometric.data import Data
from ase.io import read
from mofstructure import mofdeconstructor
from ase import Atoms, Atom

def get_pairwise_connections(graph):
    """
    Extract unique pairwise connections from an
    adjacency dictionary efficiently.

    **Parameters**
        graph (dict):
            An adjacency dictionary where keys are nodes
            and values are arrays or lists of nodes
            representing neighbors.

    **returns**
        list of tuple
            A list of unique pairwise connections,
            each represented as a tuple (i, j) where i < j.

    """
    pairwise_connections = []
    seen = set()

    for node, neighbors in graph.items():
        for neighbor in neighbors:
            edge = (min(node, neighbor), max(node, neighbor))
            if edge not in seen:
                seen.add(edge)
                pairwise_connections.append(edge)
    return pairwise_connections


def calculate_distances(pair_indices, ase_atoms, mic=True):
    """
    Calculate distances between pairs of atoms in an ase atoms object.
    """
    return np.array([
        ase_atoms.get_distance(pair[0], pair[1], mic=mic)
        for pair in pair_indices])


def ase_to_pytorch_geometric(input_system):
    """
    Convert an ASE Atoms object to a PyTorch Geometric graph

    **parameters**
        input_system (ASE.Atoms or ASE.Atom or filename):
        The input system to be converted.

    **returns**
        torch_geometric.data.Data: The converted PyTorch Geometric Data object.
    """

    if isinstance(input_system, Atoms) or isinstance(input_system, Atom):
        ase_atoms = input_system
    else:
        ase_atoms = read(input_system)
    mic = ase_atoms.pbc.any()
    if mic:
        lattice_parameters = torch.tensor(np.array(ase_atoms.cell),
                                          dtype=torch.float
                                          )
    else:
        lattice_parameters = torch.tensor(np.zeros((3, 3)),
                                          dtype=torch.float
                                          )

    graph, _ = mofdeconstructor.compute_ase_neighbour(ase_atoms)
    pair_connection = np.array(get_pairwise_connections(graph))
    distances = calculate_distances(pair_connection, ase_atoms, mic)
    nodes = np.array([[atom.number, *atom.position] for atom in ase_atoms])

    node_features = torch.tensor(nodes, dtype=torch.float)
    edge_index = torch.tensor(pair_connection,
                              dtype=torch.long).t().contiguous()
    edge_attr = torch.tensor(distances,
                             dtype=torch.float).unsqueeze(1)
    data = Data(x=node_features,
                edge_index=edge_index,
                edge_attr=edge_attr,
                lattice=lattice_parameters)
    return data

def pytorch_geometric_to_ase(data):
    """
    Convert a PyTorch Geometric Data object back to an ASE Atoms object.

    **Parameters**
        data (torch_geometric.data.Data): The PyTorch Geometric Data object.

    **Returns**
        ase_atoms (ase.Atoms): The converted ASE Atoms object.
    """
    node_features = data.x.numpy() if isinstance(data.x,
                                                 torch.Tensor) else data.x
    atomic_numbers = node_features[:, 0].astype(int)
    positions = node_features[:, 1:4]

    lattice = data.lattice.numpy() if isinstance(data.lattice,
                                                 torch.Tensor
                                                 ) else data.lattice

    ase_atoms = Atoms(
        numbers=atomic_numbers,
        positions=positions,
        cell=lattice,
        pbc=(lattice.any())
    )

    return ase_atoms
