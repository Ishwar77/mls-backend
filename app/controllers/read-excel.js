// // Requiring the module
const reader = require('xlsx')
let excelData = [];
const workbook = reader.readFile('./resources/uploads/_1628248699731testing1 (1).xlsx');
const sheetnames = Object.keys(workbook.Sheets);
console.log("sheetnames ", sheetnames);
let i = sheetnames.length;
while (i--) {
  const sheetname = sheetnames[i];
  arrayName = sheetname.toString();
  data = reader.utils.sheet_to_json(workbook.Sheets[sheetname]);
  var columnsIn = data[0];
  excelData = [];
  for (var key in columnsIn) {
    excelData.push({ colname: key, isSelected: "true" });
  }
  console.log("arrayName ", arrayName);
  console.log("excelData ", excelData);
}