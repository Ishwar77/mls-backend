const express = require("express");
const router = express.Router();
const AlsStagingDAO = require("./als-staging.dao");
const AlsStaging = require("./als-staging.model");
const logger = require("../../utils/logger");
const Helper = require("../../utils/helper");
const APIResponse = require("../../models/apiResponse");
const Cryptic = require('../../utils/cryptic');
const AuthorizeMiddleware = require("../../middlewares/authorize");
const AuthorizeMiddlewareAuth = require("../../middlewares/jwt/auth");
const DraftDAO = require('../draft-module/draft.dao');
const FolderDAO = require('../folder-module/folder.dao');
const FormDAO = require('../forms-module/forms.dao');
const FieldDAO = require('../field-module/field.dao');
const DataDictionaryDAO = require('../data-dictionary-module/data-dictionary.dao');
const MatrixDAO = require('../matrix-module/matrix.dao');
const VisitDAO = require('../visits-module/visits.dao');
const StudyDAO = require('../study-module/study.dao');
const SyncSaveDAO = require("../sync-save-module/sync-save.dao");
const TestCaseGeneration = require('../../others/runscript');
const AWS = require('aws-sdk');
const requiredKeysandIds = require('../../../config/custom-environment-variables.json');
const xlsx = require('xlsx')

console.log("Route ALS Staging Loaded...!");
const s3 = new AWS.S3({
    accessKeyId: requiredKeysandIds.S3_BUCKET_ACCESS_KEY_ID_PROD,
    secretAccessKey: requiredKeysandIds.S3_BUCKET_SECRET_ACCESS_KEY_PROD
});

function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }

// Get all AlsStaging
router.get('/', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: AlsStaging");
    let alsstagings = null, message = null;
    try {
        alsstagings = await AlsStagingDAO.selectAll();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to AlsStaging", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, alsstagings);
    return;
});

// Get all AlsStaging
router.get('/getActiveAlsStaging', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Active AlsStaging");
    let alsstagings = null;
    try {
        alsstagings = await AlsStagingDAO.findAllActiveSponser();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to AlsStaging", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, alsstagings);
    return;
});

// Get all AlsStagings byID
router.get('/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: AlsStaging by id");
    let status, message = null, metadata;
    try {
        const alsstaging = await AlsStagingDAO.selectById(id);
        if (alsstaging && alsstaging['_id']) {
            metadata = alsstaging;
            status = 200;
            message = 'Success'
        } else {
            metadata = `No AlsStaging found with id ${id}`;
            status = 404;
            message = 'Nothing to Display'
        }
    } catch (e) {
        logger.warn("Failed while GET request to AlsStaging", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});


// Get all AlsStagings byStudyID
router.get('/studyid/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: AlsStaging by id");
    let status, message = null, metadata = null;
    try {
        const alsstaging = await AlsStagingDAO.alsStagingOnStudyId(JSON.stringify(id));
        if (alsstaging) {
            metadata = alsstaging;
            status = 200;
            message = 'Success'
        } else {
            metadata = `No AlsStaging found with id ${id}`;
            status = 404;
            message = 'Nothing to Display'
        }
    } catch (e) {
        logger.warn("Failed while GET request to AlsStaging", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});


// Get all AlsStagings byStudyID and Version
router.get('/version/:ver/studyid/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    const ver = req.params.ver;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: AlsStaging by id");
    let status, message = null, metadata = null;
    try {
        const alsstaging = await AlsStagingDAO.findStagingDataOnLatestVer(ver, JSON.stringify(id));
        if (alsstaging) {
            metadata = alsstaging;
            status = 200;
            message = 'Success'
        } else {
            metadata = `No AlsStaging found with id ${id}`;
            status = 404;
            message = 'Nothing to Display'
        }
    } catch (e) {
        logger.warn("Failed while GET request to AlsStaging", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});


// Get all AlsStagings byStudyID snd Latest Version
router.get('/latestversion/study/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: AlsStaging by id");
    let status, message = null, alsmetadata = null, metadata = null;
    try {
        const alsstaging = await AlsStagingDAO.alsStagingOnStudyId(JSON.stringify(id));
        if (alsstaging) {
            alsmetadata = alsstaging;
            // console.log("alsmetadata ", alsmetadata);
            let verNum = 0;
            alsmetadata && alsmetadata.map(verN => {
                let filteredVNum = verN.version
                if (filteredVNum !== 'null') {
                    let versionNum = filteredVNum.split("V");
                    let firstVer = filteredVNum.split("");
                    if (firstVer[0] === "V" && isNumber(versionNum[1]) === true) {
                        if (parseInt(versionNum[1]) >= verNum) {
                            verNum = parseInt(versionNum[1]);
                        }
                    }
                }
            });
            let versn = 'V' + verNum;
            metadata = await AlsStagingDAO.findStagingDataOnLatestVer(versn, JSON.stringify(id))
            status = 200;
            message = 'Success'
        } else {
            metadata = `No AlsStaging found with id ${id}`;
            status = 404;
            message = 'Nothing to Display'
        }
    } catch (e) {
        logger.warn("Failed while GET request to AlsStaging", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

//Creating AlsStaging
router.post('/create', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: AlsStaging');
    const alsstagingObj = AlsStaging.getAlsStagingFromRequestObj(req.body);
    alsstagingObj.uuid = Cryptic.hash(alsstagingObj.study_UUID + alsstagingObj.created + alsstagingObj.version);
    if (!alsstagingObj || alsstagingObj instanceof AlsStaging === false || alsstagingObj.hasError()) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = AlsStagingDAO.create(alsstagingObj);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while creating the AlsStaging";
        stat = 500;
        meta = alsstagingObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


//Updating AlsStaging
router.put('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('PUT: AlsStaging');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = AlsStaging.getAlsStagingFromRequestObj(req.body, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await AlsStagingDAO.update(id, updateables);
        stat = 200;
        msg = 'Success';
    } catch (e) {
        msg = "Server error while updating the AlsStaging";
        stat = 500;
        meta = updateables;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


//Deleting the AlsStaging
router.delete('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('DELETE: AlsStaging');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = AlsStaging.getAlsStagingFromRequestObj({ isActive: false }, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await AlsStagingDAO.update(id, updateables);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while deleting the AlsStaging";
        stat = 500;
        meta = alsstagingObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


router.post('/bulkCreate', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: AlsStaging');
    const alsstagingObj = req.body;
    if (!alsstagingObj) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = AlsStagingDAO.bulkCreate(alsstagingObj);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        console.log("e ", e);
        msg = "Server error while creating the AlsStaging";
        stat = 500;
        meta = alsstagingObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


// Stagging Study Hierarchy
router.post('/staging/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    let pathname = req.body.docPath;
    let fileName = new URL(pathname).pathname.split('/').pop();
    let splitVersion = fileName.split('--');
    let version = splitVersion[0];
    // console.log("splitVersion ", splitVersion[0]);
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let status, message = null;
    try {
        const alsstaging = await AlsStagingDAO.alsStagingOnStudyId(JSON.stringify(id));;
        if (alsstaging) {
            let draftData, folderData, formData, fieldData, ddData, matrixData, visitData;
            const testcsegen = TestCaseGeneration.runGenerationTestCaseScript(pathname, id);
            console.log("TEST CASE GENERATED");
            alsstaging && alsstaging.map(objs => {
                // console.log("OBJS ", (objs.entityType).toUpperCase());
                if (((objs.entityType).toUpperCase() == "DRAFT") || (objs.entityType).toUpperCase() == "CRFDRAFT") {
                    console.log("INSITE DRAFT IF ");
                    let xlsxFileName = '';
                    try {
                        xlsxFileName = new URL(pathname).pathname.split('/').pop();
                    } catch (e) {
                        console.log("e ", e);
                    }
                    var file = s3.getObject({ Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName }).createReadStream();
                    var buffers = [];
                    file.on('data', function (data) {
                        buffers.push(data);
                    });
                    file.on('end', function () {
                        var buffer = Buffer.concat(buffers);
                        var workbook = xlsx.read(buffer);
                        const sheetnames = Object.keys(workbook.Sheets);
                        var i = sheetnames.length;
                        while (i--) {
                            const sheetname = sheetnames[i];
                            arrayName = sheetname.toString();
                            if ((arrayName.toUpperCase() == "DRAFT") || (arrayName.toUpperCase() == "CRFDRAFT")) {
                                data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
                                const columnDataDraft = [];
                                JSON.parse(objs.columns) && JSON.parse(objs.columns).map(col => {
                                    if (col.isSelected === "true") {
                                        columnDataDraft.push({ name: col.colname })
                                    }
                                });
                                // console.log("data Draft ", data);
                                const mappingDraft = data && data.map(ele => {
                                    return Object.assign({}, ele, {
                                        study_id: id,
                                        // draftName: ((columnDataDraft.filter(ele => (ele.name).toUpperCase() === "DRAFTNAME")).length) ? ele.DraftName : 'null' || 'null',
                                        // description: ((columnDataDraft.filter(ele => (ele.name).toUpperCase() === "DESCRIPTION")).length) ? ele.description : 'null' || 'null',
                                        // deleteExisting: ((columnDataDraft.filter(ele => (ele.name).toUpperCase() === "DELETEEXISTING")).length) ? ele.DeleteExisting : 'null' || 'null',
                                        // projectName: ((columnDataDraft.filter(ele => (ele.name).toUpperCase() === "PROJECTNAME")).length) ? ele.ProjectName : 'null' || 'null',
                                        // projectType: ((columnDataDraft.filter(ele => (ele.name).toUpperCase() === "PROJECTTYPE")).length) ? ele.ProjectType : 'null' || 'null',
                                        // primaryFormOID: ((columnDataDraft.filter(ele => (ele.name).toUpperCase() === "PRIMARYFORMOID")).length) ? ele.PrimaryFormOID : 'null' || 'null',
                                        // DefaultMatrixOID: ((columnDataDraft.filter(ele => (ele.name).toUpperCase() === "DEFAULTMATRIXOID")).length) ? ele.DefaultMatrixOID : 'null' || 'null',
                                        // confirmMessage: ((columnDataDraft.filter(ele => (ele.name).toUpperCase() === "CONFIRMATIONMESSAGE")).length) ? ele.ConfirmationMessage : 'null' || 'null',
                                        // version: ((columnDataDraft.filter(ele => (ele.name).toUpperCase() === "VERSION")).length) ? ele.Version : 'null' || 'null'
                                        draftName: ele.DraftName || 'null',
                                        description: ele.description || 'null',
                                        deleteExisting: ele.DeleteExisting || 'null',
                                        projectName: ele.ProjectName || 'null',
                                        projectType: ele.ProjectType || 'null',
                                        primaryFormOID: ele.PrimaryFormOID || 'null',
                                        DefaultMatrixOID: ele.DefaultMatrixOID || 'null',
                                        confirmMessage: ele.ConfirmationMessage || 'null',
                                        version: version || 'null'
                                    });
                                });
                                draftData = [...mappingDraft];
                            }
                        }
                    });
                }
                if (((objs.entityType).toUpperCase() == "FOLDER") || (objs.entityType).toUpperCase() == "FOLDERS") {
                    let xlsxFileName = '';
                    try {
                        xlsxFileName = new URL(pathname).pathname.split('/').pop();
                    } catch (e) {
                        console.log("e ", e);
                    }
                    var file = s3.getObject({ Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName }).createReadStream();
                    var buffers = [];
                    file.on('data', function (data) {
                        buffers.push(data);
                    });
                    file.on('end', function () {
                        var buffer = Buffer.concat(buffers);
                        var workbook = xlsx.read(buffer);
                        const sheetnames = Object.keys(workbook.Sheets);
                        var i = sheetnames.length;
                        while (i--) {
                            const sheetname = sheetnames[i];
                            arrayName = sheetname.toString();
                            if ((arrayName.toUpperCase() == "FOLDER") || (arrayName.toUpperCase() == "FOLDERS")) {
                                data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
                                const columnDataFolder = [];
                                JSON.parse(objs.columns) && JSON.parse(objs.columns).map(col => {
                                    if (col.isSelected === "true") {
                                        columnDataFolder.push({ name: col.colname })
                                    }
                                });
                                // console.log("columnDataFolder ", columnDataFolder);
                                const mappingFolder = data && data.map(ele => {
                                    return Object.assign({}, ele, {
                                        study_id: id,
                                        // oid: ((columnDataFolder.filter(ele => (ele.name).toUpperCase() === "OID")).length) ? ele.OID : 'null' || 'null',
                                        oid: ele.OID || 'null',
                                        ordinal: ((columnDataFolder.filter(ele => (ele.name).toUpperCase() === "ORDINAL")).length) ? ele.Ordinal : 'null' || 'null',
                                        folderName: ((columnDataFolder.filter(ele => (ele.name).toUpperCase() === "FOLDERNAME")).length) ? ele.FolderName : 'null' || 'null',
                                        parentFolderOID: ((columnDataFolder.filter(ele => (ele.name).toUpperCase() === "PARENTFOLDEROID")).length) ? ele.ParentFolderOID : 'null' || 'null',
                                        isReusable: ((columnDataFolder.filter(ele => (ele.name).toUpperCase() === "ISREUSABLE")).length) ? ele.IsReusable : 'null' || 'null',
                                        version: version || 'null',
                                    });
                                });
                                folderData = [...mappingFolder];
                            }
                        }
                    });
                }
                if ((objs.entityType).toUpperCase() == "FORMS") {
                    let xlsxFileName = '';
                    try {
                        xlsxFileName = new URL(pathname).pathname.split('/').pop();
                    } catch (e) {
                        console.log("e ", e);
                    }
                    var file = s3.getObject({ Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName }).createReadStream();
                    var buffers = [];
                    file.on('data', function (data) {
                        buffers.push(data);
                    });
                    file.on('end', function () {
                        var buffer = Buffer.concat(buffers);
                        var workbook = xlsx.read(buffer);
                        const sheetnames = Object.keys(workbook.Sheets);
                        var i = sheetnames.length;
                        while (i--) {
                            const sheetname = sheetnames[i];
                            arrayName = sheetname.toString();
                            if (arrayName.toUpperCase() == "FORMS") {
                                data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
                                const columnDataForm = [];
                                JSON.parse(objs.columns) && JSON.parse(objs.columns).map(col => {
                                    if (col.isSelected === "true") {
                                        columnDataForm.push({ name: col.colname })
                                    }
                                });
                                // console.log("columnDataForm ", columnDataForm);
                                const mappingForm = data && data.map(ele => {
                                    return Object.assign({}, ele, {
                                        study_id: id,
                                        // oid: ((columnDataForm.filter(ele => (ele.name).toUpperCase() === "OID")).length) ? ele.OID : 'null' || 'null',
                                        oid: ele.OID || 'null',
                                        ordinal: ((columnDataForm.filter(ele => (ele.name).toUpperCase() === "ORDINAL")).length) ? ele.Ordinal : 'null' || 'null',
                                        draftFormName: ((columnDataForm.filter(ele => (ele.name).toUpperCase() === "DRAFTFORMNAME")).length) ? ele.DraftFormName : 'null' || 'null',
                                        draftFormActive: ((columnDataForm.filter(ele => (ele.name).toUpperCase() === "DRAFTFORMACTIVE")).length) ? ele.DraftFormActive : 'null' || 'null',
                                        isTemplate: ((columnDataForm.filter(ele => (ele.name).toUpperCase() === "ISTEMPLATE")).length) ? ele.IsTemplate : 'null' || 'null',
                                        isSignatureRequired: ((columnDataForm.filter(ele => (ele.name).toUpperCase() === "ISSIGNATUREREQUIRED")).length) ? ele.IsSignatureRequired : 'null' || 'null',
                                        viewRestrictions: ((columnDataForm.filter(ele => (ele.name).toUpperCase() === "VIEWRESTRICTIONS")).length) ? ele.ViewRestrictions : 'null' || 'null',
                                        entryRestrictions: ((columnDataForm.filter(ele => (ele.name).toUpperCase() === "ENTRYRESTRICTIONS")).length) ? ele.EntryRestrictions : 'null' || 'null',
                                        logDirection: ((columnDataForm.filter(ele => (ele.name).toUpperCase() === "LOGDIRECTION")).length) ? ele.LogDirection : 'null' || 'null',
                                        // version: ((columnDataForm.filter(ele => (ele.name).toUpperCase() === "VERSION")).length) ? ele.Version : 'null' || 'null'
                                        version: version || 'null'
                                    });
                                });
                                formData = [...mappingForm];
                            }
                        }
                    });
                }
                if (((objs.entityType).toUpperCase() == "FIELD") || (objs.entityType).toUpperCase() == "FIELDS") {
                    let xlsxFileName = '';
                    try {
                        xlsxFileName = new URL(pathname).pathname.split('/').pop();
                    } catch (e) {
                        // console.log("e ", e);
                    }
                    var file = s3.getObject({ Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName }).createReadStream();
                    var buffers = [];
                    file.on('data', function (data) {
                        buffers.push(data);
                    });
                    file.on('end', function () {
                        var buffer = Buffer.concat(buffers);
                        var workbook = xlsx.read(buffer);
                        const sheetnames = Object.keys(workbook.Sheets);
                        var i = sheetnames.length;
                        while (i--) {
                            const sheetname = sheetnames[i];
                            arrayName = sheetname.toString();
                            if ((arrayName.toUpperCase() == "FIELD") || (arrayName.toUpperCase() == "FIELDS")) {
                                data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
                                const columnDataField = [];
                                JSON.parse(objs.columns) && JSON.parse(objs.columns).map(col => {
                                    if (col.isSelected === "true") {
                                        columnDataField.push({ name: col.colname })
                                    }
                                });
                                // console.log("columnDataField ", columnDataField);
                                const mappingField = data && data.map(ele => {
                                    return Object.assign({}, ele, {
                                        study_id: id,
                                        // oid: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "OID")).length) ? ele.OID : 'null' || 'null',
                                        oid: ele.OID || 'null',
                                        formOID: ele.FormOID || 'null',
                                        fieldOID: ele.FieldOID || 'null',
                                        // formOID: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "FORMOID")).length) ? ele.FormOID : 'null' || 'null',
                                        // fieldOID: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "FIELDOID")).length) ? ele.FieldOID : 'null' || 'null', 
                                        ordinal: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "ORDINAL")).length) ? ele.Ordinal : 'null' || 'null',
                                        draftFieldName: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "DRAFTFIELDNAME")).length) ? ele.DraftFieldName : 'null' || 'null',
                                        draftFieldActive: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "DRAFTFIELDACTIVE")).length) ? ele.DraftFieldActive : 'null' || 'null',
                                        variableOID: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "VARIABLEOID")).length) ? ele.VariableOID : 'null' || 'null',
                                        dataFormat: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "DATAFORMAT")).length) ? ele.DataFormat : 'null' || 'null',
                                        dataDictionaryName: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "DATADICTIONARYNAME")).length) ? ele.DataDictionaryName : 'null' || 'null',
                                        unitDictionaryName: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "UNITDICTIONARYNAME")).length) ? ele.UnitDictionaryName : 'null' || 'null',
                                        codingDictionary: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "CODINGDICTIONARY")).length) ? ele.CodingDictionary : 'null' || 'null',
                                        controlType: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "CONTROLTYPE")).length) ? ele.ControlType : 'null' || 'null',
                                        preText: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "PRETEXT")).length) ? ele.preText : 'null' || 'null',
                                        fixedUnit: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "FIXEDUNIT")).length) ? ele.FixedUnit : 'null' || 'null',
                                        sourceDocument: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "SOURCEDOCUMENT")).length) ? ele.SourceDocument : 'null' || 'null',
                                        isLog: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "ISLOG")).length) ? ele.IsLog : 'null' || 'null',
                                        defaultValue: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "DEFAULTVALUE")).length) ? ele.DefaultValue : 'null' || 'null',
                                        sasLable: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "SASLABLE")).length) ? ele.SASLable : 'null' || 'null',
                                        isRequired: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "ISREQUIRED")).length) ? ele.IsRequired : 'null' || 'null',
                                        queryFutureDate: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "QUERYFUTUREDATE")).length) ? ele.QueryFutureDate : 'null' || 'null',
                                        isVisible: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "ISVISIBLE")).length) ? ele.IsVisible : 'null' || 'null',
                                        analyteName: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "ANALYTENAME")).length) ? ele.AnalyteName : 'null' || 'null',
                                        isClinicalSignificance: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "ISCLINICALSIGNIFICANCE")).length) ? ele.IsClinicalSignificance : 'null' || 'null',
                                        queryNonConformance: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "QUERYNONCONFORMANCE")).length) ? ele.QueryNonConformance : 'null' || 'null',
                                        doesNotBreakSignature: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "DOESNOTBREAKSIGNATURE")).length) ? ele.DoesNotBreakSignature : 'null' || 'null',
                                        viewRstrictions: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "VIEWRESTRICTIONS")).length) ? ele.ViewRstrictions : 'null' || 'null',
                                        entryRestrictions: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "ENTRYRESTRICTIONS")).length) ? ele.EntryRestrictions : 'null' || 'null',
                                        reviewGroups: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "REVIEWGROUPS")).length) ? ele.ReviewGroups : 'null' || 'null',
                                        // version: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "VERSION")).length) ? ele.Version : 'null' || 'null'
                                        version: version || 'null'
                                    });
                                });
                                fieldData = [...mappingField];
                            }
                        }
                    });
                }
                if (((objs.entityType).toUpperCase() == "DATA DICTIONARY") || ((objs.entityType).toUpperCase() == "DATADICTIONARIES")) {
                    let xlsxFileName = '';
                    try {
                        xlsxFileName = new URL(pathname).pathname.split('/').pop();
                    } catch (e) {
                        console.log("e ", e);
                    }
                    var file = s3.getObject({ Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName }).createReadStream();
                    var buffers = [];
                    file.on('data', function (data) {
                        buffers.push(data);
                    });
                    file.on('end', function () {
                        var buffer = Buffer.concat(buffers);
                        var workbook = xlsx.read(buffer);
                        const sheetnames = Object.keys(workbook.Sheets);
                        var i = sheetnames.length;
                        while (i--) {
                            const sheetname = sheetnames[i];
                            arrayName = sheetname.toString();
                            if ((arrayName.toUpperCase() == "DATA DICTIONARY") || (arrayName.toUpperCase() == "DATADICTIONARIES")) {
                                data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
                                const columnDataDD = [];
                                JSON.parse(objs.columns) && JSON.parse(objs.columns).map(col => {
                                    if (col.isSelected === "true") {
                                        columnDataDD.push({ name: col.colname })
                                    }
                                });
                                // console.log("columnDataDD ", columnDataDD);
                                if (columnDataDD.length) {
                                    const mappingDD = data && data.map(ele => {
                                        return Object.assign({}, ele, {
                                            study_id: id,
                                            oid: ((columnDataDD.filter(ele => (ele.name).toUpperCase() === "OID")).length) ? ele.OID : 'null' || 'null',
                                            dataDictionaryName: ((columnDataDD.filter(ele => (ele.name).toUpperCase() === "DATADICTIONARYNAME")).length) ? ele.DataDictionaryName : 'null' || 'null',
                                            codedData: ((columnDataDD.filter(ele => (ele.name).toUpperCase() === "CODEDDATA")).length) ? ele.CodedData : 'null' || 'null',
                                            ordinal: ((columnDataDD.filter(ele => (ele.name).toUpperCase() === "ORDINAL")).length) ? ele.Ordinal : 'null' || 'null',
                                            userDataString: ((columnDataDD.filter(ele => (ele.name).toUpperCase() === "USERDATASTRING")).length) ? ele.UserDataString : 'null' || 'null',
                                            specify: ((columnDataDD.filter(ele => (ele.name).toUpperCase() === "SPECIFY")).length) ? ele.Specify : 'null' || 'null',
                                            // version: ((columnDataDD.filter(ele => (ele.name).toUpperCase() === "VERSION")).length) ? ele.Version : 'null' || 'null', 
                                            version: version
                                        });
                                    });
                                    ddData = [...mappingDD];
                                }
                            }
                        }
                    });
                }
                if (((objs.entityType).toUpperCase() == "MATRIX") || ((objs.entityType).toUpperCase() == "MATRICES")) {
                    let xlsxFileName = '';
                    try {
                        xlsxFileName = new URL(pathname).pathname.split('/').pop();
                    } catch (e) {
                        console.log("e ", e);
                    }
                    var file = s3.getObject({ Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName }).createReadStream();
                    var buffers = [];
                    file.on('data', function (data) {
                        buffers.push(data);
                    });
                    file.on('end', function () {
                        var buffer = Buffer.concat(buffers);
                        var workbook = xlsx.read(buffer);
                        const sheetnames = Object.keys(workbook.Sheets);
                        var i = sheetnames.length;
                        while (i--) {
                            const sheetname = sheetnames[i];
                            arrayName = sheetname.toString();
                            if ((arrayName.toUpperCase() == "MATRIX") || (arrayName.toUpperCase() == "MATRICES")) {
                                data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
                                const columnDataMatrix = [];
                                JSON.parse(objs.columns) && JSON.parse(objs.columns).map(col => {
                                    if (col.isSelected === "true") {
                                        columnDataMatrix.push({ name: col.colname })
                                    }
                                });
                                // console.log("columnDataMatrix ", columnDataMatrix.length);
                                if (columnDataMatrix.length) {
                                    const mappingMatrix = data && data.map(ele => {
                                        // console.log('version ', version);
                                        return Object.assign({}, ele, {
                                            study_id: id,
                                            matrixName: ((columnDataMatrix.filter(ele => (ele.name).toUpperCase() === "MATRIXNAME")).length) ? ele.MatrixName : 'null' || 'null',
                                            oid: ((columnDataMatrix.filter(ele => (ele.name).toUpperCase() === "OID")).length) ? ele.OID : 'null' || 'null',
                                            addable: ((columnDataMatrix.filter(ele => (ele.name).toUpperCase() === "ADDABLE")).length) ? ele.Addable : 'null' || 'null',
                                            maximum: ((columnDataMatrix.filter(ele => (ele.name).toUpperCase() === "MAXIMUM")).length) ? ele.Maximum : 'null' || 'null',
                                            // version: ((columnDataMatrix.filter(ele => (ele.name).toUpperCase() === "VERSION")).length) ? ele.Version : 'null' || 'null', 
                                            version: version
                                        });
                                    });
                                    matrixData = [...mappingMatrix];
                                }
                            }
                        }
                    });
                }
                if ((objs.entityType).toUpperCase() == "VISITS") {
                    let xlsxFileName = '';
                    try {
                        xlsxFileName = new URL(pathname).pathname.split('/').pop();
                    } catch (e) {
                        console.log("e ", e);
                    }
                    var file = s3.getObject({ Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName }).createReadStream();
                    var buffers = [];
                    file.on('data', function (data) {
                        buffers.push(data);
                    });
                    file.on('end', function () {
                        var buffer = Buffer.concat(buffers);
                        var workbook = xlsx.read(buffer);
                        const sheetnames = Object.keys(workbook.Sheets);
                        var i = sheetnames.length;
                        while (i--) {
                            const sheetname = sheetnames[i];
                            arrayName = sheetname.toString();
                            if (arrayName.toUpperCase() == "VISITS") {
                                data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
                                const columnDataVisit = [];
                                JSON.parse(objs.columns) && JSON.parse(objs.columns).map(col => {
                                    if (col.isSelected === "true") {
                                        columnDataVisit.push({ name: col.colname })
                                    }
                                });
                                // console.log("columnDataVisit ", columnDataVisit);
                                if (columnDataVisit.length) {
                                    const mappingVisit = data && data.map(ele => {
                                        // console.log("version ", version);
                                        return Object.assign({}, ele, {
                                            study_id: id,
                                            matrix_id: ((columnDataVisit.filter(ele => (ele.name).toUpperCase() === "MATRIX")).length) ? ele.Matrix : 'null' || 'null',
                                            subject: ((columnDataVisit.filter(ele => (ele.name).toUpperCase() === "SUBJECT")).length) ? ele.Subject : 'null' || 'null',
                                            scrn: ((columnDataVisit.filter(ele => (ele.name).toUpperCase() === "SCRN")).length) ? ele.SCRN : 'null' || 'null',
                                            visit1: ((columnDataVisit.filter(ele => (ele.name).toUpperCase() === "VISIT1")).length) ? ele.Visit1 : 'null' || 'null',
                                            cm: ((columnDataVisit.filter(ele => (ele.name).toUpperCase() === "CM")).length) ? ele.CM : 'null' || 'null',
                                            ae: ((columnDataVisit.filter(ele => (ele.name).toUpperCase() === "AE")).length) ? ele.AE : 'null' || 'null',
                                            // version: ((columnDataVisit.filter(ele => (ele.name).toUpperCase() === "VERSION")).length) ? ele.Version : 'null' || 'null', 
                                            version: version
                                        });
                                    });
                                    visitData = [...mappingVisit];
                                }
                            }
                        }
                    });
                }

            });
            setTimeout(() => {
                // console.log("DraftData ", draftData);
                if (draftData) {
                    console.log("DRAFT");
                    let msgdrft, statdrft, metadrft = null;
                    try {
                        msgdrft = DraftDAO.bulkCreate(draftData);
                        statdrft = 200;
                    } catch (e) {
                        // console.log("e ", e);
                        msgdrft = "Server error while creating the Draft";
                        statdrft = 500;
                        metadrft = draftData;
                    }
                }
                // console.log("folderData ", folderData);
                if (folderData) {
                    console.log("FOLDER");
                    let msgfldr, statfldr, metafldr = null;
                    try {
                        msgfldr = FolderDAO.bulkCreate(folderData);
                        statfldr = 200;
                    } catch (e) {
                        // console.log("e ", e);
                        msgfldr = "Server error while creating the Folder";
                        statfldr = 500;
                        metafldr = folderData;
                    }
                }
                // console.log("formData ", formData);
                if (formData) {
                    console.log("FORMS");
                    let msgfrm, statfrm, metafrm = null;
                    try {
                        msgfrm = FormDAO.bulkCreate(formData);
                        statfrm = 200;
                    } catch (e) {
                        // console.log("e ", e);
                        msgfrm = "Server error while creating the Forms";
                        statfrm = 500;
                        metafrm = formData;
                    }
                }
                // console.log("fieldData ", fieldData);
                if (fieldData) {
                    console.log("FIELD");
                    let msgfld, statfld, metafld = null;
                    try {
                        msgfld = FieldDAO.bulkCreate(fieldData);
                        statfld = 200;
                    } catch (e) {
                        // console.log("e ", e);
                        msgfld = "Server error while creating the Field";
                        statfld = 500;
                        metafld = fieldData;
                    }
                }
                // console.log("ddData ", ddData);
                if (ddData) {
                    console.log("DATA DICTIONARY");
                    let msgdd, statdd, metadd = null;
                    try {
                        msgdd = DataDictionaryDAO.bulkCreate(ddData);
                        statdd = 200;
                    } catch (e) {
                        // console.log("e ", e);
                        msgdd = "Server error while creating the Data Dictionary";
                        statdd = 500;
                        metadd = ddData;
                    }
                }
                // console.log("matrixData ", matrixData);
                if (matrixData) {
                    console.log("MATRIX");
                    let msgmtrx, statmtrx, metamtrx = null;
                    try {
                        msgmtrx = MatrixDAO.bulkCreate(matrixData);
                        statmtrx = 200;
                    } catch (e) {
                        // console.log("e ", e);
                        msgmtrx = "Server error while creating the Matrix";
                        statmtrx = 500;
                        metamtrx = matrixData;
                    }
                }
                // console.log("visitData ", visitData);
                if (visitData) {
                    console.log("VISITS");
                    let msgvst, statvst, metavst = null;
                    try {
                        msgvst = VisitDAO.bulkCreate(visitData);
                        statvst = 200;
                    } catch (e) {
                        // console.log("e ", e);
                        msgvst = "Server error while creating the Visits";
                        statmtrx = 500;
                        metavst = visitData;
                    }
                }
                message = alsstaging;
                status = 200;
                APIResponse.sendResponse(res, status, 'Study Hierarchy Created Successfully', alsstaging);
                msg = StudyDAO.update(id, { studyStatus: "STAGED" });
            }, 16000);
        } else {
            message = `No AlsStaging found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to AlsStaging", e);
        status = 500;
        message = "Server error while processing the request";
    }
    return;
});


router.post('/staging/v2/:id', async (req, res) => {
    const id = req.params.id;
    let pathname = req.body.docPath;
    let fileName = new URL(pathname).pathname.split('/').pop();
    let splitVersion = fileName.split('--');
    let version = splitVersion[0];
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let status, message = null, columnData = [], entityData = [];
    try {
        const alsstaging = await AlsStagingDAO.alsStagingOnStudyId(JSON.stringify(id));
        if (alsstaging) {
                let draftData, folderData, formData, fieldData, ddData, matrixData, visitData;
                // const testcsegen = TestCaseGeneration.runGenerationTestCaseScript(pathname, id);
                // console.log("TEST CASE GENERATED");
                alsstaging && alsstaging.map(objs => {
                    // console.log("OBJS ", (objs.entityType).toUpperCase());
                    if (((objs.entityType).toUpperCase() == "DRAFT") || (objs.entityType).toUpperCase() == "CRFDRAFT") {
                        console.log("INSITE DRAFT IF ");
                        let xlsxFileName = '';
                        try {
                            xlsxFileName = new URL(pathname).pathname.split('/').pop();
                        } catch (e) {
                            console.log("e ", e);
                        }
                        var file = s3.getObject({ Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName }).createReadStream();
                        var buffers = [];
                        file.on('data', function (data) {
                            buffers.push(data);
                        });
                        file.on('end', function () {
                            var buffer = Buffer.concat(buffers);
                            var workbook = xlsx.read(buffer);
                            const sheetnames = Object.keys(workbook.Sheets);
                            var i = sheetnames.length;
                            while (i--) {
                                const sheetname = sheetnames[i];
                                arrayName = sheetname.toString();
                                if ((arrayName.toUpperCase() == "DRAFT") || (arrayName.toUpperCase() == "CRFDRAFT")) {
                                    data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
                                    const columnDataDraft = [];
                                    JSON.parse(objs.columns) && JSON.parse(objs.columns).map(col => {
                                        if (col.isSelected === "true") {
                                            columnDataDraft.push({ name: col.colname })
                                        }
                                    });
                                    // console.log("data Draft ", data);
                                    const mappingDraft = data && data.map(ele => {
                                        return Object.assign({}, ele, {
                                            study_id: id,
                                            // draftName: ((columnDataDraft.filter(ele => (ele.name).toUpperCase() === "DRAFTNAME")).length) ? ele.DraftName : 'null' || 'null',
                                            // description: ((columnDataDraft.filter(ele => (ele.name).toUpperCase() === "DESCRIPTION")).length) ? ele.description : 'null' || 'null',
                                            // deleteExisting: ((columnDataDraft.filter(ele => (ele.name).toUpperCase() === "DELETEEXISTING")).length) ? ele.DeleteExisting : 'null' || 'null',
                                            // projectName: ((columnDataDraft.filter(ele => (ele.name).toUpperCase() === "PROJECTNAME")).length) ? ele.ProjectName : 'null' || 'null',
                                            // projectType: ((columnDataDraft.filter(ele => (ele.name).toUpperCase() === "PROJECTTYPE")).length) ? ele.ProjectType : 'null' || 'null',
                                            // primaryFormOID: ((columnDataDraft.filter(ele => (ele.name).toUpperCase() === "PRIMARYFORMOID")).length) ? ele.PrimaryFormOID : 'null' || 'null',
                                            // DefaultMatrixOID: ((columnDataDraft.filter(ele => (ele.name).toUpperCase() === "DEFAULTMATRIXOID")).length) ? ele.DefaultMatrixOID : 'null' || 'null',
                                            // confirmMessage: ((columnDataDraft.filter(ele => (ele.name).toUpperCase() === "CONFIRMATIONMESSAGE")).length) ? ele.ConfirmationMessage : 'null' || 'null',
                                            // version: ((columnDataDraft.filter(ele => (ele.name).toUpperCase() === "VERSION")).length) ? ele.Version : 'null' || 'null'
                                            draftName: ele.DraftName || 'null',
                                            description: ele.description || 'null',
                                            deleteExisting: ele.DeleteExisting || 'null',
                                            projectName: ele.ProjectName || 'null',
                                            projectType: ele.ProjectType || 'null',
                                            primaryFormOID: ele.PrimaryFormOID || 'null',
                                            DefaultMatrixOID: ele.DefaultMatrixOID || 'null',
                                            confirmMessage: ele.ConfirmationMessage || 'null',
                                            version: version || 'null'
                                        });
                                    });
                                    draftData = [...mappingDraft];
                                }
                            }
                        });
                    }
                    if (((objs.entityType).toUpperCase() == "FOLDER") || (objs.entityType).toUpperCase() == "FOLDERS") {
                        let xlsxFileName = '';
                        try {
                            xlsxFileName = new URL(pathname).pathname.split('/').pop();
                        } catch (e) {
                            console.log("e ", e);
                        }
                        var file = s3.getObject({ Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName }).createReadStream();
                        var buffers = [];
                        file.on('data', function (data) {
                            buffers.push(data);
                        });
                        file.on('end', function () {
                            var buffer = Buffer.concat(buffers);
                            var workbook = xlsx.read(buffer);
                            const sheetnames = Object.keys(workbook.Sheets);
                            var i = sheetnames.length;
                            while (i--) {
                                const sheetname = sheetnames[i];
                                arrayName = sheetname.toString();
                                if ((arrayName.toUpperCase() == "FOLDER") || (arrayName.toUpperCase() == "FOLDERS")) {
                                    data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
                                    const columnDataFolder = [];
                                    JSON.parse(objs.columns) && JSON.parse(objs.columns).map(col => {
                                        if (col.isSelected === "true") {
                                            columnDataFolder.push({ name: col.colname })
                                        }
                                    });
                                    // console.log("columnDataFolder ", columnDataFolder);
                                    const mappingFolder = data && data.map(ele => {
                                        return Object.assign({}, ele, {
                                            study_id: id,
                                            // oid: ((columnDataFolder.filter(ele => (ele.name).toUpperCase() === "OID")).length) ? ele.OID : 'null' || 'null',
                                            oid: ele.OID || 'null',
                                            ordinal: ((columnDataFolder.filter(ele => (ele.name).toUpperCase() === "ORDINAL")).length) ? ele.Ordinal : 'null' || 'null',
                                            folderName: ((columnDataFolder.filter(ele => (ele.name).toUpperCase() === "FOLDERNAME")).length) ? ele.FolderName : 'null' || 'null',
                                            parentFolderOID: ((columnDataFolder.filter(ele => (ele.name).toUpperCase() === "PARENTFOLDEROID")).length) ? ele.ParentFolderOID : 'null' || 'null',
                                            isReusable: ((columnDataFolder.filter(ele => (ele.name).toUpperCase() === "ISREUSABLE")).length) ? ele.IsReusable : 'null' || 'null',
                                            version: version || 'null',
                                        });
                                    });
                                    folderData = [...mappingFolder];
                                }
                            }
                        });
                    }
                    if ((objs.entityType).toUpperCase() == "FORMS") {
                        let xlsxFileName = '';
                        try {
                            xlsxFileName = new URL(pathname).pathname.split('/').pop();
                        } catch (e) {
                            console.log("e ", e);
                        }
                        var file = s3.getObject({ Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName }).createReadStream();
                        var buffers = [];
                        file.on('data', function (data) {
                            buffers.push(data);
                        });
                        file.on('end', function () {
                            var buffer = Buffer.concat(buffers);
                            var workbook = xlsx.read(buffer);
                            const sheetnames = Object.keys(workbook.Sheets);
                            var i = sheetnames.length;
                            while (i--) {
                                const sheetname = sheetnames[i];
                                arrayName = sheetname.toString();
                                if (arrayName.toUpperCase() == "FORMS") {
                                    data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
                                    const columnDataForm = [];
                                    JSON.parse(objs.columns) && JSON.parse(objs.columns).map(col => {
                                        if (col.isSelected === "true") {
                                            columnDataForm.push({ name: col.colname })
                                        }
                                    });
                                    // console.log("columnDataForm ", columnDataForm);
                                    const mappingForm = data && data.map(ele => {
                                        return Object.assign({}, ele, {
                                            study_id: id,
                                            // oid: ((columnDataForm.filter(ele => (ele.name).toUpperCase() === "OID")).length) ? ele.OID : 'null' || 'null',
                                            oid: ele.OID || 'null',
                                            ordinal: ((columnDataForm.filter(ele => (ele.name).toUpperCase() === "ORDINAL")).length) ? ele.Ordinal : 'null' || 'null',
                                            draftFormName: ((columnDataForm.filter(ele => (ele.name).toUpperCase() === "DRAFTFORMNAME")).length) ? ele.DraftFormName : 'null' || 'null',
                                            draftFormActive: ((columnDataForm.filter(ele => (ele.name).toUpperCase() === "DRAFTFORMACTIVE")).length) ? ele.DraftFormActive : 'null' || 'null',
                                            isTemplate: ((columnDataForm.filter(ele => (ele.name).toUpperCase() === "ISTEMPLATE")).length) ? ele.IsTemplate : 'null' || 'null',
                                            isSignatureRequired: ((columnDataForm.filter(ele => (ele.name).toUpperCase() === "ISSIGNATUREREQUIRED")).length) ? ele.IsSignatureRequired : 'null' || 'null',
                                            viewRestrictions: ((columnDataForm.filter(ele => (ele.name).toUpperCase() === "VIEWRESTRICTIONS")).length) ? ele.ViewRestrictions : 'null' || 'null',
                                            entryRestrictions: ((columnDataForm.filter(ele => (ele.name).toUpperCase() === "ENTRYRESTRICTIONS")).length) ? ele.EntryRestrictions : 'null' || 'null',
                                            logDirection: ((columnDataForm.filter(ele => (ele.name).toUpperCase() === "LOGDIRECTION")).length) ? ele.LogDirection : 'null' || 'null',
                                            // version: ((columnDataForm.filter(ele => (ele.name).toUpperCase() === "VERSION")).length) ? ele.Version : 'null' || 'null'
                                            version: version || 'null'
                                        });
                                    });
                                    formData = [...mappingForm];
                                }
                            }
                        });
                    }
                    if (((objs.entityType).toUpperCase() == "FIELD") || (objs.entityType).toUpperCase() == "FIELDS") {
                        let xlsxFileName = '';
                        try {
                            xlsxFileName = new URL(pathname).pathname.split('/').pop();
                        } catch (e) {
                            // console.log("e ", e);
                        }
                        var file = s3.getObject({ Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName }).createReadStream();
                        var buffers = [];
                        file.on('data', function (data) {
                            buffers.push(data);
                        });
                        file.on('end', function () {
                            var buffer = Buffer.concat(buffers);
                            var workbook = xlsx.read(buffer);
                            const sheetnames = Object.keys(workbook.Sheets);
                            var i = sheetnames.length;
                            while (i--) {
                                const sheetname = sheetnames[i];
                                arrayName = sheetname.toString();
                                if ((arrayName.toUpperCase() == "FIELD") || (arrayName.toUpperCase() == "FIELDS")) {
                                    data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
                                    const columnDataField = [];
                                    JSON.parse(objs.columns) && JSON.parse(objs.columns).map(col => {
                                        if (col.isSelected === "true") {
                                            columnDataField.push({ name: col.colname })
                                        }
                                    });
                                    // console.log("columnDataField ", columnDataField);
                                    const mappingField = data && data.map(ele => {
                                        return Object.assign({}, ele, {
                                            study_id: id,
                                            // oid: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "OID")).length) ? ele.OID : 'null' || 'null',
                                            oid: ele.OID || 'null',
                                            formOID: ele.FormOID || 'null',
                                            fieldOID: ele.FieldOID || 'null',
                                            // formOID: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "FORMOID")).length) ? ele.FormOID : 'null' || 'null',
                                            // fieldOID: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "FIELDOID")).length) ? ele.FieldOID : 'null' || 'null', 
                                            ordinal: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "ORDINAL")).length) ? ele.Ordinal : 'null' || 'null',
                                            draftFieldName: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "DRAFTFIELDNAME")).length) ? ele.DraftFieldName : 'null' || 'null',
                                            draftFieldActive: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "DRAFTFIELDACTIVE")).length) ? ele.DraftFieldActive : 'null' || 'null',
                                            variableOID: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "VARIABLEOID")).length) ? ele.VariableOID : 'null' || 'null',
                                            dataFormat: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "DATAFORMAT")).length) ? ele.DataFormat : 'null' || 'null',
                                            dataDictionaryName: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "DATADICTIONARYNAME")).length) ? ele.DataDictionaryName : 'null' || 'null',
                                            unitDictionaryName: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "UNITDICTIONARYNAME")).length) ? ele.UnitDictionaryName : 'null' || 'null',
                                            codingDictionary: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "CODINGDICTIONARY")).length) ? ele.CodingDictionary : 'null' || 'null',
                                            controlType: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "CONTROLTYPE")).length) ? ele.ControlType : 'null' || 'null',
                                            preText: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "PRETEXT")).length) ? ele.preText : 'null' || 'null',
                                            fixedUnit: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "FIXEDUNIT")).length) ? ele.FixedUnit : 'null' || 'null',
                                            sourceDocument: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "SOURCEDOCUMENT")).length) ? ele.SourceDocument : 'null' || 'null',
                                            isLog: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "ISLOG")).length) ? ele.IsLog : 'null' || 'null',
                                            defaultValue: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "DEFAULTVALUE")).length) ? ele.DefaultValue : 'null' || 'null',
                                            sasLable: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "SASLABLE")).length) ? ele.SASLable : 'null' || 'null',
                                            isRequired: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "ISREQUIRED")).length) ? ele.IsRequired : 'null' || 'null',
                                            queryFutureDate: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "QUERYFUTUREDATE")).length) ? ele.QueryFutureDate : 'null' || 'null',
                                            isVisible: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "ISVISIBLE")).length) ? ele.IsVisible : 'null' || 'null',
                                            analyteName: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "ANALYTENAME")).length) ? ele.AnalyteName : 'null' || 'null',
                                            isClinicalSignificance: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "ISCLINICALSIGNIFICANCE")).length) ? ele.IsClinicalSignificance : 'null' || 'null',
                                            queryNonConformance: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "QUERYNONCONFORMANCE")).length) ? ele.QueryNonConformance : 'null' || 'null',
                                            doesNotBreakSignature: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "DOESNOTBREAKSIGNATURE")).length) ? ele.DoesNotBreakSignature : 'null' || 'null',
                                            viewRstrictions: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "VIEWRESTRICTIONS")).length) ? ele.ViewRstrictions : 'null' || 'null',
                                            entryRestrictions: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "ENTRYRESTRICTIONS")).length) ? ele.EntryRestrictions : 'null' || 'null',
                                            reviewGroups: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "REVIEWGROUPS")).length) ? ele.ReviewGroups : 'null' || 'null',
                                            // version: ((columnDataField.filter(ele => (ele.name).toUpperCase() === "VERSION")).length) ? ele.Version : 'null' || 'null'
                                            version: version || 'null'
                                        });
                                    });
                                    fieldData = [...mappingField];
                                }
                            }
                        });
                    }
                    if (((objs.entityType).toUpperCase() == "DATA DICTIONARY") || ((objs.entityType).toUpperCase() == "DATADICTIONARIES")) {
                        let xlsxFileName = '';
                        try {
                            xlsxFileName = new URL(pathname).pathname.split('/').pop();
                        } catch (e) {
                            console.log("e ", e);
                        }
                        var file = s3.getObject({ Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName }).createReadStream();
                        var buffers = [];
                        file.on('data', function (data) {
                            buffers.push(data);
                        });
                        file.on('end', function () {
                            var buffer = Buffer.concat(buffers);
                            var workbook = xlsx.read(buffer);
                            const sheetnames = Object.keys(workbook.Sheets);
                            var i = sheetnames.length;
                            while (i--) {
                                const sheetname = sheetnames[i];
                                arrayName = sheetname.toString();
                                if ((arrayName.toUpperCase() == "DATA DICTIONARY") || (arrayName.toUpperCase() == "DATADICTIONARIES")) {
                                    data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
                                    const columnDataDD = [];
                                    JSON.parse(objs.columns) && JSON.parse(objs.columns).map(col => {
                                        if (col.isSelected === "true") {
                                            columnDataDD.push({ name: col.colname })
                                        }
                                    });
                                    // console.log("columnDataDD ", columnDataDD);
                                    if (columnDataDD.length) {
                                        const mappingDD = data && data.map(ele => {
                                            return Object.assign({}, ele, {
                                                study_id: id,
                                                oid: ((columnDataDD.filter(ele => (ele.name).toUpperCase() === "OID")).length) ? ele.OID : 'null' || 'null',
                                                dataDictionaryName: ((columnDataDD.filter(ele => (ele.name).toUpperCase() === "DATADICTIONARYNAME")).length) ? ele.DataDictionaryName : 'null' || 'null',
                                                codedData: ((columnDataDD.filter(ele => (ele.name).toUpperCase() === "CODEDDATA")).length) ? ele.CodedData : 'null' || 'null',
                                                ordinal: ((columnDataDD.filter(ele => (ele.name).toUpperCase() === "ORDINAL")).length) ? ele.Ordinal : 'null' || 'null',
                                                userDataString: ((columnDataDD.filter(ele => (ele.name).toUpperCase() === "USERDATASTRING")).length) ? ele.UserDataString : 'null' || 'null',
                                                specify: ((columnDataDD.filter(ele => (ele.name).toUpperCase() === "SPECIFY")).length) ? ele.Specify : 'null' || 'null',
                                                // version: ((columnDataDD.filter(ele => (ele.name).toUpperCase() === "VERSION")).length) ? ele.Version : 'null' || 'null', 
                                                version: version
                                            });
                                        });
                                        ddData = [...mappingDD];
                                    }
                                }
                            }
                        });
                    }
                    if (((objs.entityType).toUpperCase() == "MATRIX") || ((objs.entityType).toUpperCase() == "MATRICES")) {
                        let xlsxFileName = '';
                        try {
                            xlsxFileName = new URL(pathname).pathname.split('/').pop();
                        } catch (e) {
                            console.log("e ", e);
                        }
                        var file = s3.getObject({ Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName }).createReadStream();
                        var buffers = [];
                        file.on('data', function (data) {
                            buffers.push(data);
                        });
                        file.on('end', function () {
                            var buffer = Buffer.concat(buffers);
                            var workbook = xlsx.read(buffer);
                            const sheetnames = Object.keys(workbook.Sheets);
                            var i = sheetnames.length;
                            while (i--) {
                                const sheetname = sheetnames[i];
                                arrayName = sheetname.toString();
                                if ((arrayName.toUpperCase() == "MATRIX") || (arrayName.toUpperCase() == "MATRICES")) {
                                    data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
                                    const columnDataMatrix = [];
                                    JSON.parse(objs.columns) && JSON.parse(objs.columns).map(col => {
                                        if (col.isSelected === "true") {
                                            columnDataMatrix.push({ name: col.colname })
                                        }
                                    });
                                    // console.log("columnDataMatrix ", columnDataMatrix.length);
                                    if (columnDataMatrix.length) {
                                        const mappingMatrix = data && data.map(ele => {
                                            // console.log('version ', version);
                                            return Object.assign({}, ele, {
                                                study_id: id,
                                                matrixName: ((columnDataMatrix.filter(ele => (ele.name).toUpperCase() === "MATRIXNAME")).length) ? ele.MatrixName : 'null' || 'null',
                                                oid: ((columnDataMatrix.filter(ele => (ele.name).toUpperCase() === "OID")).length) ? ele.OID : 'null' || 'null',
                                                addable: ((columnDataMatrix.filter(ele => (ele.name).toUpperCase() === "ADDABLE")).length) ? ele.Addable : 'null' || 'null',
                                                maximum: ((columnDataMatrix.filter(ele => (ele.name).toUpperCase() === "MAXIMUM")).length) ? ele.Maximum : 'null' || 'null',
                                                // version: ((columnDataMatrix.filter(ele => (ele.name).toUpperCase() === "VERSION")).length) ? ele.Version : 'null' || 'null', 
                                                version: version
                                            });
                                        });
                                        matrixData = [...mappingMatrix];
                                    }
                                }
                            }
                        });
                    }
                    if ((objs.entityType).toUpperCase() == "VISITS") {
                        let xlsxFileName = '';
                        try {
                            xlsxFileName = new URL(pathname).pathname.split('/').pop();
                        } catch (e) {
                            console.log("e ", e);
                        }
                        var file = s3.getObject({ Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName }).createReadStream();
                        var buffers = [];
                        file.on('data', function (data) {
                            buffers.push(data);
                        });
                        file.on('end', function () {
                            var buffer = Buffer.concat(buffers);
                            var workbook = xlsx.read(buffer);
                            const sheetnames = Object.keys(workbook.Sheets);
                            var i = sheetnames.length;
                            while (i--) {
                                const sheetname = sheetnames[i];
                                arrayName = sheetname.toString();
                                if (arrayName.toUpperCase() == "VISITS") {
                                    data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
                                    const columnDataVisit = [];
                                    JSON.parse(objs.columns) && JSON.parse(objs.columns).map(col => {
                                        if (col.isSelected === "true") {
                                            columnDataVisit.push({ name: col.colname })
                                        }
                                    });
                                    // console.log("columnDataVisit ", columnDataVisit);
                                    if (columnDataVisit.length) {
                                        const mappingVisit = data && data.map(ele => {
                                            // console.log("version ", version);
                                            return Object.assign({}, ele, {
                                                study_id: id,
                                                matrix_id: ((columnDataVisit.filter(ele => (ele.name).toUpperCase() === "MATRIX")).length) ? ele.Matrix : 'null' || 'null',
                                                subject: ((columnDataVisit.filter(ele => (ele.name).toUpperCase() === "SUBJECT")).length) ? ele.Subject : 'null' || 'null',
                                                scrn: ((columnDataVisit.filter(ele => (ele.name).toUpperCase() === "SCRN")).length) ? ele.SCRN : 'null' || 'null',
                                                visit1: ((columnDataVisit.filter(ele => (ele.name).toUpperCase() === "VISIT1")).length) ? ele.Visit1 : 'null' || 'null',
                                                cm: ((columnDataVisit.filter(ele => (ele.name).toUpperCase() === "CM")).length) ? ele.CM : 'null' || 'null',
                                                ae: ((columnDataVisit.filter(ele => (ele.name).toUpperCase() === "AE")).length) ? ele.AE : 'null' || 'null',
                                                // version: ((columnDataVisit.filter(ele => (ele.name).toUpperCase() === "VERSION")).length) ? ele.Version : 'null' || 'null', 
                                                version: version
                                            });
                                        });
                                        visitData = [...mappingVisit];
                                    }
                                }
                            }
                        });
                    }
    
                });
                setTimeout(() => {
                    // console.log("DraftData ", draftData);
                    if (draftData) {
                        console.log("DRAFT");
                        let msgdrft, statdrft, metadrft = null;
                        try {
                            msgdrft = DraftDAO.bulkCreate(draftData);
                            statdrft = 200;
                        } catch (e) {
                            // console.log("e ", e);
                            msgdrft = "Server error while creating the Draft";
                            statdrft = 500;
                            metadrft = draftData;
                        }
                    }
                    // console.log("folderData ", folderData);
                    if (folderData) {
                        console.log("FOLDER");
                        let msgfldr, statfldr, metafldr = null;
                        try {
                            msgfldr = FolderDAO.bulkCreate(folderData);
                            statfldr = 200;
                        } catch (e) {
                            // console.log("e ", e);
                            msgfldr = "Server error while creating the Folder";
                            statfldr = 500;
                            metafldr = folderData;
                        }
                    }
                    // console.log("formData ", formData);
                    if (formData) {
                        console.log("FORMS");
                        let msgfrm, statfrm, metafrm = null;
                        try {
                            msgfrm = FormDAO.bulkCreate(formData);
                            statfrm = 200;
                        } catch (e) {
                            // console.log("e ", e);
                            msgfrm = "Server error while creating the Forms";
                            statfrm = 500;
                            metafrm = formData;
                        }
                    }
                    // console.log("fieldData ", fieldData);
                    if (fieldData) {
                        console.log("FIELD");
                        let msgfld, statfld, metafld = null;
                        try {
                            msgfld = FieldDAO.bulkCreate(fieldData);
                            statfld = 200;
                        } catch (e) {
                            // console.log("e ", e);
                            msgfld = "Server error while creating the Field";
                            statfld = 500;
                            metafld = fieldData;
                        }
                    }
                    // console.log("ddData ", ddData);
                    if (ddData) {
                        console.log("DATA DICTIONARY");
                        let msgdd, statdd, metadd = null;
                        try {
                            msgdd = DataDictionaryDAO.bulkCreate(ddData);
                            statdd = 200;
                        } catch (e) {
                            // console.log("e ", e);
                            msgdd = "Server error while creating the Data Dictionary";
                            statdd = 500;
                            metadd = ddData;
                        }
                    }
                    // console.log("matrixData ", matrixData);
                    if (matrixData) {
                        console.log("MATRIX");
                        let msgmtrx, statmtrx, metamtrx = null;
                        try {
                            msgmtrx = MatrixDAO.bulkCreate(matrixData);
                            statmtrx = 200;
                        } catch (e) {
                            // console.log("e ", e);
                            msgmtrx = "Server error while creating the Matrix";
                            statmtrx = 500;
                            metamtrx = matrixData;
                        }
                    }
                    // console.log("visitData ", visitData);
                    if (visitData) {
                        console.log("VISITS");
                        let msgvst, statvst, metavst = null;
                        try {
                            msgvst = VisitDAO.bulkCreate(visitData);
                            statvst = 200;
                        } catch (e) {
                            // console.log("e ", e);
                            msgvst = "Server error while creating the Visits";
                            statmtrx = 500;
                            metavst = visitData;
                        }
                    }
                    message = alsstaging;
                    status = 200;
                    APIResponse.sendResponse(res, status, 'Study Hierarchy Created Successfully', alsstaging);
                    msg = StudyDAO.update(id, { studyStatus: "STAGED" });
                }, 16000);
            let xlsxFileName = '';
            try {
                xlsxFileName = new URL(pathname).pathname.split('/').pop();
            } catch (e) {
                console.log("e ", e);
            }
            var file = s3.getObject({ Bucket: "maiora-life-sciences/study/alsDoc", Key: xlsxFileName }).createReadStream();
            var buffers = [];
            file.on('data', function (data) {
                buffers.push(data);
            });
            file.on('end', function () {
                var buffer = Buffer.concat(buffers);
                var workbook = xlsx.read(buffer);
                const sheetnames = Object.keys(workbook.Sheets);
                var i = sheetnames.length;
                while (i--) {
                    const sheetname = sheetnames[i];
                    arrayName = sheetname.toString();
                    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
                    alsstaging.map(obj => {
                        columnData = [];
                        entityData = [];
                        if (obj.entityType === arrayName) {
                            JSON.parse(obj.columns) && JSON.parse(obj.columns).map(col => {
                                if (col.isSelected === "true") {
                                    columnData.push(col.colname)
                                }
                            });
                        }
                        data && data.map(raw => {
                            const filtered = Object.keys(raw)
                                .filter(key => columnData.includes(key))
                                .reduce((obj, key) => {
                                    obj[key] = raw[key];
                                    return obj;
                                }, {});
                            entityData.push(filtered);
                        });
                        if((arrayName.toUpperCase() !== "DRAFT" && arrayName.toUpperCase() !== "CRFDRAFT") && 
                        (arrayName.toUpperCase() !== "FOLDER" && arrayName.toUpperCase() !== "FOLDERS") && 
                        (arrayName.toUpperCase() !== "FORMS") && 
                        (arrayName.toUpperCase() !== "FIELD" && arrayName.toUpperCase() !== "FIELDS") && 
                        (arrayName.toUpperCase() !== "DATA DICTIONARY" && arrayName.toUpperCase() !== "DATADICTIONARIES") && 
                        (arrayName.toUpperCase() !== "MATRIX" && arrayName.toUpperCase() !== "MATRICES") &&
                        (arrayName.toUpperCase() !== "VISITS")) {
                            if (entityData[0] && Object.keys(entityData[0]).length) {
                                console.log("CREATE HEREE.....");
                                console.log("arrayName ", arrayName);
                                const syncSaveObj = {
                                    studyId: id,
                                    sheetName: arrayName,
                                    data: JSON.stringify(entityData),
                                    version: version
                                }
                                const metaData = SyncSaveDAO.create(syncSaveObj);
                            }
                        }
                    });
                }
            });
        } else {
            message = `No AlsStaging found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to AlsStaging", e);
        status = 500;
        message = "Server error while processing the request";
    }
    return;
});


// router.post('/testing/testcasegeneration/:id', async (req, res) => { 
//     const id = req.params.id;
//     let pathname = req.body.docPath;
//     const testcsegen = TestCaseGeneration.runGenerationTestCaseScript(pathname, id);
//     console.log("TEST CASE GENERATED");
//     APIResponse.sendResponse(res, 200, 'Completed - Test Case Generated', testcsegen);
// });

module.exports = router;