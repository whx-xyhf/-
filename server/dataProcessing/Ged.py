import networkx as nx
from ged4py.algorithm import graph_edit_dist

def getGed(edges1,edges2,nodes1,nodes2):
    g1=nx.Graph()
    g2=nx.Graph()
    nodeMap = {}
    commonNodes=list(set(nodes1).intersection(set(nodes2)))
    for i in range(len(commonNodes)):
        nodeMap[commonNodes[i]]=i
    nodeMap1=nodeMap
    nodeMap2 =nodeMap
    cha1=list(set(nodes1).difference(set(commonNodes)))
    cha2 = list(set(nodes2).difference(set(commonNodes)))
    for i in range(len(cha1)):
        nodeMap1[cha1[i]]=i+len(commonNodes)
    for i in range(len(cha2)):
        nodeMap2[cha2[i]]=i+len(commonNodes)
    newEdges1=[[nodeMap1[i[0]],nodeMap1[i[1]]] for i in edges1]
    newEdges2=[[nodeMap2[i[0]],nodeMap2[i[1]]] for i in edges2]
    g1.add_edges_from(newEdges1)
    g2.add_edges_from(newEdges2)
    return graph_edit_dist.compare(g1,g2)