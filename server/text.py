
# import networkx as nx
# g=nx.Graph()
# g.add_edge(1,2)
# g2=nx.Graph()
# g2.add_edge(5,6)
#
#
#
# from ged4py.algorithm import graph_edit_dist
# print(graph_edit_dist.compare(g,g2))
# print(nx.graph_edit_distance(g,g2))

import json
with open('/Pitt_Quantum_Repository_Data.json/Pitt_Quantum_Repository_Data.json','r') as fr:
    data=json.load(fr)
    print(len(data))