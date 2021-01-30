import json
import csv
import numpy as np

def getJson(url): #读取json数据
    data = {}
    with open(url, 'r',encoding='utf-8') as fr:
        data=json.load(fr)
    return data

def saveJson(url,data):
    with open(url,'w',encoding='utf-8') as fw:
        json.dump(data,fw)


def getRelatedData(originData,num2Node,graph):#获得子图所涉及的数据
    nodes_num=graph['nodes']
    nodes_name=[]
    out=[]
    for i in nodes_num:
        nodes_name.append(num2Node[i])
    for year in originData:
        if year==str(graph['year']):
            for person in range(len(originData[year])):
                papers=originData[year][person]['paper']
                for paper in papers:
                    authors=paper['author']
                    common=list(set(authors).intersection(set(nodes_name)))#作者取交集
                    if len(common)>1:
                        paper['common']=common
                        out.append(paper)
    return out

def readGraph(url):
    edges = []
    with open(url, 'r', encoding='utf-8') as fr:
        reader = csv.reader(fr)
        index = 0
        for line in reader:
            if index != 0:
                line[0] = int(line[0])
                line[1] = int(line[1])
                line[2] = int(line[2])
                edges.append(line)
            index += 1
    return edges

def getWeight(edges_weight,graph):
    edges=graph['edges']
    weight=0
    for edge in edges:
        for edge_w in edges_weight:
            if edge_w[0]==edge[0] and edge_w[1]==edge[1]:
                weight+=edge_w[2]
            elif edge_w[1] == edge[0] and edge_w[0] == edge[1]:
                weight += edge_w[2]
    return weight/len(edges)

def getAttr(data):
    count_author=0#平均合作作者人数
    count_paper=0#发表论文数量
    rank=0#作者平均排名
    count_cite=0#平均引用次数
    count_weight=0#平均合作次数
    count_common=0
    for paper in data:
        authors=paper['author']
        count_author+=len(authors)
        count_cite+=paper['cite']
        common=paper['common']
        count_common+=len(common)
        for i in common:
            rank+=authors.index(i)+1

    paper_count=len(data)
    count_paper=paper_count
    count_author=count_author/paper_count
    count_cite=count_cite/paper_count
    rank=rank/count_common
    return [count_author,count_cite,rank,count_paper]
    #return {'count_author':count_author,'count_cite':count_cite,'rank':rank,'count_paper':count_paper,'count_weight':count_weight}

def vectorExtend(url,extendData,isExist):#向量拼接
    vectors=[]
    head=[]
    with open(url,'r',encoding='utf-8') as fr:
        data = csv.reader(fr)
        index = 0
        for i in data:
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

def run(url1,url2,url3,url4,url5,url6,isExist=False):
    originData=getJson(url1)
    node2Num=getJson(url2)
    subGraphs=getJson(url3)
    edges=readGraph(url4)
    num2Node={}
    attrDic={}
    attrArrayDic=[]
    if isExist:
        with open(url6,'r') as fr:
            attrDic=json.load(fr)
    else:
        for i in node2Num:
            num2Node[node2Num[i]]=i
        index=0
        for graph in subGraphs:
            print(index)
            relateData=getRelatedData(originData,num2Node,graph)
            attr=getAttr(relateData)
            weight=getWeight(edges,graph)
            attr.append(weight)
            attrDic[graph['id']]=attr
            graph['attr']={'count_author':attr[0],'count_cite':attr[1],'rank':attr[2],'count_paper':attr[3],'count_weight':attr[4]}
            attrArrayDic.append(attr)
            index+=1
        saveJson(url3,subGraphs)
        #归一化
        # max_min=[]
        mean_std=[]
        attrArrayDic=np.array(attrArrayDic)
        # for i in range(len(attrArrayDic[0])):
        mean=np.mean(attrArrayDic,axis=0)
        std=np.std(attrArrayDic,axis=0)
        print(mean,std)
            # max_value=max(attrArrayDic,key=lambda x:x[i])[i]
            # min_value=min(attrArrayDic,key=lambda x:x[i])[i]
            # max_min.append([max_value,min_value])
        for i in attrDic:
            for j in range(len(attrDic[i])):
                attrDic[i][j]=(attrDic[i][j]-mean[j])/std[j]
        with open(url6,'w',encoding='utf-8') as fw:
            json.dump(attrDic,fw)
    vectors,head=vectorExtend(url5,attrDic,isExist)
    with open(url5, 'w', encoding='utf-8', newline='') as fw:
        csv_writer = csv.writer(fw)
        # 构建列表头
        for i in attrDic:
            for j in range(len(attrDic[i])):
                head.append('a_'+str(j))
            break;
        csv_writer.writerow(head)
        for line in vectors:
            csv_writer.writerow(line)

if __name__=='__main__':
    time_interval = 1
    dimensions=128
    dirPath = './data/paper/'
    run(dirPath+'data_weight.json',dirPath+'node2Num.json',
        dirPath+'subGraphs_'+str(time_interval)+'.json',dirPath+'orignNetNum.csv',
        dirPath+'vectors_'+str(time_interval)+'_'+str(dimensions)+'.csv',
        dirPath+'attrVectors_'+str(time_interval)+'.json',False)