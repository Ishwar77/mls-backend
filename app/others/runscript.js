//https://www.npmjs.com/package/python-shell - REFERENCE

let { PythonShell } = require('python-shell')
const AWS = require('aws-sdk');
const fs = require('fs')
const util = require('util')
const writeFile = util.promisify(fs.writeFile)

// PythonShell.run('./app/others/als_matrix.py',null, function (err, results) {
//   if (err) throw err;
//   console.log('alsfinished');
//   console.log("alsresults ", results); 
// }); 
class TestCaseGeneration {


  static runGenerationTestCaseScript(excelURLs3, studyID) {
    const ACCESS_KEY_ID = "AKIAYVUT44SCMGQEUBL7"
    const SECRET_ACCESS_KEY = "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"
    const BUCKET_NAME = "maiora-life-sciences/study/alsDoc"

    var s3 = new AWS.S3({
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY
    })
    // console.log("excelURLs3", excelURLs3, "studyID", studyID);
    let pathname = excelURLs3;
    // let pathname = 'https://maiora-life-sciences.s3.ap-south-1.amazonaws.com/study/alsDoc/V1--ALS-VER-TEST.xlsx';
    // let studyID = 'studyID';
    let xlsxFileName2 = new URL(pathname).pathname.split('/').pop();
    var params = {
      Key: xlsxFileName2,
      Bucket: BUCKET_NAME
    }

    s3.getObject(params).promise().then((data) => {
      writeFile('./app/others/ALS-TEST-CASE-GEN.xlsx', data.Body)
      console.log('file downloaded successfully');
      let splitVersion = xlsxFileName2.split('--');
      let version = splitVersion[0];
      let options = {
        // pythonPath: '/usr/bin/python',
        args: [xlsxFileName2, studyID, version]
      };
      console.log("xlsxFileName2 ", xlsxFileName2);
      // let path = __dirname + '/main.py';
      // console.log("__DIR ", __dirname, "path ", path );
      // PythonShell.run(path, options, function (err, results) {
      // PythonShell.run('./app/others/main.py', options, function (err, results) {
      console.log('options', options);

      PythonShell.run('./app/others/ALS_Test_auto_final1.py', options, function (err, results) {
        if (err) throw err;
        console.log('finished');
        console.log("results ", results);        
      });
    }).catch((err) => {
      throw err
    });
   
  }
}

module.exports = TestCaseGeneration;