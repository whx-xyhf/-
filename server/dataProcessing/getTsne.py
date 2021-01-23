#向量降维
import csv
import json
from datetime import datetime
from sklearn.manifold import TSNE

start = datetime.now()
vectors=[]
id=[]
dirPath = './data/paper/'
time_interval = 1
dimensions=128
with open(dirPath+'vectors_'+str(time_interval)+'_'+str(dimensions)+'.csv','r') as fr:
    data=csv.reader(fr)
    index=0
    for i in data:
        if index!=0:
            id.append(str(i[0]))
            del (i[0])
            vectors.append(i)
        index += 1
tsne=TSNE(metric='euclidean', method='barnes_hut', angle=0.2,n_iter=1000)

data_tsne = tsne.fit_transform(vectors)

index=0
outdata=[]
for vector in data_tsne:
    outdata.append({"id":id[index],"x":str(vector[0]),"y":str(vector[1])})
    index+=1
with open(dirPath+'vectors2d_'+str(time_interval)+'_'+str(dimensions)+'.json',"w") as fr:
    json.dump(outdata,fr)
end = datetime.now()
print((end - start).seconds)