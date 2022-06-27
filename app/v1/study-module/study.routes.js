const express = require("express");
const router = express.Router();
const StudyDAO = require("./study.dao");
const Study = require("./study.model");
const logger = require("../../utils/logger");
const Helper = require("../../utils/helper");
const APIResponse = require("../../models/apiResponse");
const Cryptic = require('../../utils/cryptic');
const AuthorizeMiddlewareAuth = require("../../middlewares/jwt/auth");
const AWS = require('aws-sdk');
const requiredKeysandIds = require('../../../config/custom-environment-variables.json');
const xlsx = require('xlsx')
const AlsStagingDAO = require('../als-staging-module/als-staging.dao');
const AlsStaging = require('../als-staging-module/als-staging.model');
const SdtmMappingDAO = require("../sdtm-mapping-module/sdtm-mapping.dao");
const SdtmMapping = require("../sdtm-mapping-module/sdtm-mapping.model");
const ChangedAlsDataDAO = require("../changed-als-data-module/changed-als-data.dao");

console.log("Route Study Loaded...!");
const s3 = new AWS.S3({
    accessKeyId: requiredKeysandIds.S3_BUCKET_ACCESS_KEY_ID_PROD,
    secretAccessKey: requiredKeysandIds.S3_BUCKET_SECRET_ACCESS_KEY_PROD
});

function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }

// Get all Study
router.get('/', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Study");
    let studys = null, message = null;
    try {
        studys = await StudyDAO.selectAll();
        message = 'Success';
    } catch (e) {
        logger.warn("Failed while GET request to Study", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, studys);
    return;
});

// Get all Study
router.get('/getActiveStudies', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Active Study");
    let studys = null, message = null;
    try {
        studys = await StudyDAO.findAllActiveSponser();
        message = 'Success';
    } catch (e) {
        logger.warn("Failed while GET request to Study", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, studys);
    return;
});

// Get all Studys byID
router.get('/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Study by id");
    let status, message = null, metadata;
    try {
        const study = await StudyDAO.selectById(id);
        if (study && study['_id']) {
            metadata = study;
            status = 200;
            message = 'Success'
        } else {
            message = `No Study found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to Study", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

//Get Study on Sponsor ID
router.get('/sponsorid/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Study by Sponsor_id");
    let status, message = null, metadata = null;
    try {
        const study = await StudyDAO.studyOnSponsorId(id);
        if (study) {
            metadata = study;
            status = 200;
            message = 'Success'
        } else {
            message = `No Study found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to Study", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});


//Creating Study
router.post('/create', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    let studyID;
    console.log('POST: Study');
    if (req.body) {
        const studyObj = Study.getStudyFromRequestObj(req.body);
        studyObj.uuid = Cryptic.hash(studyObj.title + studyObj.created + studyObj.sponsor_id);
        if (!studyObj || studyObj instanceof Study === false) {
            APIResponse.sendResponse(res, 400, 'Server error while processing the request');
            return;
        }
        let msg, stat, meta = null;
        try {
            meta = StudyDAO.create(studyObj);
            stat = 200;
            msg = 'Success'
        } catch (e) {
            msg = "Server error while creating the Study";
            stat = 500;
            meta = studyObj;
        }
        studyID = meta;
        let xlsxFileName = '';
        try {
            xlsxFileName = new URL(meta.docPath).pathname.split('/').pop();
        } catch (e) {
            console.log("e ", e);
        }
        var file = s3.getObject({ Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName }).createReadStream();
        var buffers = [];
        let splitVersion = xlsxFileName.split('--');
        let version = splitVersion[0];
        // console.log("splitVersion ", splitVersion[0], "version ", version);
        file.on('data', function (data) {
            buffers.push(data);
        });
        // TODO:Excel Reading
        file.on('end', function () {
            var buffer = Buffer.concat(buffers);
            var workbook = xlsx.read(buffer);
            const sheetnames = Object.keys(workbook.Sheets);
            // console.log("sheetnames ", sheetnames);
            let i = sheetnames.length;
            while (i--) {
                const sheetname = sheetnames[i];
                arrayName = sheetname.toString();
                data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
                var columnsIn = data[0];
                excelData = [];
                for (var key in columnsIn) {
                    excelData.push({ colname: key, isSelected: "true" });
                }
                // console.log("version ", version);
                const alsstagingObj = AlsStaging.getAlsStagingFromRequestObj({
                    study_UUID: JSON.stringify(meta._id),
                    version: version || 'null',
                    entityType: arrayName,
                    columns: JSON.stringify(excelData),
                    creating_user_uuid: "USER-UUID",
                    status: "UNSTAGED"
                });
                alsstagingObj.uuid = Cryptic.hash(alsstagingObj.study_UUID + alsstagingObj.created + alsstagingObj.version);
                // console.log("alsstagingObj ", alsstagingObj);
                if (!alsstagingObj || alsstagingObj instanceof AlsStaging === false) {
                    // console.log('res ', res);
                    APIResponse.sendResponse(res, 400, 'Server error while processing the request');
                    return;
                }
                let message, status, metadata = null;
                try {
                    message = AlsStagingDAO.create(alsstagingObj);
                    status = 200;
                } catch (e) {
                    // console.log("e ", e);
                    message = "Server error while creating the AlsStaging";
                    status = 500;
                    metadata = alsstagingObj;
                }
            }
        });
    }

    APIResponse.sendResponse(res, 200, 'Success', studyID);
    return;
});


//Updating Study
router.put('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('PUT: Study');
    const id = req.params.id;
    let alsstagingObj;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = Study.getStudyFromRequestObj(req.body, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const studyOnID = await StudyDAO.selectById(id);
    const previousUploadedALSdocPath = studyOnID.docPath;
    console.log("StudyONID ", studyOnID, "previousUploadedALSdocPath", previousUploadedALSdocPath);
    // let msg, stat, meta = null;
    // try {
    //     meta = await StudyDAO.update(id, updateables);
    //     stat = 200;
    //     msg = 'Success';
    // } catch (e) {
    //     msg = "Server error while updating the Study";
    //     stat = 500;
    //     meta = updateables;
    // }
    // APIResponse.sendResponse(res, stat, msg, meta);
    // return;
    // console.log("updateables ", updateables);
    if (updateables.docPath) {
        if (updateables.docPath == null || updateables.docPath === 'null') {
            APIResponse.sendResponse(res, 400, 'ALS Doc Path Cannot be null');
            return;
        }
    }
    let msg, stat, meta = null;
    try {
        meta = await StudyDAO.update(id, updateables);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while creating the Study";
        stat = 500;
        meta = updateables;
    }
    studyID = meta;
    console.log("meta ", meta);
    if (updateables.docPath) {
        let xlsxFileName = '';
        try {
            xlsxFileName = new URL(meta.docPath).pathname.split('/').pop();
        } catch (e) {
            console.log("e ", e);
        }
        var file = s3.getObject({ Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName }).createReadStream();
        var buffers = [];
        let splitVersion = xlsxFileName.split('--');
        let version = splitVersion[0];
        // console.log("splitVersion ", splitVersion[0], "version ", version);
        file.on('data', function (data) {
            buffers.push(data);
        });
        // TODO:Excel Reading
        file.on('end', function () {
            var buffer = Buffer.concat(buffers);
            var workbook = xlsx.read(buffer);
            const sheetnames = Object.keys(workbook.Sheets);
            // console.log("sheetnames ", sheetnames);
            let i = sheetnames.length;
            while (i--) {
                const sheetname = sheetnames[i];
                arrayName = sheetname.toString();
                data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
                var columnsIn = data[0];
                excelData = [];
                for (var key in columnsIn) {
                    excelData.push({ colname: key, isSelected: "true" });
                }
                // console.log("version ", version);
                alsstagingObj = AlsStaging.getAlsStagingFromRequestObj({
                    study_UUID: JSON.stringify(meta._id),
                    version: version || 'null',
                    entityType: arrayName,
                    columns: JSON.stringify(excelData),
                    creating_user_uuid: "USER-UUID",
                    status: "UNSTAGED"
                });
                alsstagingObj.uuid = Cryptic.hash(alsstagingObj.study_UUID + alsstagingObj.created + alsstagingObj.version);
                // console.log("alsstagingObj ", alsstagingObj);
                if (!alsstagingObj || alsstagingObj instanceof AlsStaging === false) {
                    // console.log('res ', res);
                    APIResponse.sendResponse(res, 400, 'Server error while processing the request');
                    return;
                }
                let message, status, metadata = null;
                // console.log("alsstagingObj ", alsstagingObj);
                try {
                    message = AlsStagingDAO.create(alsstagingObj);
                    status = 200;
                    console.log(status, "STATUS");
                } catch (e) {
                    // console.log("e ", e);
                    message = "Server error while creating the AlsStaging";
                    status = 500;
                    metadata = alsstagingObj;
                }
            }
        });

        let verNum = 0;
        num = version.split('V');
        verNum = num[1];
        console.log(version, " version ", verNum, "verNum");
        pathname = updateables.docPath;
        // console.log("pathname ", pathname);
        //-----------------------------------------------------------------------------
        xlsxFileName2 = new URL(pathname).pathname.split('/').pop();
        // console.log("xlsxFileName2 ", xlsxFileName2);
        var fileV2 = s3.getObject({ Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName2 }).createReadStream();
        var buffersV2 = [];
        // console.log("fileV2 ", fileV2);
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
                if ((arrayNameV2.toUpperCase() == "DRAFT") || arrayNameV2.toUpperCase() == "CRFDRAFT") {
                    dataV2Draft = xlsx.utils.sheet_to_json(workbookV2.Sheets[sheetnameV2]);
                    // console.log("dataV2Draft ", dataV2Draft);
                }
                if ((arrayNameV2.toUpperCase() == "FOLDER") || (arrayNameV2.toUpperCase() == "FOLDERS")) {
                    dataV2Folder = xlsx.utils.sheet_to_json(workbookV2.Sheets[sheetnameV2]);
                }
                if (arrayNameV2.toUpperCase() == "FORMS") {
                    dataV2Forms = xlsx.utils.sheet_to_json(workbookV2.Sheets[sheetnameV2]);
                }
                if ((arrayNameV2.toUpperCase() == "FIELD") || (arrayNameV2.toUpperCase() == "FIELDS")) {
                    dataV2Field = xlsx.utils.sheet_to_json(workbookV2.Sheets[sheetnameV2]);
                }
                if ((arrayNameV2.toUpperCase() == "DATA DICTIONARY") || (arrayNameV2.toUpperCase() == "DATADICTIONARIES")) {
                    dataV2DataDictionary = xlsx.utils.sheet_to_json(workbookV2.Sheets[sheetnameV2]);
                    // console.log("dataV2DataDictionary ", dataV2DataDictionary);
                }
                if ((arrayNameV2.toUpperCase() == "MATRIX") || (arrayNameV2.toUpperCase() == "MATRICES")) {
                    dataV2Matrix = xlsx.utils.sheet_to_json(workbookV2.Sheets[sheetnameV2]);
                }
                if (arrayNameV2.toUpperCase() == "VISITS") {
                    dataV2Visits = xlsx.utils.sheet_to_json(workbookV2.Sheets[sheetnameV2]);
                }
            }
        });
        //-----------------------------------------------------------------------------------
        let numbr = parseInt(verNum) - 1;
        console.log("verNum ", verNum);
        fileName = pathname.split('--');
        let xlsxFileName1 = "V" + numbr + "--" + fileName[1];
        console.log("xlsxFileName1 ", xlsxFileName1);
        // var fileV1 = s3.getObject({ Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName1 }).createReadStream();
        const params = { Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName1 }
        var fileV1
        s3.getObject(params, function (err, data) {
            if (err) {
                console.log(err, err.stack);
                msg = "Please Choose appropriate File";
                stat = 500;
                studyID = {};
                try {
                    meta2 = StudyDAO.update(id, { docPath: previousUploadedALSdocPath });
                    stat2 = 200;
                    msg2 = 'Success';
                    console.log("me ", me);
                } catch (e) {
                    msg2 = "Server error while updating the Study";
                    stat2 = 500;
                    meta2 = updateables;
                }
            }
            else {
                fileV1 = s3.getObject({ Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName1 }).createReadStream();
                var buffersV1 = [];
                fileV1.on('data', function (data) {
                    buffersV1.push(data);
                });
                // console.log("fileV1 ", fileV1);
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
                        if ((arrayNameV1.toUpperCase() == "DRAFT") || (arrayNameV1.toUpperCase() == "CRFDRAFT")) {
                            dataV1Draft = xlsx.utils.sheet_to_json(workbookV1.Sheets[sheetnameV1]);
                            // console.log("dataV1Draft ", dataV1Draft);
                        }
                        if ((arrayNameV1.toUpperCase() == "FOLDER") || (arrayNameV1.toUpperCase() == "FOLDERS")) {
                            dataV1Folder = xlsx.utils.sheet_to_json(workbookV1.Sheets[sheetnameV1]);
                        }
                        if (arrayNameV1.toUpperCase() == "FORMS") {
                            dataV1Forms = xlsx.utils.sheet_to_json(workbookV1.Sheets[sheetnameV1]);
                        }
                        if ((arrayNameV1.toUpperCase() == "FIELD") || (arrayNameV1.toUpperCase() == "FIELDS")) {
                            dataV1Field = xlsx.utils.sheet_to_json(workbookV1.Sheets[sheetnameV1]);
                        }
                        if ((arrayNameV1.toUpperCase() == "DATA DICTIONARY") || (arrayNameV1.toUpperCase() == "DATADICTIONARIES")) {
                            dataV1DataDictionary = xlsx.utils.sheet_to_json(workbookV1.Sheets[sheetnameV1]);
                            // console.log("dataV1DataDictionary ", dataV1DataDictionary);
                        }
                        if ((arrayNameV1.toUpperCase() == "MATRIX") || (arrayNameV1.toUpperCase() == "MATRICES")) {
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

                    if (draft === false) {
                        console.log("DRAFT Changes Detected");
                        let dataV1DraftLength = dataV1Draft.length;
                        let dataV2DraftLength = dataV2Draft.length;
                        let length = 0;
                        let changedDraftData = [];
                        if (dataV1DraftLength > dataV2DraftLength) {
                            length = dataV1DraftLength;
                        } else {
                            length = dataV2DraftLength;
                        }
                        // console.log('length ', length);
                        // console.log("dataV1DraftLength ", dataV1DraftLength, " dataV2DraftLength", dataV2DraftLength);
                        // console.log("dataV1Draft ", dataV1Draft ," dataV2Draft ", dataV2Draft);

                        for (i = 0; i < length; i++) {
                            // console.log(i, "dataV1Draft[i] ", dataV1Draft[i], "dataV2Draft[i]", dataV2Draft[i]);
                            // console.log(JSON.stringify(dataV1Draft[i]) == JSON.stringify(dataV2Draft[i]));
                            comp = JSON.stringify(dataV1Draft[i]) == JSON.stringify(dataV2Draft[i]);
                            if (comp === false) {
                                // console.log("FALSE");
                                let draftData;
                                if (dataV2Draft[i] === undefined) {
                                    draftData = {
                                        DeleteExisting: 'null',
                                        ProjectName: 'null',
                                        ProjectType: 'null',
                                        PrimaryFormOID: 'null',
                                        DefaultMatrixOID: 'null',
                                        ConfirmationMessage: 'null'
                                    }
                                } else {
                                    draftData = dataV2Draft[i];
                                }
                                changedDraftData.push(draftData);
                            }
                        }
                        // console.log("changedDraftData ", changedDraftData);
                        let draftModel = {
                            study_id: id,
                            data: JSON.stringify(changedDraftData),
                            entity: "Draft",
                            version: version
                        }
                        // console.log("draftModel ", draftModel);
                        resDraft = ChangedAlsDataDAO.create(draftModel);
                        // console.log("DRAFT RES ", resDraft);
                    }
                    if (folder === false) {
                        console.log("FOLDER Changes Detected");
                        let dataV1FolderLength = dataV1Folder.length;
                        let dataV2FolderLength = dataV2Folder.length;
                        let length = 0;
                        let changedFolderData = [];
                        if (dataV1FolderLength > dataV2FolderLength) {
                            length = dataV1FolderLength;
                        } else {
                            length = dataV2FolderLength;
                        }
                        // console.log('length ', length);
                        // console.log("dataV1FolderLength ", dataV1FolderLength, " dataV2FolderLength", dataV2FolderLength);
                        // console.log("dataV1Folder ", dataV1Folder ," dataV2Folder ", dataV2Folder);

                        for (i = 0; i < length; i++) {
                            // console.log(i, "dataV1Folder[i] ", dataV1Folder[i], "dataV2Folder[i]", dataV2Folder[i]);
                            // console.log(JSON.stringify(dataV1Folder[i]) == JSON.stringify(dataV2Folder[i]));
                            comp = JSON.stringify(dataV1Folder[i]) == JSON.stringify(dataV2Folder[i]);
                            if (comp === false) {
                                // console.log("FALSE");
                                let dataFolder;
                                if (dataV2Folder[i] === undefined) {
                                    dataFolder = {
                                        OID: 'null',
                                        Ordinal: 'null',
                                        FolderName: 'null',
                                        ParentFolderOID: 'null',
                                        IsReusable: 'null'
                                    }
                                } else {
                                    dataFolder = dataV2Folder[i];
                                }
                                changedFolderData.push(dataFolder);
                            }
                        }
                        // console.log("changedFolderData ", changedFolderData);
                        let folderModel = {
                            study_id: id,
                            data: JSON.stringify(changedFolderData),
                            entity: "Folder",
                            version: version
                        }
                        // console.log("folderModel ", folderModel);
                        resFolder = ChangedAlsDataDAO.create(folderModel);
                        // console.log("FOLDER RES ", resFolder);
                    }
                    if (forms === false) {
                        console.log("FORMS Changes Detected");
                        let dataV1FormsLength = dataV1Forms.length;
                        let dataV2FormsLength = dataV2Forms.length;
                        let length = 0;
                        let changedFormsData = [];
                        if (dataV1FormsLength > dataV2FormsLength) {
                            length = dataV1FormsLength;
                        } else {
                            length = dataV2FormsLength;
                        }
                        // console.log('length ', length);
                        // console.log("dataV1FormsLength ", dataV1FormsLength, " dataV2FormsLength", dataV2FormsLength);
                        // console.log("dataV1Forms ", dataV1Forms ," dataV2Forms ", dataV2Forms);

                        for (i = 0; i < length; i++) {
                            // console.log(i, "dataV1Forms[i] ", dataV1Forms[i], "dataV2Forms[i]", dataV2Forms[i]);
                            // console.log(JSON.stringify(dataV1Forms[i]) == JSON.stringify(dataV2Forms[i]));
                            comp = JSON.stringify(dataV1Forms[i]) == JSON.stringify(dataV2Forms[i]);
                            if (comp === false) {
                                // console.log("FALSE");
                                let dataForms;
                                if (dataV2Forms[i] === undefined) {
                                    dataForms = {
                                        OID: 'null',
                                        Ordinal: 'null',
                                        DraftFormName: 'null',
                                        DraftFormActive: 'null',
                                        IsTemplate: 'null',
                                        IsSignatureRequired: 'null',
                                        ViewRestrictions: 'null',
                                        EntryRestrictions: 'null'
                                    }
                                } else {
                                    dataForms = dataV2Forms[i];
                                }
                                changedFormsData.push(dataForms);
                            }
                        }
                        // console.log("changedFormsData ", changedFormsData);
                        let formsModel = {
                            study_id: id,
                            data: JSON.stringify(changedFormsData),
                            entity: "Form",
                            version: version
                        }
                        // console.log("formsModel ", formsModel);
                        resForms = ChangedAlsDataDAO.create(formsModel);
                        // console.log("FORMS RES ", resForms);
                    }
                    if (field === false) {
                        console.log("FIELD Changes Detected");
                        let dataV1FieldLength = dataV1Field.length;
                        let dataV2FieldLength = dataV2Field.length;
                        let length = 0;
                        let changedFieldData = [];
                        if (dataV1FieldLength > dataV2FieldLength) {
                            length = dataV1FieldLength;
                        } else {
                            length = dataV2FieldLength;
                        }
                        // console.log('length ', length);
                        // console.log("dataV1FieldLength ", dataV1FieldLength, " dataV2FieldLength", dataV2FieldLength);
                        // console.log("dataV1Field ", dataV1Field ," dataV2Field ", dataV2Field);

                        for (i = 0; i < length; i++) {
                            // console.log(i, "dataV1Field[i] ", dataV1Field[i], "dataV2Field[i]", dataV2Field[i]);
                            // console.log(JSON.stringify(dataV1Field[i]) == JSON.stringify(dataV2Field[i]));
                            comp = JSON.stringify(dataV1Field[i]) == JSON.stringify(dataV2Field[i]);
                            if (comp === false) {
                                // console.log("FALSE");
                                let dataField;
                                if (dataV2Field[i] === undefined) {
                                    dataField = {
                                        FormOID: 'null',
                                        FieldOID: 'null',
                                        Ordinal: 'null',
                                        DraftFieldName: 'null',
                                        DraftFieldActive: 'null',
                                        VariableOID: 'null',
                                        DataFormat: 'null',
                                        ControlType: 'null',
                                        PreText: 'null',
                                        SourceDocument: 'null',
                                        IsLog: 'null',
                                        SASLabel: 'null',
                                        IsRequired: 'null',
                                        QueryFutureDate: 'null',
                                        IsVisible: 'null',
                                        IsClinicalSignificance: 'null',
                                        QueryNonConformance: 'null',
                                        DoesNotBreakSignature: 'null',
                                        ViewRestrictions: 'null'
                                    }
                                } else {
                                    dataField = dataV2Field[i];
                                }
                                changedFieldData.push(dataField);
                            }
                        }
                        // console.log("changedFieldData ", changedFieldData);
                        let fieldModel = {
                            study_id: id,
                            data: JSON.stringify(changedFieldData),
                            entity: "Field",
                            version: version
                        }
                        // console.log("fieldModel ", fieldModel);
                        resField = ChangedAlsDataDAO.create(fieldModel);
                        // console.log("FIELD RES ", resField);
                    }
                    if (datadictionary === false) {
                        console.log("DATA DICTIONARY Changes Detected");
                        let dataV1DataDictionaryLength = dataV1DataDictionary.length;
                        let dataV2DataDictionaryLength = dataV2DataDictionary.length;
                        let length = 0;
                        let changedDataDictionaryData = [];
                        if (dataV1DataDictionaryLength > dataV2DataDictionaryLength) {
                            length = dataV1DataDictionaryLength;
                        } else {
                            length = dataV2DataDictionaryLength;
                        }
                        // console.log('length ', length);
                        // console.log("dataV1DataDictionaryLength ", dataV1DataDictionaryLength, " dataV2DataDictionaryLength", dataV2DataDictionaryLength);
                        // console.log("dataV1DataDictionary ", dataV1DataDictionary ," dataV2DataDictionary ", dataV2DataDictionary);

                        for (i = 0; i < length; i++) {
                            // console.log(i, "dataV1DataDictionary[i] ", dataV1DataDictionary[i], "dataV2DataDictionary[i]", dataV2DataDictionary[i]);
                            // console.log(JSON.stringify(dataV1DataDictionary[i]) == JSON.stringify(dataV2DataDictionary[i]));
                            comp = JSON.stringify(dataV1DataDictionary[i]) == JSON.stringify(dataV2DataDictionary[i]);
                            if (comp === false) {
                                // console.log("FALSE");
                                let dataDataDictionary;
                                if (dataV2DataDictionary[i] === undefined) {
                                    dataDataDictionary = {
                                        DataDictionaryName: 'null',
                                        CodedData: 'null',
                                        Ordinal: 'null',
                                        UserDataString: 'null',
                                        Specify: 'null'
                                    }
                                } else {
                                    dataDataDictionary = dataV2DataDictionary[i];
                                }
                                changedDataDictionaryData.push(dataDataDictionary);
                            }
                        }
                        // console.log("changedDataDictionaryData ", changedDataDictionaryData);
                        let dataDictionaryModel = {
                            study_id: id,
                            data: JSON.stringify(changedDataDictionaryData),
                            entity: "Data Dictionary",
                            version: version
                        }
                        // console.log("dataDictionaryModel ", dataDictionaryModel);
                        resDatadictionary = ChangedAlsDataDAO.create(dataDictionaryModel);
                        // console.log("DATADICTIONARY RES ", resDatadictionary);
                    }
                    if (matrix === false) {
                        console.log("MATRIX Changes Detected");
                        let dataV1MatrixLength = dataV1Matrix.length;
                        let dataV2MatrixLength = dataV2Matrix.length;
                        let length = 0;
                        let changedMatrix = [];
                        if (dataV1MatrixLength > dataV2MatrixLength) {
                            length = dataV1MatrixLength;
                        } else {
                            length = dataV2MatrixLength;
                        }
                        // console.log('length ', length);
                        // console.log("dataV1MatrixLength ", dataV1MatrixLength, " dataV2MatrixLength", dataV2MatrixLength);
                        // console.log("dataV1Matrix ", dataV1Matrix ," dataV2Matrix ", dataV2Matrix);

                        for (i = 0; i < length; i++) {
                            // console.log(i, "dataV1Matrix[i] ", dataV1Matrix[i], "dataV2Matrix[i]", dataV2Matrix[i]);
                            // console.log(JSON.stringify(dataV1Matrix[i]) == JSON.stringify(dataV2Matrix[i]));
                            comp = JSON.stringify(dataV1Matrix[i]) == JSON.stringify(dataV2Matrix[i]);
                            if (comp === false) {
                                // console.log("FALSE");
                                let dataMatrix;
                                if (dataV2Matrix[i] === undefined) {
                                    dataMatrix = {
                                        MatrixName: 'null',
                                        OID: 'null',
                                        Addable: 'null',
                                        Maximum: 'null'
                                    }
                                } else {
                                    dataMatrix = dataV2Matrix[i];
                                }
                                changedMatrix.push(dataMatrix);
                            }
                        }
                        // console.log("changedMatrix ", changedMatrix);
                        let matrixModel = {
                            study_id: id,
                            data: JSON.stringify(changedMatrix),
                            entity: "Matrix",
                            version: version
                        }
                        // console.log("matrixModel ", matrixModel);
                        resMatrix = ChangedAlsDataDAO.create(matrixModel);
                        // console.log("MATRIX RES ", resMatrix);
                    }
                    if (visits === false) {
                        console.log("VISITS Changes Detected");
                        let dataV1VisitsLength = dataV1Visits.length;
                        let dataV2VisitsLength = dataV2Visits.length;
                        let length = 0;
                        let changedVisits = [];
                        if (dataV1VisitsLength > dataV2VisitsLength) {
                            length = dataV1VisitsLength;
                        } else {
                            length = dataV2VisitsLength;
                        }
                        // console.log('length ', length);
                        // console.log("dataV1VisitsLength ", dataV1VisitsLength, " dataV2VisitsLength", dataV2VisitsLength);
                        // console.log("dataV1Visits ", dataV1Visits ," dataV2Visits ", dataV2Visits);

                        for (i = 0; i < length; i++) {
                            // console.log(i, "dataV1Visits[i] ", dataV1Visits[i], "dataV2Visits[i]", dataV2Visits[i]);
                            // console.log(JSON.stringify(dataV1Visits[i]) == JSON.stringify(dataV2Visits[i]));
                            comp = JSON.stringify(dataV1Visits[i]) == JSON.stringify(dataV2Visits[i]);
                            if (comp === false) {
                                // console.log("FALSE");
                                let dataVisits;
                                if (dataV2Visits[i] === undefined) {
                                    dataVisits = {
                                        MatrixName: 'null',
                                        OID: 'null',
                                        Addable: 'null',
                                        Maximum: 'null'
                                    }
                                } else {
                                    dataVisits = dataV2Visits[i];
                                }
                                changedVisits.push(dataVisits);
                            }
                        }
                        // console.log("changedVisits ", changedVisits);
                        let visitsModel = {
                            study_id: id,
                            data: JSON.stringify(changedVisits),
                            entity: "Visits",
                            version: version
                        }
                        // console.log("visitsModel ", visitsModel);
                        resVisit = ChangedAlsDataDAO.create(visitsModel);
                        // console.log("VISITS RES ", resVisit);
                    }
                }, 5000);
            }
        });
    }
    setTimeout(() => {
        APIResponse.sendResponse(res, stat, msg, studyID);
        return;
    }, 5000);
});


//Deleting the Study
router.delete('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('DELETE: Study');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = Study.getStudyFromRequestObj({ isActive: false }, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await StudyDAO.update(id, updateables);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while deleting the Study";
        stat = 500;
        meta = studyObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});

//Updating Study
router.put('/runmap/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('PUT: Study');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = Study.getStudyFromRequestObj(req.body, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await StudyDAO.update(id, updateables);
        stat = 200;
        msg = 'Success';

        //FOR TEMPORARY PURPOSE (TESTING AND DEMO) -----------FORM HERE------
        console.log('POST: SdtmMapping');
        const sdtmmappingObj = SdtmMapping.getSDTMMappingFromRequestObj({
            "study_id": id,
            "study_version": "STD-101-SUB-102",
            "entityType": "ENROL",
            "columnNames": "[{'colname':'STUDYID'},{'colname':'SITEID'},{'colname':'SUBJID'},{'colname':'VISITID'},{'colname':'VISSEQ'},{'colname':'eCRF_VERSION'},{'colname':'VERSION'},{'colname':'SUBJECT'},{'colname':'PART'}]",
            "mapped_data": "[{\"STUDYID\":\"STUDY-01\",\"SITEID\":\"Site-101\",\"SUBJID\":\"STD-101-SUB-101\",\"VISITID\":\"V-101\",\"VISSEQ\":1,\"eCRF_VERSION\":\"CRF-101\",\"VERSION\":\"EN-1.0.0\",\"SUBJECT\":\"STD-101-SUB-101\",\"PART\":false},{\"STUDYID\":\"STUDY-01\",\"SITEID\":\"Site-101\",\"SUBJID\":\"STD-101-SUB-102\",\"VISITID\":\"V-101\",\"VISSEQ\":1,\"eCRF_VERSION\":\"CRF-101\",\"VERSION\":\"EN-1.0.0\",\"SUBJECT\":\"STD-101-SUB-102\",\"PART\":false},{\"STUDYID\":\"STUDY-01\",\"SITEID\":\"Site-101\",\"SUBJID\":\"STD-101-SUB-103\",\"VISITID\":\"V-101\",\"VISSEQ\":1,\"eCRF_VERSION\":\"CRF-101\",\"VERSION\":\"EN-1.0.0\",\"SUBJECT\":\"STD-101-SUB-103\",\"PART\":false},{\"STUDYID\":\"STUDY-01\",\"SITEID\":\"Site-101\",\"SUBJID\":\"STD-101-SUB-104\",\"VISITID\":\"V-101\",\"VISSEQ\":1,\"eCRF_VERSION\":\"CRF-101\",\"VERSION\":\"EN-1.0.0\",\"SUBJECT\":\"STD-101-SUB-104\",\"PART\":false},{\"STUDYID\":\"STUDY-01\",\"SITEID\":\"Site-101\",\"SUBJID\":\"STD-101-SUB-105\",\"VISITID\":\"V-101\",\"VISSEQ\":1,\"eCRF_VERSION\":\"CRF-101\",\"VERSION\":\"EN-1.0.0\",\"SUBJECT\":\"STD-101-SUB-105\",\"PART\":false}]",
            "status": "PASS",
            "version": "version"
        });
        console.log("sdtmmappingObj ", sdtmmappingObj);
        sdtmmappingObj.uuid = Cryptic.hash(sdtmmappingObj.subject + sdtmmappingObj.created + sdtmmappingObj.study_id);
        if (!sdtmmappingObj || sdtmmappingObj instanceof SdtmMapping === false) {
            APIResponse.sendResponse(res, 400, 'Server error while processing the request');
            return;
        }
        const sdtm = SdtmMappingDAO.create(sdtmmappingObj);
        console.log("sdtm", sdtm);

        // -----------UPTO HERE--------- FOR TEMPORARY PURPOSE
    } catch (e) {
        console.log("EEE***", e);
        msg = "Server error while updating the Study";
        stat = 500;
        meta = updateables;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});

module.exports = router;