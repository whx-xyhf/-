#获取原始网络大图

import json
import csv
from datetime import datetime
import networkx as nx
import os
import shutil

def getJson(url): #读取原始数据
    data = {}
    with open(url, 'r',encoding='utf-8') as fr:
        data=json.load(fr)

    return data

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

def getNet(data,dir_path,fileName1,fileName2,fileName3):
    count = 1
    edges = []  # 无权重
    edges_weight = []  # 有权重
    #找边
    print("正在找边。。。")
    for year in data:
        for person in range(len(data[year])):
            papers=data[year][person]['paper']
            for paper in papers:
                authors=paper['author']
                for i in range(len(authors)):
                    for j in range(i+1,len(authors)):
                        if edges.count([authors[i],authors[j]])>0:
                            index=edges.index([authors[i],authors[j]])
                            edges_weight[index][2]+=1
                        elif edges.count([authors[j],authors[i]])>0:
                            index=edges.index([authors[j],authors[i]])
                            edges_weight[index][2]+=1
                        else:
                            edges.append([authors[i],authors[j]])
                            edges_weight.append([authors[i],authors[j],1])
                            # print(count)
                            count+=1
    print('原始网络：' + str(len(edges)) + "条")
    with open(dir_path+'/'+fileName1,'w',encoding='utf-8',newline='') as fw:
        csv_writer = csv.writer(fw)
        # 构建列表头
        csv_writer.writerow(["source", "target", "weight"])
        # for line in edges_weight:
        csv_writer.writerows(edges_weight)

    #转数字
    G=nx.Graph()
    G.add_weighted_edges_from(edges_weight)
    nodes=list(G.nodes())
    node2num={}
    for i in range(len(nodes)):
        node2num[nodes[i]]=i
    edges_weight_num=[]
    with open(dir_path+'/'+fileName3,'w') as fw:
        json.dump(node2num,fw)
    for edge in edges_weight:
        edges_weight_num.append([node2num[edge[0]],node2num[edge[1]],edge[2]])
    with open(dir_path+'/'+fileName2,'w',encoding='utf-8',newline='') as fw:
        csv_writer = csv.writer(fw)
        # 构建列表头
        csv_writer.writerow(["source", "target", "weight"])
        # for line in edges_weight:
        csv_writer.writerows(edges_weight_num)
        print("构建网络完毕！！！")
    return node2num

def getNetWithTimeTnterval(data,node2num,time_interval,dir_path,fileName1,fileName2,fileName3): #根据时间间隔构建原始网络
    number=0
    #找边
    print("正在找边。。。")
    for year in data:
        number+=1
        if number==time_interval:
            count = 1
            edges = []  # 无权重
            edges_weight = []  # 有权重
            for person in range(len(data[year])):
                papers=data[year][person]['paper']
                for paper in papers:
                    authors=paper['author']
                    for i in range(len(authors)):
                        for j in range(i+1,len(authors)):
                            if edges.count([authors[i],authors[j]])>0:
                                index=edges.index([authors[i],authors[j]])
                                edges_weight[index][2]+=1
                            elif edges.count([authors[j],authors[i]])>0:
                                index=edges.index([authors[j],authors[i]])
                                edges_weight[index][2]+=1
                            else:
                                edges.append([authors[i],authors[j]])
                                edges_weight.append([authors[i],authors[j],1])
                                # print(count)
                                count+=1

            number=0
            yearPath=''
            if time_interval==1:
                yearPath=str(year)
            else:
                year_end=int(year)+time_interval
                yearPath=str(year)+'-'+str(year_end)
            print(str(yearPath) + "：" + str(len(edges)) + "条")
            del_file(dir_path+'/'+yearPath)
            with open(dir_path+'/'+yearPath+'/'+fileName1,'w',encoding='utf-8',newline='') as fw:
                csv_writer = csv.writer(fw)
                # 构建列表头
                csv_writer.writerow(["source", "target", "weight"])
                # for line in edges_weight:
                csv_writer.writerows(edges_weight)

            #转数字
            edges_weight_num=[]
            for edge in edges_weight:
                edges_weight_num.append([node2num[edge[0]],node2num[edge[1]],edge[2]])
            with open(dir_path+'/'+yearPath+'/'+fileName2,'w',encoding='utf-8',newline='') as fw:
                csv_writer = csv.writer(fw)
                # 构建列表头
                csv_writer.writerow(["source", "target", "weight"])
                # for line in edges_weight:
                csv_writer.writerows(edges_weight_num)
                print("构建网络完毕！！！")


if __name__=="__main__" :
    start = datetime.now()
    time_interval=1
    jsonData=getJson('./data/paper/data_weight.json')
    # node2num=getNet(jsonData,'./data/paper','orignNet.csv','orignNetNum.csv','node2Num.json')
    node2num=getJson('./data/paper/node2Num.json')

    getNetWithTimeTnterval(jsonData,node2num,time_interval, './data/paper', 'orignNet.csv', 'orignNetNum.csv', 'node2Num.json')
    end = datetime.now()
    print("用时"+str((end - start).seconds)+"秒！！！")