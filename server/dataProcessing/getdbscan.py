#聚类
import json
from sklearn.cluster import DBSCAN
import matplotlib.pyplot as plt
import numpy as np
def loadDataSet(fileName):
    """
    输入：文件名
    输出：数据集
    描述：从文件读入数据集
    """
    dataSet = []
    ids=[]
    with open(fileName,'r') as fr:
        data=json.load(fr)
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

if __name__ == '__main__':
    print("正在进行dbscan聚类！！！")
    dirPath = './data/Family/'
    strWeight=1
    attrWeight=0
    time_interval = 1
    dimensions = 128
    attrStr='11111'
    data,points,ids=loadDataSet(dirPath+'vectors2d_'+str(time_interval)+'_'+str(dimensions)+'_'+str(strWeight)+'_'+str(attrWeight)+'_'+attrStr+'.json')
    clustering = DBSCAN(eps=5, min_samples=0).fit(points)
    labels = set(clustering.labels_)
    # pointsM=np.mat(points).transpose()
    # plotFeature(pointsM,clustering.labels_,len(labels))
    # plt.show()
    dic={}
    subGraphs=[]
    for label in labels:
        dic[str(label)]=[]
    index=0
    for label in clustering.labels_:
        dic[str(label)].append(ids[index])
        index+=1
    with open(dirPath+'cluster_points_'+str(time_interval)+'_'+str(dimensions)+'_'+str(strWeight)+'_'+str(attrWeight)+'_'+attrStr+'.json','w') as fw:#每个标签有哪些点
        json.dump(dic,fw)
    out = {}
    for i in range(len(ids)):
        out[ids[i]]={'id':ids[i],'cluster':int(clustering.labels_[i])}
    for i in data:
        data[i]['cluster']=out[i]['cluster']
    with open(dirPath+'vectors2d_'+str(time_interval)+'_'+str(dimensions)+'_'+str(strWeight)+'_'+str(attrWeight)+'_'+attrStr+'.json','w') as fw:
        json.dump(data,fw)

    print("聚类完成！！！")
    print("共"+str(len(labels))+"类")