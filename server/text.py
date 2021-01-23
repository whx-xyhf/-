
import networkx as nx
g=nx.Graph()
g.add_edge("A","B")
g2=g.copy()
g.add_edge("A","C")
from ged4py.algorithm import graph_edit_dist
print(graph_edit_dist.compare(g,g2))