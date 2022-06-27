#!/usr/bin/env python
# coding: utf-8

# In[65]:


import pandas as pd
import re
file_name = "./app/others/ALS2.xlsx"
f = pd.ExcelFile(file_name)


def fun(file_name,sheet_name,n):
    #print("fun file_name:",file_name)
    #print("sheet_name:", sheet_name)
    #print("n:",n)
    df = pd.read_excel(file_name,sheet_name)
    L=['FUP40','FUPQ3','PRPACT','TAUNSCH']
    if n=='FUP40':
        n='FUP_40'
    if n=='FUPQ3':
        n='FUP_Q3'
    if n=='PRPACT':
        n='PR_PACT'
    if n=='TAUNSCH':
        n='TA_UNSCH'
    try:
        df = df[df[n].str.contains('X',na=False)]
    except:
        return "error there is no column name {}".format(n)
    #print("-----------------df--------------------")
    #print(df)
    return df


for i in f.sheet_names:
    if i.startswith("Matrix"):
        if i != "Matrix1#ALLPAGES":
            #print("found matrix sheet:")
            m=re.match(r'Matrix\d*#(\w*)',i)
            n=m.group(1)
            if n == 'C1':
                n = 'SCN'
            df1 =fun(file_name,i,n)
            try:
                json=df1.to_json()
                msg = "successful"
            except:
                json=df1
                msg = "error"
            #print(df1)
            print(json)
            with open('readme7.txt', 'a') as f:
                f.writelines("{\n")
                f.writelines("Matrix Sheetname: {}\n".format(n))
                f.writelines("Matrix column details: [{}]\n".format(json))
                #f.writelines(json)
                f.writelines("Message: {}\n".format(msg))
                f.writelines("}\n")
                f.writelines("\n")

f.close()
print("done")


# In[ ]:




