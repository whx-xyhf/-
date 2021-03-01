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
    # with open('./data/family/att5.json','r') as fr:
    #     attrData=json.load(fr)
    time_interval = 1
    dimensions = 128
    dirPath = './data/family/'
    attrArrayDic=[]
    attrDic={}
    attrName=[]
    with open('./data/family/subGraphs_1.json','r') as fr:
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
        print(attrArrayDic)
        attrArrayDic = np.array(attrArrayDic)
        mean = np.mean(attrArrayDic, axis=0)
        std = np.std(attrArrayDic, axis=0)
        print(mean, std)
        for i in attrDic:
            for j in range(len(attrDic[i])):
                attrDic[i][j] = (attrDic[i][j] - mean[j]) / std[j]
        with open(dirPath+'attrMeanStd_'+str(time_interval)+'.json', 'w', encoding='utf-8') as fw:
            mean_std = {'mean': {}, 'std': {}}
            for i in range(len(attrName)):
                mean_std['mean'][attrName[i]] = mean[i]
                mean_std['std'][attrName[i]] = std[i]
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
        # for i in range(len(data)):
        #     attr=attrData[str(data[i]['id'])]
        #     data[i]['attr']={'position':attr['positionNum'],'avAge':attr['averageAge'],'village':attr['villageNum'],
        #                      'timeSpan':attr['timeSpan'],'ageGap':attr['ageGap']}
        #     data[i]['str']={'depth':data[i]['deepth'],'nodes':data[i]['count']}
        #     # data[i]['id']=int(data[i]['name'])
        #     # del data[i]['name']
        #     print(i)
    # with open('./data/family/subGraphs_1.json','w') as fw:
    #     json.dump(data,fw)
