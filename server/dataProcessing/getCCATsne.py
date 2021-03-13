#向量降维
import csv
import json
from datetime import datetime
from sklearn.manifold import TSNE
import math
import numpy as np
import re
from dataProcessing.tongji import run
from sklearn.metrics.pairwise import euclidean_distances
from sklearn.cross_decomposition import CCA

#分割向量
def divideVectorsToStrAndAttr(vectors,dimensionsStr,dimensionsAttrChecked):
    vectors=np.mat(vectors)
    print(vectors.shape)
    selectAttrIndexList=list(i.start()+dimensionsStr for i in re.finditer('1', dimensionsAttrChecked))
    vectorsStr = vectors[:,:dimensionsStr]
    vectorsAttr = vectors[:,selectAttrIndexList]
    return vectorsStr,vectorsAttr

def getTSNE(dirPath,dimensionsStr=128,dimensionsAttrChecked='111111',strWeight=0.5,attrWeight=0.5,saveFile=False):
    '''
    :param dirPath:数据存储目录
    :param dimensionsStr: 结构向量维度
    :param dimensionsAttrChecked:哪些属性用于降维
    :param strWeight: 结构向量权重
    :param attrWeight: 属性向量权重
    :param saveFile:是否保存文件
    :param saveStrDistance:是否将结构距离矩阵保存成文件
    :param readStrDistance:是否从文件中读取结构距离矩阵
    :param saveDir:保存目录
    :param readDir:读取目录
    :return: 点的二维向量
    '''
    start = datetime.now()
    vectors = []
    id = []
    time_interval = 1
    dimensionsAttr=dimensionsAttrChecked.count("1")
    with open(dirPath + 'vectors_' + str(time_interval) + '_' + str(dimensionsStr) + '.csv', 'r') as fr:
        data = csv.reader(fr)
        index = 0
        for i in data:
            if index != 0:
                id.append(str(i[0]))
                del (i[0])
                if dimensionsAttr==0:
                    vector=[]
                    for j in range(len(dimensionsAttrChecked)):
                        if dimensionsAttrChecked[j]=='1':
                            vector.append(i[dimensionsStr+j])
                    vectors.append(vector)
                else:
                    i=list(map(float,i))
                    vectors.append(i)
            index += 1
    if dimensionsAttr!=0:
        vectorStr,vectorAttr=divideVectorsToStrAndAttr(vectors,dimensionsStr,dimensionsAttrChecked)
        cca = CCA(n_components=dimensionsAttr)
        cca.fit(vectorStr, vectorAttr)
        vectorStr_c, vectorAttr_c = cca.transform(vectorStr, vectorAttr)
        vectorStr_c=np.mat(vectorStr_c)
        vectorAttr_c=np.mat(vectorAttr_c)
        print('start tsne')
        tsne = TSNE(method='barnes_hut',angle=0.2, n_iter=1000)
        data_tsne = tsne.fit_transform(np.c_[vectorStr_c,vectorAttr_c])
    else:
        print('start tsne')
        tsne = TSNE(method='barnes_hut', angle=0.2, n_iter=1000)
        data_tsne = tsne.fit_transform(vectors)


    index = 0
    outdata = {}
    for vector in data_tsne:
        outdata[id[index]]={ "x": str(vector[0]), "y": str(vector[1])}
        index += 1
    if saveFile:
        with open(dirPath + 'vectors2d_' + str(time_interval) + '_' + str(dimensionsStr) +'_'+str(strWeight)+'_'+str(attrWeight)+'_'+dimensionsAttrChecked+ '.json', "w") as fr:
            json.dump(outdata, fr)
    end = datetime.now()
    print((end - start).seconds)
    return outdata

def reTsne(modelId,modelVectorStr,modelVectorAttr,dirPath,dimensionsStr=128,dimensionsAttrChecked='111111',strWeight=0.5,attrWeight=0.5,saveFile=False,readDir=''):
    '''
    :param modelId:新加入的id
    :param modelVectorStr:新加入的向量结构部分
    :param modelVectorAttr:新加入的向量属性部分
    :param dirPath:数据存储目录
    :param dimensionsStr: 结构向量维度
    :param dimensionsAttrChecked:哪些属性用于降维
    :param strWeight: 结构向量权重
    :param attrWeight: 属性向量权重
    :param saveFile:是否保存文件
    :param readDir:读取目录
    :return: 点的二维向量
    '''
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
                if attrWeight == 0:
                    vectors.append(i[0:dimensionsStr])
                elif strWeight == 0:
                    vector = []
                    for j in range(len(dimensionsAttrChecked)):
                        if dimensionsAttrChecked[j] == '1':
                            vector.append(i[dimensionsStr + j])
                    vectors.append(vector)
                else:
                    i=list(map(float,i))
                    vectors.append(i)
            index += 1
        id.append(str(modelId))
    if attrWeight == 0:
        tsne = TSNE(method='barnes_hut', angle=0.2, n_iter=1000)
        vectors.append(modelVectorStr)
        data_tsne = tsne.fit_transform(vectors)
    elif strWeight==0:
        tsne = TSNE(method='barnes_hut', angle=0.2, n_iter=1000)
        temp=[]
        for j in range(len(dimensionsAttrChecked)):
            if dimensionsAttrChecked[j] == '1':
                temp.append(modelVectorAttr[j])
        vectors.append(temp)
        data_tsne = tsne.fit_transform(vectors)
    else:
        modelVectorStr=list(map(float,modelVectorStr))
        modelVectorAttr=list(map(float,modelVectorAttr))
        dimensionsAttr = dimensionsAttrChecked.count('1')
        modelVectorStr.extend(modelVectorAttr)
        vectors.append(modelVectorStr)
        vectorsStr,vectorsAttr=divideVectorsToStrAndAttr(vectors,dimensionsStr,dimensionsAttrChecked)
        distanceMatrixStr=np.sqrt(euclidean_distances(vectorsStr,vectorsStr)/dimensionsStr)*strWeight
        distanceMatrixAttr=np.sqrt(euclidean_distances(vectorsAttr,vectorsAttr)/dimensionsAttr)*attrWeight
        distanceMatrix=distanceMatrixStr+distanceMatrixAttr
        # modelDistanceStr=np.sqrt(euclidean_distances(vectorsStr,[modelVectorStr])/dimensionsStr)*strWeight
        # modelDistanceAttr=np.sqrt(euclidean_distances(vectorsAttr,[modelVectorAttr])/dimensionsAttr)*attrWeight
        # modelDistance=modelDistanceStr+modelDistanceAttr
        # distanceMatrix=np.c_[distanceMatrix,modelDistance]
        # modelDistance=modelDistance.tolist()
        # modelDistance.append([0])
        # modelDistance=np.mat(modelDistance)
        # modelDistance = modelDistance.reshape(1, modelDistance.shape[0])
        # distanceMatrix=np.r_[distanceMatrix,modelDistance]

        tsne = TSNE(metric='precomputed', method='barnes_hut', angle=0.2, n_iter=1000)
        data_tsne = tsne.fit_transform(distanceMatrix)

    index = 0
    outdata = {}
    for vector in data_tsne:
        outdata[id[index]] = {"x": str(vector[0]), "y": str(vector[1])}
        index += 1
    if saveFile:
        with open(dirPath + 'vectors2d_' + str(time_interval) + '_' + str(dimensionsStr) + '_' + str(
                strWeight) + '_' + str(attrWeight) + '_' + dimensionsAttrChecked +'model'+modelId+ '.json', "w") as fr:
            json.dump(outdata, fr)
        return outdata


if __name__=='__main__':
    data=[[1,0]]
    data2=['111111']
    dataType='Author'
    dirPath='./data/'+dataType+'/'
    for j in data2:
        for i in data:
            print(i)
            getTSNE(dirPath=dirPath, dimensionsStr=128, dimensionsAttrChecked=j, strWeight=i[0], attrWeight=i[1],
                    saveFile=True)
