#向量降维
import csv
import json
from datetime import datetime
from sklearn.manifold import TSNE
import math
import numpy as np




def getDistance(vectors,dimensionsStr,dimensionsAttr,a,b):
    '''
    :param vectors: 待计算的向量
    :param attrIndex: 属性向量开始的下标
    :param a: 拓扑向量的权重
    :param b: 属性向量的权重
    :return: 距离矩阵
    '''
    distanceMatrix=[]
    for vector1 in vectors:
        distanceArr=[]
        for vector2 in vectors:
            distanceStr=0
            distanceAttr=0
            for index in range(len(vector1)):
                if index<dimensionsStr:
                    distanceStr += math.pow(float(vector1[index])-float(vector2[index]),2)
                elif index>=dimensionsStr and index<dimensionsStr+dimensionsAttr:
                    distanceAttr += math.pow(float(vector1[index])-float(vector2[index]),2)
            distanceArr.append(math.sqrt(distanceStr/dimensionsStr)*a+math.sqrt(distanceAttr/dimensionsAttr)*b)
        distanceMatrix.append(distanceArr)
    return np.mat(distanceMatrix)



def getTSNE(dirPath,dimensionsStr=128,dimensionsAttr=5,strWeight=0.5,attrWeight=0.5,saveFile=False):
    '''
    :param dirPath:数据存储目录
    :param dimensions: 结构向量维度
    :param strWeight: 结构向量权重
    :param attrWeight: 属性向量权重
    :param saveFile:是否保存文件
    :return: 点的二维向量
    '''
    start = datetime.now()
    vectors = []
    id = []
    time_interval = 1
    with open(dirPath + 'vectors_' + str(time_interval) + '_' + str(dimensionsStr) + '.csv', 'r') as fr:
        data = csv.reader(fr)
        index = 0
        for i in data:
            if index != 0:
                id.append(str(i[0]))
                del (i[0])
                vectors.append(i)
            index += 1

    tsne = TSNE(metric='precomputed', method='barnes_hut', angle=0.2, n_iter=1000)

    data_tsne = tsne.fit_transform(getDistance(vectors, dimensionsStr,dimensionsAttr, strWeight, attrWeight))

    index = 0
    outdata = {}
    for vector in data_tsne:
        outdata[id[index]]={ "x": str(vector[0]), "y": str(vector[1])}
        index += 1
    if saveFile:
        with open(dirPath + 'vectors2d_' + str(time_interval) + '_' + str(dimensionsStr) +'_'+str(strWeight)+'_'+str(attrWeight)+ '.json', "w") as fr:
            json.dump(outdata, fr)
    end = datetime.now()
    print((end - start).seconds)
    return outdata

if __name__=='__main__':
    data=[[1,0],[0.8,0.2],[0.6,0.4],[0.5,0.5],[0.4,0.6],[0.2,0.8],[0,1]]
    for i in data:
        print(i)
        getTSNE(dirPath = './data/paper/',dimensionsStr=128,dimensionsAttr=5,strWeight=i[0],attrWeight=i[1],saveFile=True)
        # out={}
        # with open('./data/paper/vectors2d_1_128'+'_'+str(i[0])+'_'+str(i[1])+ '.json','r') as fr:
        #     data=json.load(fr)
        # for j in data:
        #     out[j['id']]={'x':j['x'],'y':j['y']}
        # with open('./data/paper/vectors2d_1_128'+'_'+str(i[0])+'_'+str(i[1])+ '.json','w') as fw:
        #     json.dump(out,fw)
