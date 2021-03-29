import networkx as nx
from ged4py.algorithm import graph_edit_dist
from dataProcessing.gedNew import GraphEditDistance
import networkx as nx
import copy
from zss import simple_distance, Node
import json

def getModel(edges):
    newList = []
    data = {}
    for i in edges:
        if i[0] not in newList:
            newList.append(i[0])
        if i[1] not in newList:
            newList.append(i[1])

    for i in range(len(newList)):
        data[newList[i]] = Node(i)
    for edge in edges:
        data[edge[0]].addkid(data[edge[1]])
    if len(newList)==0:
        return Node(0)
    else:
        return data[0]

def getTed(edges1,edges2):
    return simple_distance(getModel(edges1),getModel(edges2))


def getGed(edges1,edges2,nodes1,nodes2):
    g1=nx.Graph()
    g2=nx.Graph()
    g1_=nx.Graph()
    g2_=nx.Graph()
    g1_.add_edges_from(edges1)
    g2_.add_edges_from(edges2)

    nodeMap = {}
    commonNodes=list(set(nodes1).intersection(set(nodes2)))

    for i in range(len(commonNodes)):
        nodeMap[commonNodes[i]]=i
    nodeMap1=copy.copy(nodeMap)
    nodeMap2 =copy.copy(nodeMap)
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
    ged = GraphEditDistance(g1, g2)
    dist = ged.normalized_distance()
    # return graph_edit_dist.compare(g1,g2)
    return dist