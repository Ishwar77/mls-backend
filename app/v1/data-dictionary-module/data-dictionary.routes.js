const express = require("express");
const router = express.Router();
const DataDictionaryDAO = require("./data-dictionary.dao");
const DataDictionary = require("./data-dictionary.model");
const logger = require("../../utils/logger");
const Helper = require("../../utils/helper");
const APIResponse = require("../../models/apiResponse");
const Cryptic = require('../../utils/cryptic');
const AuthorizeMiddleware = require("../../middlewares/authorize");
const AuthorizeMiddlewareAuth = require("../../middlewares/jwt/auth");

console.log("Route Data - Dictionary Loaded...!");

// Get all DataDictionary
router.get('/', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: DataDictionary");
    let datadictionarys = null, msg;
    try {
        datadictionarys = await DataDictionaryDAO.selectAll();
        msg = 'Success';
    } catch (e) {
        logger.warn("Failed while GET request to DataDictionary", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, msg, datadictionarys);
    return;
});

// Get all DataDictionary
router.get('/getActiveDataDictionary', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Active DataDictionary");
    let datadictionarys = null, msg;
    try {
        datadictionarys = await DataDictionaryDAO.findAllActiveDataDictionary();
        msg = 'Success';
    } catch (e) {
        logger.warn("Failed while GET request to DataDictionary", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, msg, datadictionarys);
    return;
});


// Get all DataDictionarys byID
router.get('/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: DataDictionary by id");
    let status, message = null, metadata = null;
    try {
        const datadictionary = await DataDictionaryDAO.selectById(id);
        if (datadictionary && datadictionary['_id']) {
            metadata = datadictionary;
            status = 200;
            message = 'Success'
        } else {
            metadata = `No DataDictionary found with id ${id}`;
            status = 404;
            message = 'Nothing to Display'
        }
    } catch (e) {
        logger.warn("Failed while GET request to DataDictionary", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});


//Get DataDictionary on Study ID
router.get('/studyid/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: DataDictionary by StudyId");
    let status, message = null, metadata;
    try {
        const datadictionary = await DataDictionaryDAO.dataDictionaryOnStudyId(id);
        if (datadictionary) {
            metadata = datadictionary;
            status = 200;
            message = 'Success'
        } else {
            metadata = `No DataDictionary found with id ${id}`;
            status = 404;
            message = 'Nothing to Display'
        }
    } catch (e) {
        logger.warn("Failed while GET request to DataDictionary", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});


//Get DataDictionary on Study ID
router.get('/version/:ver/studyid/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    const ver = req.params.ver;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: DataDictionary by Version and StudyId");
    let status, message = null, metadata;
    try {
        const datadictionary = await DataDictionaryDAO.findDataDictionaryOnLatestVer(ver, id);
        if (datadictionary) {
            metadata = datadictionary;
            status = 200;
            message = 'Success'
        } else {
            metadata = `No DataDictionary found with id ${id}`;
            status = 404;
            message = 'Nothing to Display'
        }
    } catch (e) {
        logger.warn("Failed while GET request to DataDictionary", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});


//Creating DataDictionary
router.post('/create', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: DataDictionary');
        const datadictionaryObj = DataDictionary.getDataDictionaryFromRequestObj(req.body);
        datadictionaryObj.uuid = Cryptic.hash(datadictionaryObj.dataDictionaryName + datadictionaryObj.created + datadictionaryObj.study_id);
        if (!datadictionaryObj || datadictionaryObj instanceof DataDictionary === false) {
            APIResponse.sendResponse(res, 400, 'Server error while processing the request');
            return;
        }
        let msg, stat, meta = null;
        try {
            meta = DataDictionaryDAO.create(datadictionaryObj);
            stat = 200;
            msg = 'Success'
        } catch (e) {
            console.log("E ", e);
            msg = "Server error while creating the DataDictionary";
            stat = 500;
            meta = datadictionaryObj;
        }
        APIResponse.sendResponse(res, stat, msg, meta);
        return;
});


//Updating DataDictionary
router.put('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('PUT: DataDictionary');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = DataDictionary.getDataDictionaryFromRequestObj(req.body, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await DataDictionaryDAO.update(id, updateables);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while updating the DataDictionary";
        stat = 500;
        meta = updateables;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


//Deleting the DataDictionary
router.delete('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('DELETE: DataDictionary');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = DataDictionary.getDataDictionaryFromRequestObj({ isActive: false }, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await DataDictionaryDAO.update(id, updateables);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while deleting the DataDictionary";
        stat = 500;
        meta = datadictionaryObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});

router.post('/bulkCreate', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: Bulk Data Dictionary');
    const dataDictionaryObj = req.body;
    if (!dataDictionaryObj) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = DataDictionaryDAO.bulkCreate(dataDictionaryObj);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        console.log("e ", e);
        msg = "Server error while creating the Data Dictionary";
        stat = 500;
        meta = dataDictionaryObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});

function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }

// Get all DataDictionary byStudyID snd Latest Version
router.get('/latestversion/study/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Data Dictionary by id");
    let status, message = null, ddmetadata = null, metadata = null;
    try {
        const datadict = await DataDictionaryDAO.dataDictionaryOnStudyId(id);
        if (datadict) {
            ddmetadata = datadict;
            let verNum = 0;
            ddmetadata && ddmetadata.map(verN => {
                let filteredVNum = verN.version
                console.log("filteredVNum ", filteredVNum);
                if (filteredVNum !== 'null') {
                    let versionNum = filteredVNum.split("V");
                    let firstVer = filteredVNum.split("");
                    if (firstVer[0] === "V" && isNumber(versionNum[1]) === true) {
                        if (parseInt(versionNum[1]) >= verNum) {
                            verNum = parseInt(versionNum[1]);
                            console.log("verNum ", verNum);
                        }
                    }
                }
            });
            let versn = 'V' + verNum;
            console.log("versn ", versn);
            metadata = await DataDictionaryDAO.findDataDictionaryOnLatestVer(versn, id)
            status = 200;
            message = 'Success'
        } else {
            metadata = `No Data Dictionary found with id ${id}`;
            status = 404;
            message = 'Nothing to Display'
        }
    } catch (e) {
        logger.warn("Failed while GET request to Data Dictionary", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

module.exports = router;