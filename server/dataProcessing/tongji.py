import json
import random
import math
from dataProcessing.Ged import getGed
import numpy as np
import matplotlib.pyplot as plt
import os
from zss import simple_distance, Node

def getJson(url): #读取原始数据
    data = {}
    with open(url, 'r',encoding='utf-8') as fr:
        data=json.load(fr)

    return data

def getTreeNodes(tree):
    if 'id' in tree.keys():
        node = tree['id']
    elif 'name' in tree.keys():
        node = tree['name']
    nodes=[node]
    if 'children' in tree.keys():
        for i in range(len(tree['children'])):
            nodes.extend(getTreeNodes(tree['children'][i]))
    else:return nodes
    return nodes

def getTreeEdges(tree):
    edges=[]
    if 'id' in tree.keys():
        node=tree['id']
    elif 'name' in tree.keys():
        node=tree['name']
    if 'children' in tree.keys():
        for i in range(len(tree['children'])):
            edges.append([node,tree['children'][i]['name']])
            edges.extend(getTreeEdges(tree['children'][i]))
    else:return edges
    return edges


def run(dataType,dir,sampleNum,matchNum,dimensions,weight,dimensionsAttrChecked):

    graphs = getJson('./data/'+dataType+'/subGraphs_1.json')
    sampleNode = []
    index = 0;
    while index < sampleNum:
        sample = random.randint(1, len(graphs))
        if sample not in sampleNode:
            sampleNode.append(graphs[sample]['id'])
            index += 1

    graphsEgdes = {}
    attrNames = []
    if dataType=="Author":
        for i in graphs:
            graphsEgdes[str(i['id'])] = {'edges': i['edges'], 'attr': i['attr'], 'nodes': i['nodes']}
    else:
        for i in graphs:
            edges=getTreeEdges(i)
            nodes=getTreeNodes(i)
            if len(edges)==0:
                edges=[[nodes[0],nodes[0]]]
            graphsEgdes[str(i['id'])] = {'edges': edges, 'attr': i['attr'], 'nodes': nodes}

    for i in graphs[0]['attr']:
        attrNames.append(i)

    gedValueMeanEveryWeight = []  # 每个权重下ged均值
    gedValueStdEveryWeight = []  # 每个权重下ged方差
    attrEveryWeight = {}
    for name in attrNames:
        attrEveryWeight[name] = []
    for i in weight:

        data = getJson('./data/'+dataType+'/vectors2d_1_' + str(dimensions) + '_' + str(i[0]) + '_' + str(i[1])+'_'+dimensionsAttrChecked+'.json')

        # 每个样本
        gedValueMeanEverySample = []  # 每个样本ged均值
        gedValueStdEverySample = []  # 每个样本ged方差
        attrEverySample = {}
        for name in attrNames:
            attrEverySample[name] = []
        for j in sampleNode:
            sourceX = float(data[str(j)]['x'])
            sourceY = float(data[str(j)]['y'])
            sourceEdges = graphsEgdes[str(j)]['edges']
            sourceNodes = graphsEgdes[str(j)]['nodes']
            sourceAttr = graphsEgdes[str(j)]['attr']

            data2 = []
            for key in data:
                targetX = float(data[key]['x'])
                targetY = float(data[key]['y'])
                distance = math.sqrt(math.pow(targetX - sourceX, 2) + math.pow(targetY - sourceY, 2))
                data2.append({'id': key, 'x': targetX, 'y': targetY, 'distance': distance})
            matchGraphs = sorted(data2, key=lambda x: x['distance'])[1:matchNum + 1]
            # print(matchGraphs)
            gedValue = []
            attrValue = {}
            for name in attrNames:
                attrValue[name] = []

            for graph in matchGraphs:
                targetEdges = graphsEgdes[graph['id']]['edges']
                targetNodes = graphsEgdes[graph['id']]['nodes']
                targetAttr = graphsEgdes[graph['id']]['attr']
                ged = getGed(sourceEdges, targetEdges, sourceNodes, targetNodes)
                gedValue.append(ged)
                for name in attrNames:
                    attrValue[name].append(abs(targetAttr[name] - sourceAttr[name]))
            gedValueMeanEverySample.append(np.mean(np.array(gedValue)))
            gedValueStdEverySample.append(np.std(np.array(gedValue)))
            for name in attrNames:
                attrEverySample[name].append(np.mean(np.array(attrValue[name])))
        gedValueMeanEveryWeight.append(np.mean(np.array(gedValueMeanEverySample)))
        gedValueStdEveryWeight.append(np.std(np.array(gedValueStdEverySample)))
        for name in attrNames:
            attrEveryWeight[name].append(np.mean(np.array(attrEverySample[name])))


    filepath='./data/'+dataType+'/images/'+dimensionsAttrChecked+'/' + str(dir) + '/'
    if os.path.exists(filepath)==False:
        os.makedirs(filepath)
    y_data_mean = np.array(gedValueMeanEveryWeight)
    print(y_data_mean)
    y_data_std = np.array(gedValueStdEveryWeight)
    x_data = np.array([i[0] for i in weight])
    plt.legend(loc="upper right")  # 显示图例
    plt.xlabel('Str Weight')
    plt.ylabel('Ged Value')
    plt.plot(x_data, y_data_mean, color='red', linewidth=2, label="Ged Mean", marker="o", markerfacecolor='red')
    # plt.plot(x_data, y_data_std,color='blue', linewidth=2,label="Ged Std",marker = "o" ,markerfacecolor = 'Orange')
    plt.savefig('./data/'+dataType+'/images/'+dimensionsAttrChecked+'/' + str(dir) + "/GedMean.png")
    plt.close()

    x_data = np.array([i[1] for i in weight])

    for name in attrNames:
        y_data_mean = np.array(attrEveryWeight[name])
        plt.xlabel('Attr Weight')
        plt.ylabel(name)
        plt.plot(x_data, y_data_mean, color='red', linewidth=2, marker="o", markerfacecolor='red')
        plt.savefig("./data/"+dataType+"/images/"+dimensionsAttrChecked+'/' + str(dir) + "/" + name + ".png")
        plt.close()

if __name__=="__main__":
    dataType="Family"
    dir=5
    sampleNum = 50
    matchNum = 10
    dimensions = 128
    dimensionsAttrChecked = '11000'
    weight = [[1, 0], [0.8, 0.2],  [0.2, 0.8], [0, 1]]
    for i in range(dir):
        print(i)
        run(dataType,i,sampleNum,matchNum,dimensions,weight,dimensionsAttrChecked)