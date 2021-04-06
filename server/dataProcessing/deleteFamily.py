import json
def getEdge(tree,edges):
    if "children" in tree:
        for i in range(len(tree["children"])):
            if 'name' in tree:
                edges.append([int(tree["name"]),int(tree["children"][i]["name"])])
            else:
                edges.append([int(tree["id"]), int(tree["children"][i]["id"])])
            getEdge(tree["children"][i],edges)
    return edges
def getdeep(list,node):
    n=1
    for i in range(len(list)):
        if list[i][1]==node:
            n=getdeep(list,list[i][0])+1
            break
    return n

def getFeatures(list):
    newList=[]
    data={}
    for i in list:
        if i[0] not in newList:
            newList.append(i[0])
        if i[1] not in newList:
            newList.append(i[1])
    for i in newList:
        data[i]=str(getdeep(list,i))
    return data
def getMaxYear(tree):
    year=int(tree['birthyear'])
    if year==-99 or year==-98:
        year=1800
    if "children" in tree:
        for i in range(len(tree['children'])):
            year=max(year,getMaxYear(tree['children'][i]))
        return year
    else:
        return max(year,1800)

def getMinYear(tree):
    year=int(tree['birthyear'])
    if year==-99 or year==-98:
        year=1700
    elif year==1188:
        year=1850
    if "children" in tree:
        for i in range(len(tree['children'])):
            year=min(year,getMinYear(tree['children'][i]))
        return year
    else:
        return min(year,1700)

def getAgeSum(tree):
    age=int(tree['age'])
    if age==-99:
        age=30
    if "children" in tree:
        for i in range(len(tree['children'])):
            age+=getAgeSum(tree['children'][i])
        return age
    else:
        return age
def getCount(tree):
    num=1
    if "children" in tree:
        for i in range(len(tree['children'])):
            num+=getCount(tree["children"][i])
        return num
    else:
        return num


def getDepth(list):
    newList=[]
    for i in list:
        if i[0] not in newList:
            newList.append(i[0])
        if i[1] not in newList:
            newList.append(i[1])
    deep=[]
    for i in newList:
        deep.append(getdeep(list,i))
    return max(deep)


def getPN(tree):
    if tree['guan']=="1":
        count=1
    else: count=0
    if "children" in tree:
        for i in range(len(tree['children'])):
            count+=getPN(tree["children"][i])
        return count
    else:
        return count
def getVN(tree,array):
    village=tree['village']
    if village not in array:
        array.append(village)
    if "children" in tree:
        for i in range(len(tree['children'])):
            getVN(tree["children"][i], array)
    else:
        return array
    return array

def getTS(tree):
    ts=getMaxYear(tree)-getMinYear(tree)
    if ts>0:
        return ts
    else :
        return 10

def getAG(tree):
    birthyear=int(tree["birthyear"])
    gap=0
    if "children" in tree:
        for i in range(len(tree['children'])):
            if int(tree['children'][i]["birthyear"])==-99 or int(tree['children'][i]["birthyear"])==-98 or birthyear==-99 or birthyear==-98:
                gap+=20
            else:
                if int(tree['children'][i]["birthyear"])-birthyear<0:
                    gap +=birthyear - int(tree['children'][i]["birthyear"])
                    temp=tree['children'][i]["birthyear"]
                    tree['children'][i]["birthyear"]=str(birthyear)
                    tree["birthyear"]=str(temp)

                gap+=int(tree['children'][i]["birthyear"])-birthyear
        for i in range(len(tree['children'])):
            gap+=getAG(tree['children'][i])
        return gap
    else:
        return gap

with open('./data/Family/subGraphs_1.json','r') as f:
    data=json.load(f)
    for i in range(len(data)):
        print(i)
        edges=getEdge(data[i],[])
        depth=getDepth(edges)
        data[i]['str']={"nodes":getCount(data[i]),"depth":depth}
        data[i]['attr']={"PN":getPN(data[i]),"AA":getAgeSum(data[i])/data[i]['str']["nodes"],"VN":len(getVN(data[i],[])),"TS":getTS(data[i]),"AG":getAG(data[i])/(data[i]['str']["nodes"]-1)}

with open('./data/Family/subGraphs_1.json','w')as fw:
    json.dump(data,fw)
    # out=[]
    # count=0
    # for i in data:
    #     # if i['str']['nodes']!=1:
    #     if getCount(i)!=1:
    #         out.append(i)
    #     else:
    #         count +=1
    #         if count==8000:
    #             out.append(i)
# with open('./data/Family2/subGraphs_1.json','w') as f:
#     json.dump(out,f)
#     print(len(out))
# with open('./data/Family/subGraphs_1.json','r') as f:
#     out=json.load(f)
# for i in range(len(out)):
#     with open('./data/Family/subGraphs_1/'+str(out[i]['id'])+'.json','w') as fw:
#         edges=getEdge(out[i],[])
#         features=getFeatures(edges)
#         json.dump({'edges':edges,'features':features},fw)




