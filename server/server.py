from flask import Flask, render_template, request, jsonify,make_response
import json
import math

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
        with open('./dataProcessing/data/paper/subGraphs_'+str(time_interval)+'.json','r') as fr:
            data=json.load(fr)
            res = make_response(jsonify({'code': 200, "data": data}))
    return res

@app.route("/search",methods = ['POST', 'GET'])
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

@app.route("/searchGraph",methods = ['POST', 'GET'])
def searchGraph():#根据人名搜索包含该人的网络
    if request.method == 'POST':
        resData=[]
        num2node={}
        with open('./dataProcessing/data/paper/node2Num.json','r') as fr:
            node2Num=json.load(fr)#{www:1}
            for key in node2Num:
                num2node[node2Num[key]]=key#{1:www}
        with open('./dataProcessing/data/paper/subGraphs_'+str(time_interval)+'.json','r') as fr:
            data=json.load(fr)
            wd=int(request.get_json()['wd'])#该人的id
            #遍历所有子图，如果子图点集中包含搜索的点则加入返回数据中
            for graph in data:
                if graph['nodes'].count(wd)>0:
                    nodeName={}
                    for i in graph['nodes']:
                        nodeName[i]=num2node[i]
                    graph['names']=nodeName
                    resData.append(graph)
            res = make_response(jsonify({'code': 200, "data": resData}))
    return res

@app.route("/matchGraph",methods = ['POST', 'GET'])
def match():#匹配相似图
    if request.method == 'POST':
        sourceGraph = request.get_json()['wd']#要匹配的图
        num=int(request.get_json()['num'])
        resData=[]
        with open('./dataProcessing/data/paper/subGraphs_'+str(time_interval)+'.json','r') as fr:
            data=json.load(fr)
            for i in range(len(data)):
                if data[i]['id']!=sourceGraph['id']:
                    distance=math.pow(sourceGraph['x']-data[i]['x'],2)+math.pow(sourceGraph['y']-data[i]['y'],2)
                    data[i]['distance']=distance
                    resData.append(data[i])
            resData=sorted(resData,key=lambda x:x['distance'])#sort(key=lambda x:x["distance"])
            res = make_response(jsonify({'code': 200, "data": resData[:num]}))
    return res

if __name__ == '__main__':
    app.run(host="0.0.0.0",
            port=8080)
