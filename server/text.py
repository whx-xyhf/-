
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
# import numpy as np
# a=[[1,2,3],[4,5,6],[7,8,9]]
# b=[[1,2,3],[4,5,3]]
# a=np.mat(a)
# b=np.mat(b)
# print(b[:,2])
# # a=a/2
# # c=a+b
# # print(c)
# a='123'
# for i in range(len(a)):
#     print(i)

from sklearn.metrics.pairwise import euclidean_distances
import numpy as np
a=[[1,2,3],[4,5,6]]
b=[[1,2,3],[4,5,6]]
c=[['1','2','3']]
f=[[1,2,3],[4,5,6],[1,2,3]]
a=np.mat(a)
d=euclidean_distances(a, b)
e=euclidean_distances(a, c)
y=np.append(e,0)
x=euclidean_distances(f, f)
# print(d)
print(e)
e=e.tolist()
print(e)
e.append([0])
e=np.mat(e)
print(e)
print(e.shape)
e=e.reshape(1,e.shape[0])
print(e)
print(np.r_[a,e])
