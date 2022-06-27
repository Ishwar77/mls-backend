
import pandas as pd 
import numpy as np
from datetime import datetime
from pandas.core.common import SettingWithCopyWarning
import pymongo
from pymongo import MongoClient
import warnings
warnings.simplefilter(action="ignore", category=SettingWithCopyWarning)
import sys

    
def active_check(Data):
    temp = pd.DataFrame(Data[['FormOID','FieldOID','VariableOID']])
    temp['check'] = np.where(
    Data['DraftFieldActive'].isin([True]), 
    'Check if field is active',
    'Check if Field is inactive')
#     temp1 = self.templet_gen(field_name,temp,'Date Dictionary based Check')
    return temp
    
def DataFormat_check(Data):
    temp = pd.DataFrame(Data[['FormOID','FieldOID','VariableOID']])
#     max_len = ['Check if the value is string & max lenght of '+i[1:] for i in data[data.DataFormat.str.startswith('$')]['DataFormat'].tolist()]
    temp['check'] = np.select(
    [
        Data['DataFormat'].str.startswith('$'), 
        Data['DataFormat'].str.startswith('yyyy'),
        Data['DataFormat'].str.startswith('HH'),
        Data['DataFormat'].str.isspace(),
        Data['DataFormat'].str.isnumeric()
        
    ],
    [
       'Check if the value is string',
       'Check if the fileds Input date format is yyyy MMM dd, Eg: 1996 DEC 17',
       'Check if the fileds Input data is a time of format HH:nn Eg: 00:01',
        'No need of any Format related checks',
        'Check if max field length is'
    ],
    default='Default check')
    max_str_len = ['Check if the value is string & max lenght of '+i[1:] for i in Data[Data.DataFormat.str.startswith('$')]['DataFormat'].tolist()]
    max_len = ['Check if max field length is '+i for i in Data[ Data['DataFormat'].str.isnumeric()]['DataFormat'].tolist()]
    temp.loc[temp.check == 'Check if the value is string','check'] = max_str_len
    temp.loc[temp.check == 'Check if max field length is','check'] = max_len
    return temp
    
def DataDict_check(Data,data_dict):
    temp = Data[Data.DataDictionaryName.str.startswith('$')][['FormOID','FieldOID','VariableOID','DataDictionaryName']]
    DDV_list = ['check if the field contains \"'+str(x)+'\" Value' for i in Data[Data.DataDictionaryName.str.startswith('$')]['DataDictionaryName'].tolist() for x in data_dict[data_dict.DataDictionaryName == i]['UserDataString']]
    data_dict_name = [x for i in Data[Data.DataDictionaryName.str.startswith('$')]['DataDictionaryName'].tolist() for x in data_dict[data_dict.DataDictionaryName == i]['DataDictionaryName']]
    dd_df = pd.DataFrame(list(zip(data_dict_name, DDV_list)),
                   columns =['DataDictionaryName', 'check'])
    temp = temp.merge(dd_df, left_on='DataDictionaryName', right_on='DataDictionaryName',
              suffixes=('_left', '_right')).drop_duplicates()
    temp = temp.reset_index().drop(['index','DataDictionaryName'],axis = 1)
    return temp
    
def pretext_check(Data):
    temp = Data[['FormOID','FieldOID','VariableOID']]
    pretext_lst = [i + ' \n\n check if the above pretext is present' for i in Data['PreText'].tolist()]
    temp['check'] = pretext_lst
    return temp

def FixedUnit_check(Data):
    temp = Data[Data.FixedUnit.str.isspace() == False][['FormOID','FieldOID','VariableOID']]
    FixedUnit_lst = [i + ' \n\n check if the above Fixedunit is present' for i in Data[Data.FixedUnit.str.isspace() == False]['FixedUnit'].tolist()]
    temp['check'] = FixedUnit_lst
    return temp

def templet_gen(Draft_ID,temp_df,ECRF = 'Draft-CRF-'):
        x = pd.DataFrame({'STUDYID': {0: Draft_ID},
     'SITEID': {0: 'SITE-101'},
     'SUBJECT_ID' : {0 : 1},
     'DRAFT_NAME' : {0: Draft['DraftName'][0]},
     'eCRFV_VERSION' : {0: ECRF+Draft_ID[6:]},
     'Created_By': {0: 'SYSTEM'}
    })
        x = pd.concat([x] * temp_df.shape[0], ignore_index=True)
        t1 = x.merge(temp_df,"left",left_index = True,right_index = True)
        return t1

def main(data1,Data_Dict,Draft):
    Data_D = data1[data1.DataDictionaryName != ' ']
    data = data1[data1.DataDictionaryName == ' ']
#     active = active_check(data)
    DataFormat = DataFormat_check(data)
    DataDict = DataDict_check(Data_D,Data_Dict)
    pretext = pretext_check(data)
    FixedUnit = FixedUnit_check(data)
    df = pd.concat([DataFormat,DataDict,pretext,FixedUnit]).sort_values(by=['FormOID','FieldOID'])
    df = df.reset_index().drop(['index'],axis = 1)
    df = df.rename(columns = {'check':'Test_Condition'})
    df = templet_gen(Draft_ID = sys.argv[2],temp_df = df)
    return df

def pandas_2_mongodb(data, user_nm = 'user_1',passw = 'pass_123'):
#     user_nm = 'user_1'
#     passw = 'pass_123'
    client_URL = "mongodb+srv://"+user_nm+":"+passw+"@cluster0.mrfyq.mongodb.net/MLS?retryWrites=true&w=majority"
    client =  MongoClient(client_URL)
    db = client['MLS']
    collection = db['testcasesv2']
    collection.insert_many(data.to_dict("records"))
    return collection
    
if __name__ == "__main__":
    data = pd.read_excel("./app/others/ALS-TEST-CASE-GEN.xlsx", sheet_name='Fields')
    data.fillna(' ',inplace = True)
    data = data[data.DraftFieldActive.isin([True]) & (data.VariableOID.apply(lambda x:x.isspace() == False) )]
    Data_Dict = pd.read_excel("./app/others/ALS-TEST-CASE-GEN.xlsx", sheet_name='DataDictionaryEntries')
    Draft = pd.read_excel("./app/others/ALS-TEST-CASE-GEN.xlsx", sheet_name='CRFDraft')
    x = main(data,Data_Dict,Draft)
    collections = pandas_2_mongodb(data = x)