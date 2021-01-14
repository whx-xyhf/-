#划分子网
import community
import networkx as nx
import csv
import json
from datetime import datetime
import os
import shutil

def readGraph(url):#读取原始数字大图
    edges = []
    with open(url,'r',encoding='utf-8') as fr:
        reader=csv.reader(fr)
        index=0
        for line in reader:
            if index!=0 :
                line[0]=int(line[0])
                line[1]=int(line[1])
                line[2]=int(line[2])
                edges.append(line)
            index+=1
    G=nx.Graph()
    # print(edges)
    G.add_weighted_edges_from(edges)
    # print(G.edges())
    return G,edges

def getFeatures(G,edges):
    nodes=list(G.nodes())
    nodesDic=dict.fromkeys(nodes)
    for edge in edges:
        if nodesDic[edge[0]]!=None:
            nodesDic[edge[0]]+=edge[2]
        if nodesDic[edge[0]]==None:
            nodesDic[edge[0]] = edge[2]
        if nodesDic[edge[1]]!=None:
            nodesDic[edge[1]]+=edge[2]
        if nodesDic[edge[1]]==None:
            nodesDic[edge[1]] = edge[2]
    return nodesDic

def getCommunities(G):
    communities = community.best_partition(G)
    # count=len(set(communities.values()))
    # print(communities)
    # with open(url,'w',encoding='utf-8') as fw:
    #     json.dump(communities,fw)
    #     print("共个"+str(count)+"社区")
    return communities

def getSubGraphNodes(communities,G,value):
    """
    :param communities: 社区发现结果
    :param G: 待分割的图
    :param value: 每个子图点数量阈值
    :return: 每个社区所包含的点
    """
    subGraphNodes = {}
    # 提取每个社区包含的点
    for i in communities:
        if communities[i] in subGraphNodes:
            subGraphNodes[communities[i]].append(i)
        else:
            subGraphNodes[communities[i]] = [i]
    # 判断划分的社区点数量是否符合标准，不符合则继续划分

    for key in subGraphNodes:
        if len(subGraphNodes[key]) > value:
            subGraph = G.subgraph(subGraphNodes[key])
            subGraphNodes[key]=getSubGraphNodes(getCommunities(subGraph),subGraph,value)
    return subGraphNodes

def del_file(filepath):
    """
    删除文件夹重新创立
    :param filepath: 路径
    :return:
    """
    if os.path.isdir(filepath):
        # os.rmdir(filepath)
        shutil.rmtree(filepath)
        os.makedirs(filepath)
    elif os.path.exists(filepath)==False:
        os.makedirs(filepath)

def saveSubGraph(G,subGraphNodes,features,url,index):
    subGraphArray = [];
    for key in subGraphNodes:
        if isinstance(subGraphNodes[key],list):
            subGraph = G.subgraph(subGraphNodes[key])
            subEdges = list(subGraph.edges())
            subNodes = list(subGraph.nodes())
            subGraphArray.append({'id': index, 'nodes': subNodes, 'edges': subEdges})
            with open(url + str(index) + ".json", 'w', encoding="utf-8") as fw:
                output = {"edges": subEdges, "features": {}}
                for node in subNodes:
                    output["features"][node] = features[node]
                json.dump(output, fw)
        elif isinstance(subGraphNodes[key],dict):
            value1,value2=saveSubGraph(G,subGraphNodes[key],features,url,index)
            subGraphArray.extend(value1)
            index=value2-1
        index+=1
    return subGraphArray,index
    # with open(filePath, 'w', encoding='utf-8') as fw:
    #     json.dump(subGraphArray, fw)

def getSubGraphs(G,value,features,url,index):
    """
        提取子图
        :param G:大图 value:每个子图点的数量阈值 features:点的特征值 url: 子图存储文件夹 filePath：子图文件名（所有子图放一起）index:子图id起点命名
        :return:
    """
    subGraphNodes=getSubGraphNodes(getCommunities(G),G,value)

    #根据社区构建子图
    subGraphArray,index1=saveSubGraph(G,subGraphNodes,features,url,index);

    print("子图数量："+str(len(subGraphArray))+' '+str(index1-index))
    return subGraphArray,index1
    # print("子图提取完毕")



if __name__=="__main__":
    start = datetime.now()
    yearPath = ''
    time_interval=2
    dirPath='./data/paper/'
    num_net_fileName='orignNetNum.csv'
    community_fileName='communities.json'
    subGraphs_fileName='subGraphs'+'_'+str(time_interval)+'.json'
    subGraphs_dirName='subGraphs'+'_'+str(time_interval)
    value=30#子图最大点数
    number = 0
    index=1
    out=[]
    # 清除子图存储文件夹
    del_file(dirPath+subGraphs_dirName+'/')
    for year in range(2000,2021):
        number += 1
        if number == time_interval:
            number=0
            if time_interval == 1:
                yearPath = str(year)
            else:
                year_end = int(year) + time_interval
                yearPath = str(year) + '-' + str(year_end)
            print(yearPath)
            G,edges=readGraph(dirPath+yearPath+'/'+num_net_fileName)
            features=getFeatures(G,edges)
            subGraphArray,index=getSubGraphs(G,value,features, dirPath+subGraphs_dirName+'/',index)
            out.extend(subGraphArray)
            # print(index)
    with open(dirPath+subGraphs_fileName,'w',encoding='utf-8') as fw:
        json.dump(out,fw)
    end = datetime.now()
    print("用时" + str((end - start).seconds) + "秒！！！")
