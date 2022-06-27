const fs = require('fs');
const AWS = require('aws-sdk');
const express = require("express");
const process = require("process");
const router = express.Router();
const logger = require('../../utils/logger');
const ApiResponse = require('../../models/apiResponse');
const FileUploadInputs = require('./s3Bucket.util');
const StudyDAO = require("../../v1/study-module/study.dao");
const requiredKeysandIds = require('../../../config/custom-environment-variables.json');
const xlsx = require('xlsx')
const AuthorizeMiddlewareAuth = require("../../middlewares/jwt/auth");


// const s3 = new AWS.S3({
//     accessKeyId: requiredKeysandIds.S3_BUCKET_ACCESS_KEY_ID_TEST,
//     secretAccessKey: requiredKeysandIds.S3_BUCKET_SECRET_ACCESS_KEY_TEST
// });

const s3 = new AWS.S3({
    accessKeyId: requiredKeysandIds.S3_BUCKET_ACCESS_KEY_ID_PROD,
    secretAccessKey: requiredKeysandIds.S3_BUCKET_SECRET_ACCESS_KEY_PROD
});

function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }

router.post('/file/als', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    const fileName = req.files ? req.files.file : null;
    const checkFleNme = fileName.name
    const checkFileName = checkFleNme.split(" ");
    let fileType;
    if(checkFileName.length === 1) {
        const checkFileType = checkFileName[0].split(".");
        fileType = checkFileType[1];
    }
    if (!fileName) {
        ApiResponse.sendResponse(res, 400, "Unable to get the file ");
        return;
    }
    if(checkFileName.length > 1) {
        ApiResponse.sendResponse(res, 400, "File Name Must not Contain Blank Spaces - Please Rename your File ");
        return;
    }
    if(fileType !== 'xlsx') {
        ApiResponse.sendResponse(res, 400, "Please Choose and Appropriate File - Supporting Only .XLSX files");
        return;
    }
    const folderBucketPath = 'maiora-life-sciences/study/alsDoc';
    const params = {
        Bucket: folderBucketPath,
        Key: "V1--" + req.files.file.name,
        Body: fileName.data,
        ContentEncoding: 'base64',
        ContentType: 'application/octet-stream',
        ACL: 'public-read'
    };
    const studys = await StudyDAO.findAllActiveSponser();
    let isAlreadyUploaded = [];
    let pathname;
    let verNum = 0;
    studys && studys.map(objs => {
        pathname = objs.docPath
        if (pathname !== "null") {
            let xlsxFileName = '';
            xlsxFileName = new URL(pathname).pathname.split('/').pop();
            let splitVersion = xlsxFileName.split('--');
            splitVersion && splitVersion.map(ver => {
                if (ver === req.files.file.name) {
                    isAlreadyUploaded.push("true");
                } else {
                    isAlreadyUploaded.push("false");
                }
            });
        }
    });
    let trueCount = 0
    isAlreadyUploaded && isAlreadyUploaded.map(upld => {
        if (upld === "true") {
            trueCount++;
        }
    });
    if (trueCount >= 1) {
        studys && studys.map(objs => {
            pathname = objs.docPath
            if (pathname !== "null") {
                xlsxFileName = new URL(pathname).pathname.split('/').pop();
                let splitVersion = xlsxFileName.split('--');
                splitVersion && splitVersion.map(ver => {
                    if (ver === req.files.file.name) {
                        if (splitVersion.length > 1) {
                            ;
                            splitVersion && splitVersion.map(num => {
                                let versionNum = num.split("");
                                if (versionNum[0] === "V" && isNumber(versionNum[1]) === true) {
                                    if (parseInt(versionNum[1]) >= verNum) {
                                        verNum = parseInt(versionNum[1]) + 1;
                                    }
                                }
                            })
                        }
                    }
                });
            }
        });
        const folderBucketPath = 'maiora-life-sciences/study/alsDoc';
        const params = {
            Bucket: folderBucketPath,
            Key: 'V' + verNum + '--' + req.files.file.name,
            Body: fileName.data,
            ContentEncoding: 'base64',
            ContentType: 'application/octet-stream',
            ACL: 'public-read'
        };
        return s3.upload(params, function (s3Err, data) {
            if (s3Err) {
                logger.error("Failed to upload file into S3");
                throw s3Err
            }
            path = data.Location;
            ApiResponse.sendResponse(res, 200, "File Already existing So Uploaded as a new Version", path);
        });
    }
    if (trueCount === 0) {
        return s3.upload(params, function (s3Err, data) {
            if (s3Err) {
                logger.error("Failed to upload file into S3");
                throw s3Err
            }
            path = data.Location;
            ApiResponse.sendResponse(res, 200, "Upload Success", path);
        });
    }
});


router.post('/file/sample', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    const bulkuploadedData = [];
    const fileName = req.files ? req.files.file : null;
    if (!fileName) {
        ApiResponse.sendResponse(res, 400, "Unable to get the file ");
        return;
    }
    if (fileName.length >= 2) {
        fileName && fileName.map(objs => {
            const nameFile = objs;
            const folderBucketPath = 'maiora-life-sciences/study/sampleData';
            const params = {
                Bucket: folderBucketPath,
                Key: (new Date().getTime()) + nameFile.name,
                Body: nameFile.data,
                ContentEncoding: 'base64',
                ContentType: 'application/octet-stream',
                ACL: 'public-read'
            };
            s3.upload(params, function (s3Err, data) {
                if (s3Err) {
                    logger.error("Failed to upload file into S3");
                    throw s3Err
                }
                // console.log(`File uploaded successfully at ${data.Location}`)
                path = data.Location;
                bulkuploadedData.push(path);
                if (bulkuploadedData.length === fileName.length) {
                    ApiResponse.sendResponse(res, 200, "Upload Success", bulkuploadedData);
                }
            });
        });
    }

    if (fileName && !fileName.length) {
        const folderBucketPath = 'maiora-life-sciences/study/sampleData';
        const params = {
            Bucket: folderBucketPath,
            Key: (new Date().getTime()) + req.files.file.name,
            Body: fileName.data,
            ContentEncoding: 'base64',
            ContentType: 'application/octet-stream',
            ACL: 'public-read'
        };
        return s3.upload(params, function (s3Err, data) {
            if (s3Err) {
                logger.error("Failed to upload file into S3");
                throw s3Err
            }
            // console.log(`File uploaded successfully at ${data.Location}`)
            path = data.Location;
            ApiResponse.sendResponse(res, 200, "Upload Success", path);
        });
    }
});

router.post('/file/sdtmupload', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    const bulkuploadedData = [];
    const fileName = req.files ? req.files.file : null;
    if (!fileName) {
        ApiResponse.sendResponse(res, 400, "Unable to get the file ");
        return;
    }
    if (fileName.length >= 2) {
        fileName && fileName.map(objs => {
            const nameFile = objs;
            const folderBucketPath = 'maiora-life-sciences/study/rawdata';
            const params = {
                Bucket: folderBucketPath,
                Key: nameFile.name,
                Body: nameFile.data,
                ContentEncoding: 'base64',
                ContentType: 'application/octet-stream',
                ACL: 'public-read'
            };
            s3.upload(params, function (s3Err, data) {
                if (s3Err) {
                    logger.error("Failed to upload file into S3");
                    throw s3Err
                }
                // console.log(`File uploaded successfully at ${data.Location}`)
                path = data.Location;
                bulkuploadedData.push(path);
                if (bulkuploadedData.length === fileName.length) {
                    ApiResponse.sendResponse(res, 200, "Upload Success", bulkuploadedData);
                }
            });
        });
    }

    if (fileName && !fileName.length) {
        const folderBucketPath = 'maiora-life-sciences/study/rawdata';
        const params = {
            Bucket: folderBucketPath,
            Key: req.files.file.name,
            Body: fileName.data,
            ContentEncoding: 'base64',
            ContentType: 'application/octet-stream',
            ACL: 'public-read'
        };
        return s3.upload(params, function (s3Err, data) {
            if (s3Err) {
                logger.error("Failed to upload file into S3");
                throw s3Err
            }
            // console.log(`File uploaded successfully at ${data.Location}`)
            path = data.Location;
            ApiResponse.sendResponse(res, 200, "Upload Success", path);
        });
    }
});

router.post('/file/reupload', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    const fileName = req.files ? req.files.file : null;
    const checkFleNme = fileName.name
    const checkFileName = checkFleNme.split(" ");
    let fileType;
    if(checkFileName.length === 1) {
        const checkFileType = checkFileName[0].split(".");
        fileType = checkFileType[1];
    }
    if (!fileName) {
        ApiResponse.sendResponse(res, 400, "Unable to get the file ");
        return;
    }
    if(checkFileName.length > 1) {
        ApiResponse.sendResponse(res, 400, "File Name Must not Contain Blank Spaces - Please Rename your File ");
        return;
    }
    if(fileType !== 'xlsx') {
        ApiResponse.sendResponse(res, 400, "Please Choose and Appropriate File - Supporting Only .XLSX files");
        return;
    }
    const folderBucketPath = 'maiora-life-sciences/study/alsDoc';
    const params = {
        Bucket: folderBucketPath,
        Key: "V1--" + req.files.file.name,
        Body: fileName.data,
        ContentEncoding: 'base64',
        ContentType: 'application/octet-stream',
        ACL: 'public-read'
    };
    const studys = await StudyDAO.findAllActiveSponser();
    let isAlreadyUploaded = [];
    let pathname;
    let verNum = 0;
    studys && studys.map(objs => {
        pathname = objs.docPath
        if (pathname !== "null") {
            let xlsxFileName = '';
            xlsxFileName = new URL(pathname).pathname.split('/').pop();
            let splitVersion = xlsxFileName.split('--');
            splitVersion && splitVersion.map(ver => {
                if (ver === req.files.file.name) {
                    isAlreadyUploaded.push("true");
                } else {
                    isAlreadyUploaded.push("false");
                }
            });
        }
    });
    let trueCount = 0
    isAlreadyUploaded && isAlreadyUploaded.map(upld => {
        if (upld === "true") {
            trueCount++;
        }
    });
    if (trueCount === 0) {
        return s3.upload(params, function (s3Err, data) {
            if (s3Err) {
                logger.error("Failed to upload file into S3");
                throw s3Err
            }
            path = data.Location;
            ApiResponse.sendResponse(res, 200, "Upload Success", path);
        });
    }
    if (trueCount >= 1) {
        studys && studys.map(objs => {
            pathname = objs.docPath
            if (pathname !== "null") {
                xlsxFileName = new URL(pathname).pathname.split('/').pop();
                let splitVersion = xlsxFileName.split('--');
                splitVersion && splitVersion.map(ver => {
                    if (ver === req.files.file.name) {
                        if (splitVersion.length > 1) {
                            splitVersion && splitVersion.map(num => {
                                let versionNum = num.split("");
                                let filteredVNum = num.split("V");
                                if (versionNum[0] === "V" && isNumber(filteredVNum[1]) === true) {
                                    if (parseInt(filteredVNum[1]) >= verNum) {
                                        verNum = parseInt(filteredVNum[1]) + 1;
                                    }
                                }
                            })
                        }
                    }
                });
            }
        });
        console.log("verNum ", verNum);
        const folderBucketPath = 'maiora-life-sciences/study/test';
        const params = {
            Bucket: folderBucketPath,
            Key: req.files.file.name,
            Body: fileName.data,
            ContentEncoding: 'base64',
            ContentType: 'application/octet-stream',
            ACL: 'public-read'
        };
        return s3.upload(params, function (s3Err, data) {
            if (s3Err) {
                logger.error("Failed to upload file into S3");
                throw s3Err
            }
            path = data.Location;
            pathname = data.Location;
            // console.log("pathname ", pathname);
            //-----------------------------------------------------------------------------
            xlsxFileName2 = new URL(pathname).pathname.split('/').pop();
            // console.log("xlsxFileName2 ", xlsxFileName2);
            var fileV2 = s3.getObject({ Bucket: "maiora-life-sciences/study/test", Key: xlsxFileName2 }).createReadStream();
            var buffersV2 = [];
            fileV2.on('data', function (data) {
                buffersV2.push(data);
            });
            fileV2.on('end', function () {
                var bufferV2 = Buffer.concat(buffersV2);
                var workbookV2 = xlsx.read(bufferV2);
                const sheetnamesV2 = Object.keys(workbookV2.Sheets);
                newUploadFileSheets = sheetnamesV2;
                var iV2 = sheetnamesV2.length;
                while (iV2--) {
                    const sheetnameV2 = sheetnamesV2[iV2];
                    arrayNameV2 = sheetnameV2.toString();
                    if (arrayNameV2.toUpperCase() == "DRAFT") {
                        dataV2Draft = xlsx.utils.sheet_to_json(workbookV2.Sheets[sheetnameV2]);
                        // console.log("dataV2Draft ", dataV2Draft);
                    }
                    if (arrayNameV2.toUpperCase() == "FOLDER") {
                        dataV2Folder = xlsx.utils.sheet_to_json(workbookV2.Sheets[sheetnameV2]);
                    }
                    if (arrayNameV2.toUpperCase() == "FORMS") {
                        dataV2Forms = xlsx.utils.sheet_to_json(workbookV2.Sheets[sheetnameV2]);
                    }
                    if (arrayNameV2.toUpperCase() == "FIELD") {
                        dataV2Field = xlsx.utils.sheet_to_json(workbookV2.Sheets[sheetnameV2]);
                    }
                    if (arrayNameV2.toUpperCase() == "DATA DICTIONARY") {
                        dataV2DataDictionary = xlsx.utils.sheet_to_json(workbookV2.Sheets[sheetnameV2]);
                        // console.log("dataV2DataDictionary ", dataV2DataDictionary);
                    }
                    if (arrayNameV2.toUpperCase() == "MATRIX") {
                        dataV2Matrix = xlsx.utils.sheet_to_json(workbookV2.Sheets[sheetnameV2]);
                    }
                    if (arrayNameV2.toUpperCase() == "VISITS") {
                        dataV2Visits = xlsx.utils.sheet_to_json(workbookV2.Sheets[sheetnameV2]);
                    }
                }
            });
            //-----------------------------------------------------------------------------------
            let numbr = parseInt(verNum) - 1;
            // console.log("verNum ", verNum);
            let xlsxFileName1 = "V" + numbr + "--" + req.files.file.name;
            // console.log("xlsxFileName1 ", xlsxFileName1);
            var fileV1 = s3.getObject({ Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName1 }).createReadStream();
            var buffersV1 = [];
            fileV1.on('data', function (data) {
                buffersV1.push(data);
            });
            fileV1.on('end', function () {
                var bufferV1 = Buffer.concat(buffersV1);
                var workbookV1 = xlsx.read(bufferV1);
                const sheetnamesV1 = Object.keys(workbookV1.Sheets);
                previouslyUploadedFileSheets = sheetnamesV1;
                var iV1 = sheetnamesV1.length;
                while (iV1--) {
                    const sheetnameV1 = sheetnamesV1[iV1];
                    arrayNameV1 = sheetnameV1.toString();
                    // console.log("arrayNameV1 ", arrayNameV1);
                    if (arrayNameV1.toUpperCase() == "DRAFT") {
                        dataV1Draft = xlsx.utils.sheet_to_json(workbookV1.Sheets[sheetnameV1]);
                        // console.log("dataV1Draft ", dataV1Draft);
                    }
                    if (arrayNameV1.toUpperCase() == "FOLDER") {
                        dataV1Folder = xlsx.utils.sheet_to_json(workbookV1.Sheets[sheetnameV1]);
                    }
                    if (arrayNameV1.toUpperCase() == "FORMS") {
                        dataV1Forms = xlsx.utils.sheet_to_json(workbookV1.Sheets[sheetnameV1]);
                    }
                    if (arrayNameV1.toUpperCase() == "FIELD") {
                        dataV1Field = xlsx.utils.sheet_to_json(workbookV1.Sheets[sheetnameV1]);
                    }
                    if (arrayNameV1.toUpperCase() == "DATA DICTIONARY") {
                        dataV1DataDictionary = xlsx.utils.sheet_to_json(workbookV1.Sheets[sheetnameV1]);
                        // console.log("dataV1DataDictionary ", dataV1DataDictionary);
                    }
                    if (arrayNameV1.toUpperCase() == "MATRIX") {
                        dataV1Matrix = xlsx.utils.sheet_to_json(workbookV1.Sheets[sheetnameV1]);
                    }
                    if (arrayNameV1.toUpperCase() == "VISITS") {
                        dataV1Visits = xlsx.utils.sheet_to_json(workbookV1.Sheets[sheetnameV1]);
                    }
                }
            });
            setTimeout(() => {
                let draft = JSON.stringify(dataV1Draft) == JSON.stringify(dataV2Draft);
                let folder = JSON.stringify(dataV1Folder) == JSON.stringify(dataV2Folder);
                let forms = JSON.stringify(dataV1Forms) == JSON.stringify(dataV2Forms);
                let field = JSON.stringify(dataV1Field) == JSON.stringify(dataV2Field);
                let datadictionary = JSON.stringify(dataV1DataDictionary) == JSON.stringify(dataV2DataDictionary);
                let matrix = JSON.stringify(dataV1Matrix) == JSON.stringify(dataV2Matrix);
                let visits = JSON.stringify(dataV1Visits) == JSON.stringify(dataV2Visits);

                if (draft === false || folder === false || forms === false || field === false || datadictionary === false || matrix === false || visits === false) {
                    const folderBucketPath = 'maiora-life-sciences/study/alsDoc';
                    const params = {
                        Bucket: folderBucketPath,
                        Key: 'V' + verNum + '--' + req.files.file.name,
                        Body: fileName.data,
                        ContentEncoding: 'base64',
                        ContentType: 'application/octet-stream',
                        ACL: 'public-read'
                    };
                    return s3.upload(params, function (s3Err, data) {
                        if (s3Err) {
                            logger.error("Failed to upload file into S3");
                            throw s3Err
                        }
                        path = data.Location;
                        ApiResponse.sendResponse(res, 200, "Changes Detected in this File - So Uploaded as a new Version", path);
                    });
                } else {
                    ApiResponse.sendResponse(res, 200, "This File is Already Uploaded - Please Choose Another File");
                }
            }, 2000);
        });
    }
});
module.exports = router;