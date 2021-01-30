from flask import Flask, render_template, request, jsonify,make_response
import json
import math
import numpy as np
from dataProcessing.Ged import getGed
from dataProcessing.getTsne import getTSNE

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
time_interval=1

@app.after_request
def cors(environ):
    environ.headers['Access-Control-Allow-Origin']='*'
    environ.headers['Access-Control-Allow-Method']='*'
    environ.headers['Access-Control-Allow-Headers']='x-requested-with,content-type'
    return environ

@app.route("/",methods = ['POST', 'GET'])
def index():
    if request.method == 'POST':
        dimensions = str(request.get_json()['dimensions'])
        strWeight=str(request.get_json()['strWeight'])
        attrWeight = str(request.get_json()['attrWeight'])
        with open('./dataProcessing/data/paper/vectors2d_'+str(time_interval)+'_'+dimensions+'_'+strWeight+'_'+attrWeight+'.json','r') as fr:
            vectors=json.load(fr)
        with open('./dataProcessing/data/paper/subGraphs_'+str(time_interval)+'.json','r') as fr:
            data=json.load(fr)
            for i in range(len(data)):
                data[i]['x']=float(vectors[str(data[i]['id'])]['x'])
                data[i]['y']=float(vectors[str(data[i]['id'])]['y'])
            res = make_response(jsonify({'code': 200, "data": data}))
    return res

@app.route("/searchPerson",methods = ['POST', 'GET'])
def search():#根据关键字匹配人名
    if request.method == 'POST':
        resData={}
        with open('./dataProcessing/data/paper/node2Num.json','r') as fr:
            data=json.load(fr)
            wd=request.get_json()['wd']
            if wd=="":
                res = make_response(jsonify({'code': 200, "data": data}))
            else:
                for key in data:
                    if key.lower().find(wd.lower())>=0:
                        resData[key]=data[key]
                res = make_response(jsonify({'code': 200, "data": resData}))
    return res

@app.route("/searchGraphByPersonId",methods = ['POST', 'GET'])
def searchGraphByPersonId():#根据人id搜索包含该人的网络
    if request.method == 'POST':
        resData=[]
        num2node={}
        strWeight = str(request.get_json()['strWeight'])
        attrWeight = str(request.get_json()['attrWeight'])
        wd = int(request.get_json()['wd'])  # 该人的id
        dimensions = str(request.get_json()['dimensions'])
        with open('./dataProcessing/data/paper/node2Num.json','r') as fr:
            node2Num=json.load(fr)#{www:1}
            for key in node2Num:
                num2node[node2Num[key]]=key#{1:www}

        with open('./dataProcessing/data/paper/vectors2d_' + str(
                time_interval) + '_' + dimensions + '_' + strWeight + '_' + attrWeight + '.json', 'r') as fr:
            vectors = json.load(fr)

        with open('./dataProcessing/data/paper/subGraphs_'+str(time_interval)+'.json','r') as fr:
            data=json.load(fr)

            #遍历所有子图，如果子图点集中包含搜索的点则加入返回数据中
            for graph in data:
                if graph['nodes'].count(wd)>0:
                    nodeName={}
                    for i in graph['nodes']:
                        nodeName[i]=num2node[i]
                    graph['names']=nodeName
                    graph['x']=float(vectors[str(graph['id'])]['x'])
                    graph['y']=float(vectors[str(graph['id'])]['y'])
                    resData.append(graph)
            res = make_response(jsonify({'code': 200, "data": resData}))
    return res

@app.route("/searchGraphByGraphId",methods = ['POST', 'GET'])
def searchGraphByGraphId():#根据图id搜索该图
    if request.method == 'POST':
        resData=[]
        num2node={}
        strWeight = str(request.get_json()['strWeight'])
        attrWeight = str(request.get_json()['attrWeight'])
        wd = int(request.get_json()['wd'])  # 该图的id
        dimensions = str(request.get_json()['dimensions'])
        with open('./dataProcessing/data/paper/node2Num.json','r') as fr:
            node2Num=json.load(fr)#{www:1}
            for key in node2Num:
                num2node[node2Num[key]]=key#{1:www}

        with open('./dataProcessing/data/paper/vectors2d_' + str(
                time_interval) + '_' + dimensions + '_' + strWeight + '_' + attrWeight + '.json', 'r') as fr:
            vectors = json.load(fr)

        with open('./dataProcessing/data/paper/subGraphs_'+str(time_interval)+'.json','r') as fr:
            data=json.load(fr)
            for graph in data:
                if graph['id']==wd:
                    nodeName = {}
                    for i in graph['nodes']:
                        nodeName[i] = num2node[i]
                    graph['names'] = nodeName
                    graph['x'] = float(vectors[str(graph['id'])]['x'])
                    graph['y'] = float(vectors[str(graph['id'])]['y'])
                    resData.append(graph)
                    break
            res = make_response(jsonify({'code': 200, "data": resData}))
    return res

@app.route("/matchGraph",methods = ['POST', 'GET'])
def match():#匹配相似图
    if request.method == 'POST':
        sourceGraph = request.get_json()['wd']#要匹配的图
        num=int(request.get_json()['num'])
        dimensions = str(request.get_json()['dimensions'])
        strWeight = str(request.get_json()['strWeight'])
        attrWeight = str(request.get_json()['attrWeight'])
        resData=[]
        with open('./dataProcessing/data/paper/vectors2d_' + str(
                time_interval) + '_' + dimensions + '_' + strWeight + '_' + attrWeight + '.json', 'r') as fr:
            vectors = json.load(fr)
        with open('./dataProcessing/data/paper/subGraphs_'+str(time_interval)+'.json','r') as fr:
            data=json.load(fr)
            for i in range(len(data)):
                if data[i]['id']!=sourceGraph['id']:
                    data[i]['x'] = float(vectors[str(data[i]['id'])]['x'])
                    data[i]['y'] = float(vectors[str(data[i]['id'])]['y'])
                    distance=math.pow(float(vectors[str(sourceGraph['id'])]['x'])-data[i]['x'],2)+math.pow(float(vectors[str(sourceGraph['id'])]['y'])-data[i]['y'],2)
                    data[i]['distance']=distance
                    resData.append(data[i])
            resData=sorted(resData,key=lambda x:x['distance'])#sort(key=lambda x:x["distance"])
            res = make_response(jsonify({'code': 200, "data": resData[:num]}))
    return res

@app.route("/getAttr",methods = ['POST', 'GET'])
def getAttr():
    if request.method == 'POST':
        with open('./dataProcessing/data/paper/subGraphs_'+str(time_interval)+'.json','r') as fr:
            data=json.load(fr)
            attr=[]
            for i in data:
                attr.append({'id':i['id'],'attr':i['attr']})
            res = make_response(jsonify({'code': 200, "data": attr}))
    return res

if __name__ == '__main__':
    app.run(host="0.0.0.0",
            port=8080)

# @app.route("/compare",methods = ['POST', 'GET'])
# def compare():
#     if request.method == 'POST':
#         num = int(request.get_json()['num'])
#         sourceGraph = request.get_json()['graph']  # 要匹配的图
#         matchGraphs=[]
#         dimensionsArr=[]
#         matchGraphsDic={}
#         attr = {}
#         ged={}
#         resData={}
#         with open('./dataProcessing/data/paper/subGraphs_'+str(time_interval)+'.json','r') as fr:
#             data=json.load(fr)
#             #获取所有维度的相似图
#             for i in range(len(data)):
#                 if data[i]['id'] == sourceGraph['id']:
#                     sourceGraph=data[i]
#                     del data[i]
#                     break
#             for i in range(len(data)):
#                 distanceDic = {}
#                 for dimensions in data[i]['x']:
#                     distance = math.pow(sourceGraph['x'][dimensions] - data[i]['x'][dimensions], 2) + math.pow(sourceGraph['y'][dimensions] - data[i]['y'][dimensions],2)
#                     distanceDic[dimensions]=distance
#                     if i==0:
#                         dimensionsArr.append(dimensions)
#                 data[i]['distance'] = distanceDic
#                 matchGraphs.append(data[i])
#
#             for dimensions in dimensionsArr:
#                 attr[dimensions]={'mean':{},'std':{}}
#                 ged[dimensions]={'mean':0,'std':0}
#                 matchGraphsDic[dimensions]=sorted(matchGraphs, key=lambda x: x['distance'][dimensions])[:num]
#                 attrValue = {}
#                 gedValue=[]
#                 for graph in matchGraphsDic[dimensions]:
#                     gedValue.append(getGed(sourceGraph['edges'],graph['edges']))
#                     for key in graph['attr']:
#                         if key in attrValue.keys():
#                             attrValue[key].append(graph['attr'][key])
#                         else:
#                             attrValue[key]=[]
#                 ged[dimensions]['mean']=np.mean(np.array(gedValue))
#                 ged[dimensions]['std'] = np.std(np.array(gedValue))
#                 for key in attrValue:
#                     attr[dimensions]['mean'][key]=np.mean(np.array(attrValue[key]))
#                     attr[dimensions]['std'][key] = np.std(np.array(attrValue[key]))
#             resData['attr']=attr
#             resData['ged']=ged
#             res = make_response(jsonify({'code': 200, "data": resData}))
#     return res


