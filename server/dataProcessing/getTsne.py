#向量降维
import csv
import json
from datetime import datetime
from sklearn.manifold import TSNE
import math
import numpy as np
from dataProcessing.tongji import run



def getDistance(vectors,dimensionsStr,dimensionsAttrChecked,a,b,saveStrDistance,readStrDistance,saveDir,readDir):
    '''
    :param vectors: 待计算的向量
    :param dimensionsStr: 结构向量维度
    :param dimensionsAttrChecked:哪些属性用于降维
    :param a: 拓扑向量的权重
    :param b: 属性向量的权重
    :param saveStrDistance:是否将结构距离矩阵保存成文件
    :param readStrDistance:是否从文件中读取结构距离矩阵
    :param saveDir:保存目录
    :param readDir:读取目录
    :return: 距离矩阵
    '''
    distanceMatrix=[]
    distanceMatrixStr=[]
    distanceMatrixAttr=[]
    dimensionsAttr=dimensionsAttrChecked.count('1')
    if readStrDistance:
        with open(readDir+'distanceStrMatrix' + '_' + str(dimensionsStr)+'.json','r',encoding='utf-8') as fr:
            distanceMatrixStr=json.load(fr)
        for vector1 in vectors:
            distanceAttrArr = []
            for vector2 in vectors:
                distanceAttr=0
                for index in range(len(vector1)):
                    if index>=dimensionsStr and dimensionsAttrChecked[index-dimensionsStr]=='1':
                        distanceAttr += math.pow(float(vector1[index])-float(vector2[index]),2)
                distanceAttrArr.append(math.sqrt(distanceAttr / dimensionsAttr) * b)
            distanceMatrixAttr.append(distanceAttrArr)
        distanceMatrixStr=np.mat(distanceMatrixStr)*a
        distanceMatrixAttr=np.mat(distanceMatrixAttr)
        distanceMatrix=distanceMatrixStr+distanceMatrixAttr
        return distanceMatrix
    else:
        for vector1 in vectors:
            distanceArr=[]
            distanceStrArr=[]
            for vector2 in vectors:
                distanceStr=0
                distanceAttr=0
                for index in range(len(vector1)):
                    if index<dimensionsStr:
                        distanceStr += math.pow(float(vector1[index])-float(vector2[index]),2)
                    elif index>=dimensionsStr and dimensionsAttrChecked[index-dimensionsStr]=='1':
                        distanceAttr += math.pow(float(vector1[index])-float(vector2[index]),2)
                distanceArr.append(math.sqrt(distanceStr/dimensionsStr)*a+math.sqrt(distanceAttr/dimensionsAttr)*b)
                if saveStrDistance:
                    distanceStrArr.append(math.sqrt(distanceStr/dimensionsStr))
            distanceMatrix.append(distanceArr)
            distanceMatrixStr.append(distanceStrArr)
        if saveStrDistance:
            with open(saveDir+'distanceStrMatrix' + '_' + str(dimensionsStr)+'.json','w') as fw:
                json.dump(distanceMatrixStr,fw)
        return np.mat(distanceMatrix)



def getTSNE(dirPath,dimensionsStr=128,dimensionsAttrChecked='111111',strWeight=0.5,attrWeight=0.5,saveFile=False,saveStrDistance=False,readStrDistance=False,saveDir='',readDir=''):
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
    with open(dirPath + 'vectors_' + str(time_interval) + '_' + str(dimensionsStr) + '.csv', 'r') as fr:
        data = csv.reader(fr)
        index = 0

        for i in data:
            if index != 0:
                id.append(str(i[0]))
                del (i[0])
                if attrWeight==0:
                    vectors.append(i[0:dimensionsStr])
                elif strWeight==0:
                    vector=[]
                    for j in range(len(dimensionsAttrChecked)):
                        if dimensionsAttrChecked[j]=='1':
                            vector.append(i[dimensionsStr+j])
                    vectors.append(vector)
                else:
                    vectors.append(i)
            index += 1

    data_tsne=[]
    if attrWeight==0 or strWeight==0:
        tsne = TSNE(method='barnes_hut',angle=0.2, n_iter=1000)
        data_tsne = tsne.fit_transform(vectors)
    else:
        tsne = TSNE(metric='precomputed', method='barnes_hut', angle=0.2, n_iter=1000)
        data_tsne = tsne.fit_transform(getDistance(vectors, dimensionsStr,dimensionsAttrChecked, strWeight, attrWeight,saveStrDistance,readStrDistance,saveDir,readDir))

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

if __name__=='__main__':
    data=[[1,0],[0.8,0.2],[0.6,0.4],[0.5,0.5],[0.4,0.6],[0.2,0.8],[0,1]]
    data2=['101000']
    for j in data2:
        for i in data:
            print(i)
            saveStrDistance=False
            readStrDistance=True
            # if i==[0.8,0.2]:
            #     saveStrDistance=True
            # if i!=[1,0] and i!=[0.8,0.2] and i!=[0,1]:
            #     readStrDistance=True
            getTSNE(dirPath = './data/paper/',dimensionsStr=128,dimensionsAttrChecked=j,strWeight=i[0],attrWeight=i[1],
                    saveFile=True,saveStrDistance=saveStrDistance,readStrDistance=readStrDistance,saveDir='./data/paper/',readDir='./data/paper/')
