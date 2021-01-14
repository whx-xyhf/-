a={1:2,3:4,5:{6:7}}
for i in a:
    if isinstance(a[i],dict):
        print(a[i])