import networkx as nx
from ged4py.algorithm import graph_edit_dist

def getGed(edges1,edges2):
    g1=nx.Graph()
    g2=nx.Graph()
    g1.add_edges_from(edges1)
    g2.add_edges_from(edges2)
    return graph_edit_dist.compare(g1,g2)