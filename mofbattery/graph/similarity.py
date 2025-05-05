import torch
import torch.nn.functional as F
from torch.nn import Linear, Module
from torch_geometric.data import Data
from torch_geometric.nn import GCNConv, global_mean_pool
from networkx.algorithms.similarity import graph_edit_distance
import networkx as nx
from torch_geometric.utils import to_networkx


class GNNEncoder(Module):
    """
    A simple Graph Neural Network (GNN) encoder using two GCN layers
    followed by global mean pooling and a linear layer.
    Used to obtain a fixed-size embedding of an input graph.

    Parameters:
        in_channels (int): Number of input node features.
        hidden_channels (int): Number of hidden units.
        out_channels (int): Dimension of output embedding vector.
    """

    def __init__(self, in_channels, hidden_channels, out_channels):
        super().__init__()
        self.conv1 = GCNConv(in_channels, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, hidden_channels)
        self.lin = Linear(hidden_channels, out_channels)

    def forward(self, x, edge_index, batch):
        """
        Forward pass through the GNN encoder.

        Parameters:
            x (Tensor): Node feature matrix [num_nodes, in_channels].
            edge_index (LongTensor): Edge indices [2, num_edges].
            batch (LongTensor): Batch vector [num_nodes] to group nodes into graphs.

        Returns:
            Tensor: Graph-level embedding vector [batch_size, out_channels].
        """
        x = F.relu(self.conv1(x, edge_index))
        x = F.relu(self.conv2(x, edge_index))
        x = global_mean_pool(x, batch)
        return self.lin(x)


class GraphSimilarityCalculator:
    """
    A class for computing similarity between two graphs represented as
    PyTorch Geometric Data objects using different methods.

    Methods:
        - cosine: Cosine similarity on padded flattened node features.
        - edit_distance: Graph edit distance similarity using NetworkX.
        - gnn: GNN-based graph embedding cosine similarity.
    """

    def __init__(self, gnn_in=4, gnn_hidden=32, gnn_out=16):
        """
        Initialize the GraphSimilarityCalculator.

        Parameters:
            gnn_in (int): Number of input features per node.
            gnn_hidden (int): Number of hidden features in GNN layers.
            gnn_out (int): Output embedding dimension from GNN.
        """
        self.gnn_encoder = GNNEncoder(gnn_in, gnn_hidden, gnn_out)

    @staticmethod
    def _pad_features(x1, x2):
        """
        Pad and flatten node feature vectors to the same length.

        Parameters:
            x1 (Tensor): Node feature tensor from graph 1.
            x2 (Tensor): Node feature tensor from graph 2.

        Returns:
            Tuple[Tensor, Tensor]: Padded and flattened tensors.
        """
        x1 = x1.view(-1)
        x2 = x2.view(-1)
        max_len = max(len(x1), len(x2))
        x1 = F.pad(x1, (0, max_len - len(x1)))
        x2 = F.pad(x2, (0, max_len - len(x2)))
        return x1, x2

    def cosine_similarity(self, g1: Data, g2: Data) -> float:
        """
        Compute cosine similarity between two graphs using flattened node features.

        Parameters:
            g1 (Data): First graph.
            g2 (Data): Second graph.

        Returns:
            float: Cosine similarity in [0, 1].
        """
        x1, x2 = self._pad_features(g1.x, g2.x)
        return F.cosine_similarity(x1.unsqueeze(0), x2.unsqueeze(0)).item()

    def edit_distance_similarity(self, g1: Data, g2: Data) -> float:
        """
        Compute similarity using normalized graph edit distance.

        Parameters:
            g1 (Data): First graph.
            g2 (Data): Second graph.

        Returns:
            float: Normalized similarity in [0, 1].
        """
        G1 = to_networkx(g1, to_undirected=True)
        G2 = to_networkx(g2, to_undirected=True)

        try:
            ged = graph_edit_distance(G1, G2)
            max_nodes = max(G1.number_of_nodes(), G2.number_of_nodes())
            return 1.0 - min(ged / max_nodes, 1.0)
        except Exception as e:
            print(f"Edit distance failed: {e}")
            return 0.0

    def gnn_embedding_similarity(self, g1: Data, g2: Data) -> float:
        """
        Compute similarity using cosine similarity between GNN graph embeddings.

        Parameters:
            g1 (Data): First graph.
            g2 (Data): Second graph.

        Returns:
            float: Cosine similarity in [0, 1].
        """
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.gnn_encoder.to(device)
        self.gnn_encoder.eval()

        g1 = g1.to(device)
        g2 = g2.to(device)

        batch1 = torch.zeros(g1.num_nodes, dtype=torch.long, device=device)
        batch2 = torch.zeros(g2.num_nodes, dtype=torch.long, device=device)

        with torch.no_grad():
            emb1 = self.gnn_encoder(g1.x, g1.edge_index, batch1)
            emb2 = self.gnn_encoder(g2.x, g2.edge_index, batch2)

        return F.cosine_similarity(emb1, emb2).item()

    def compute(self, g1: Data, g2: Data, method='cosine') -> float:
        """
        Compute graph similarity using the specified method.

        Parameters:
            g1 (Data): First graph.
            g2 (Data): Second graph.
            method (str): Similarity method. One of 'cosine', 'edit_distance', or 'gnn'.

        Returns:
            float: Similarity score.
        """
        if method == 'cosine':
            return self.cosine_similarity(g1, g2)
        elif method == 'edit_distance':
            return self.edit_distance_similarity(g1, g2)
        elif method == 'gnn':
            return self.gnn_embedding_similarity(g1, g2)
        else:
            raise ValueError(f"Unknown method: {method}. Choose from 'cosine', 'edit_distance', or 'gnn'.")
