#聚类
import json
from sklearn.cluster import DBSCAN
import matplotlib.pyplot as plt
import numpy as np
import os
def loadDataSet(fileName):
    """
    输入：文件名
    输出：数据集
    描述：从文件读入数据集
    """
    dataSet = []
    ids=[]
    if type(fileName)==str:
        with open(fileName,'r') as fr:
            data=json.load(fr)
        for i in data:
            dataSet.append([float(data[i]['x']),float(data[i]['y'])])
            ids.append(i)
    else:
        data=fileName
        for i in data:
            dataSet.append([float(data[i]['x']),float(data[i]['y'])])
            ids.append(i)
    return data,dataSet,ids

def plotFeature(data, clusters, clusterNum):
    nPoints = data.shape[1]
    matClusters = np.mat(clusters).transpose()
    fig = plt.figure()
    scatterColors = ['black', 'blue', 'green', 'yellow', 'red', 'purple', 'orange', 'brown']
    ax = fig.add_subplot(111)
    for i in range(clusterNum + 1):
        colorSytle = scatterColors[i % len(scatterColors)]
        subCluster = data[:, np.nonzero(matClusters[:, 0].A == i)]
        ax.scatter(subCluster[0, :].flatten().A[0], subCluster[1, :].flatten().A[0], c=colorSytle, s=1)

def runDBSCAN(dirPath,dimensions,strWeight,attrWeight,attrStr,eps,min_samples,time_interval=1):
    data, points, ids = loadDataSet(
        dirPath + 'vectors2d_' + str(time_interval) + '_' + str(dimensions) + '_' + str(strWeight) + '_' + str(
            attrWeight) + '_' + attrStr + '.json')
    clustering = DBSCAN(eps=eps, min_samples=min_samples).fit(points)
    labels = set(clustering.labels_)
    # pointsM=np.mat(points).transpose()
    # plotFeature(pointsM,clustering.labels_,len(labels))
    # plt.show()
    dic = {}
    for label in labels:
        dic[str(label)] = []
    index = 0
    for label in clustering.labels_:
        dic[str(label)].append(ids[index])
        index += 1
    with open(dirPath + 'cluster_points_' + str(time_interval) + '_' + str(dimensions) + '_' + str(strWeight) + '_' + str(
            attrWeight) + '_' + attrStr + '.json', 'w') as fw:  # 每个标签有哪些点
        json.dump(dic, fw)
    out = {}
    for k in range(len(ids)):
        out[ids[k]] = {'id': ids[k], 'cluster': int(clustering.labels_[k])}
    for k in data:
        data[k]['cluster'] = out[k]['cluster']
    with open(dirPath + 'vectors2d_' + str(time_interval) + '_' + str(dimensions) + '_' + str(strWeight) + '_' + str(
            attrWeight) + '_' + attrStr + '.json', 'w') as fw:
        json.dump(data, fw)

    if os.path.exists(dirPath + 'dbscanParameter.json'):
        with open(dirPath + 'dbscanParameter.json', 'r') as fr:
            parameter = json.load(fr)
            flag=False
            for p in parameter:
                if p['dimensions'] == dimensions and p['strWeight'] == strWeight and p['attrWeight'] == attrWeight and p[
                    'attrStr'] == attrStr:
                    p['eps'] = eps
                    p['min_samples'] = min_samples
                    flag=False
                    break
            if flag:
                parameter.append({"dimensions": dimensions, 'strWeight': strWeight, 'attrWeight': attrWeight, 'attrStr': attrStr, 'eps': eps,
                          'min_samples': min_samples})
            with open(dirPath + 'dbscanParameter.json', 'w') as fw:
                json.dump(parameter, fw)
    else:
        with open(dirPath + 'dbscanParameter.json', 'w') as fw:
            parameter = [{"dimensions": dimensions, 'strWeight': strWeight, 'attrWeight': attrWeight, 'attrStr': attrStr, 'eps': eps,
                          'min_samples': min_samples}]
            json.dump(parameter, fw)

    print("聚类完成！！！")
    print("共" + str(len(labels)) + "类")
    return data

def reDBSCAN(points,ids,eps,min_samples):
    clustering = DBSCAN(eps=eps, min_samples=min_samples).fit(points)
    labels = set(clustering.labels_)
    # pointsM=np.mat(points).transpose()
    # plotFeature(pointsM,clustering.labels_,len(labels))
    # plt.show()
    dic = {}
    for label in labels:
        dic[str(label)] = []
    index = 0
    for label in clustering.labels_:
        dic[str(label)].append(ids[index])
        index += 1
    out = {}
    for k in range(len(ids)):
        out[ids[k]] = {"x": str(points[0]), "y": str(points[1]) ,'cluster': int(clustering.labels_[k])}

    print("聚类完成！！！")
    print("共" + str(len(labels)) + "类")
    return out,dic



if __name__ == '__main__':
    print("正在进行dbscan聚类！！！")
    dirPath = './data/Family/'
    weight=[[1,1]]
    time_interval = 1
    dimensions = 128
    attrStr=['11111']
    eps=5
    min_samples=10
    for i in weight:
        for j in attrStr:
            runDBSCAN(dirPath,dimensions,i[0],i[1],j,eps,min_samples,1)