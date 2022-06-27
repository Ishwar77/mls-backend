import pandas as pd
from pandas.core.common import SettingWithCopyWarning
from ALS_Test_auto_final import main,pandas_2_mongodb
import warnings
warnings.simplefilter(action="ignore", category=SettingWithCopyWarning)
import sys
# import os

if __name__ == "__main__":
    print('MAINs')
    print(sys.argv)
    # path = os.getcwd() + '/app/others/ALS-TEST-CASE-GEN.xlsx'
    # data = pd.read_excel(path, sheet_name='Field')
    data = pd.read_excel("./app/others/ALS-TEST-CASE-GEN.xlsx", sheet_name='Fields')
    data.fillna(' ',inplace = True)
    # Data_Dict = pd.read_excel(path, sheet_name='Data Dictionary')
    # Draft = pd.read_excel(path, sheet_name='Draft')
    Data_Dict = pd.read_excel("./app/others/ALS-TEST-CASE-GEN.xlsx", sheet_name='DataDictionaryEntries')
    Draft = pd.read_excel("./app/others/ALS-TEST-CASE-GEN.xlsx", sheet_name='CRFDraft')
    x = main(data,Data_Dict,Draft)
    collections = pandas_2_mongodb(data = x)