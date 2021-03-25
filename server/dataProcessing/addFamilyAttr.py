import json
import csv
import numpy as np

def vectorExtend(url,extendData,isExist,dimensions):#向量拼接
    vectors=[]
    head=[]
    with open(url,'r',encoding='utf-8') as fr:
        data = csv.reader(fr)
        index = 0
        for i in data:
            i=i[:dimensions+1]
            if index != 0:
                if isExist==False:
                    i.extend(extendData[int(i[0])])
                else:
                    i.extend(extendData[i[0]])
                vectors.append(i)
            else:
                head = i
            index += 1
    return vectors,head

if __name__=='__main__':
    # with open('./data/Family/att5.json','r') as fr:
    #     attrData=json.load(fr)
    time_interval = 1
    dimensions = 5
    dirPath = './data/Family/'
    attrArrayDic=[]
    attrDic={}
    attrName=[]
    with open('./data/Family/subGraphs_1.json','r') as fr:
        data=json.load(fr)
        for i in data[0]['attr']:
            attrName.append(i)
        for subgrapg in data:
            attr=[]
            for i in subgrapg['attr']:
                attr.append(subgrapg['attr'][i])
            attrArrayDic.append(attr)
            attrDic[subgrapg['id']]=attr
        # 归一化
        attrArrayDic = np.array(attrArrayDic)
        max = np.max(attrArrayDic, axis=0)
        min = np.min(attrArrayDic, axis=0)
        print(max, min)
        for i in attrDic:
            for j in range(len(attrDic[i])):
                attrDic[i][j] = (attrDic[i][j] - min[j]) / (max[j]-min[j])
        with open(dirPath+'attrMeanStd_'+str(time_interval)+'.json', 'w', encoding='utf-8') as fw:
            mean_std = {'max': {}, 'min': {}}
            for i in range(len(attrName)):
                mean_std['max'][attrName[i]] = float(max[i])
                mean_std['min'][attrName[i]] = float(min[i])
            json.dump(mean_std, fw)
        with open(dirPath+'attrVectors_'+str(time_interval)+'.json', 'w', encoding='utf-8') as fw:
            json.dump(attrDic, fw)
        vectors, head = vectorExtend(dirPath+'vectors_'+str(time_interval)+'_'+str(dimensions)+'.csv', attrDic, False, dimensions)
        with open(dirPath+'vectors_'+str(time_interval)+'_'+str(dimensions)+'.csv', 'w', encoding='utf-8', newline='') as fw:
            csv_writer = csv.writer(fw)
            # 构建列表头
            for i in attrDic:
                for j in range(len(attrDic[i])):
                    head.append('a_' + str(j))
                break;
            csv_writer.writerow(head)
            for line in vectors:
                csv_writer.writerow(line)



    #     for i in range(len(data)):
    #         # data[i]['id']=int(data[i]['name'])
    #         # del data[i]['name']
    #         attr=attrData[str(data[i]['id'])]
    #         data[i]['attr']={'PN':attr['positionNum'],'AA':attr['averageAge'],'VN':attr['villageNum'],
    #                          'TS':attr['timeSpan'],'AG':attr['ageGap']}
    #         data[i]['str']={'depth':data[i]['deepth'],'nodes':data[i]['count']}
    #
    #         print(i)
    # with open('./data/Family/subGraphs_1.json','w') as fw:
    #     json.dump(data,fw)
