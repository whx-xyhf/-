from zss import simple_distance, Node
import json
import networkx as nx
import glob
from joblib import Parallel, delayed
from tqdm import tqdm


def dataset_reader(path):
    name = path.strip(".json").split("\\")[-1]
    data = json.load(open(path))
    edges=data['edges']
    return edges,name

def data_processing(path):
    edges,name=dataset_reader(path)
    newList = []
    data = {}
    for i in edges:
        if i[0] not in newList:
            newList.append(i[0])
        if i[1] not in newList:
            newList.append(i[1])
    for i in range(len(newList)):
        data[newList[i]]=i
    for i in range(len(edges)):
        edges[i][0]=data[edges[i][0]]
        edges[i][1] = data[edges[i][1]]
    return edges,name

def data_save(edges,name,save_url):
    with open(save_url+name+".json",'w') as fw:
        json.dump({'edges':edges,'RootName':name},fw)

def main(read_url,save_url):#一棵树一个文件
    paths=glob.glob(read_url+"*.json")
    print("reading data...")
    edges=Parallel(n_jobs=4)(delayed(data_processing)(path) for path in tqdm(paths))
    print('saving data...')
    for i in tqdm(edges):
        data_save(i[0],i[1],save_url)

def main2(read_url,save_url):#存一个文件
    paths = glob.glob(read_url + "*.json")
    print("reading data...")
    edges = Parallel(n_jobs=4)(delayed(dataset_reader)(path) for path in tqdm(paths))
    print('saving data...')
    out={}
    for i in tqdm(edges):
        out[i[1]]=i[0]
    with open(save_url,'w') as fw:
        json.dump(out,fw)

if __name__ == "__main__":
    # main('./data/Family/subGraphs_1/','./data/Family/subGraphs_tree/')
    main2('./data/Family/subGraphs_tree/','./data/Family/subGraphs_tree.json')
# edges1=[[1,2],[2,3],[2,4],[3,5]]
# edges2=[[1,2],[2,3],[3,5]]

# a=Node("1")
# b=Node("2").addkid(Node("3"))
# a.addkid(b)
# c=Node("1").addkid(Node("2"))
# print(simple_distance(a,c))



