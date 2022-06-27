import sys
import pandas as pd
from pandas.core.common import SettingWithCopyWarning
from ALS_Test_auto_final import main,pandas_2_mongodb
import warnings
warnings.simplefilter(action="ignore", category=SettingWithCopyWarning)

if len(sys.argv) > 1:
    if __name__ == "__main__":
        print('MAINs')
        print(sys.argv)
        print(sys.argv[1])
        data = pd.read_excel("ALS-VER-TEST.xlsx", sheet_name='Field')
        data.fillna(' ',inplace = True)
        Data_Dict = pd.read_excel("ALS-VER-TEST.xlsx", sheet_name='Data Dictionary')
        Draft = pd.read_excel("ALS-VER-TEST.xlsx", sheet_name='Draft')
        x = main(data,Data_Dict,Draft)
        collections = pandas_2_mongodb(data = x)
else:
    print('Arg Mising')