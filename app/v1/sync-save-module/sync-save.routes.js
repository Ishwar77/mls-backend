const express = require("express");
const router = express.Router();
const SyncSaveDAO = require("./sync-save.dao");
const SyncSave = require("./sync-save.model");
const logger = require("../../utils/logger");
const Helper = require("../../utils/helper");
const APIResponse = require("../../models/apiResponse");
const Cryptic = require('../../utils/cryptic');
const AuthorizeMiddlewareAuth = require("../../middlewares/jwt/auth");

// Get all SyncSave
router.get('/', async (req, res) => {
    // AuthorizeMiddlewareAuth.usersAndAdminOnly, 
    console.log("GET: Sync Saved Data");
    let syncSaves = null, message = null;
    try {
        syncSaves = await SyncSaveDAO.selectAll();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to SyncSave", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, syncSaves);
    return;
});

// Get all SyncSave
router.get('/getActiveSyncedData', async (req, res) => {
    // AuthorizeMiddlewareAuth.usersAndAdminOnly, 
    console.log("GET: Active Sync Saved Data");
    let syncSaves = null;
    try {
        syncSaves = await SyncSaveDAO.findAllActiveSynchedData();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to SyncSave", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, syncSaves);
    return;
});

// Get all Synched Data by ID
router.get('/:id', async (req, res) => {
    // AuthorizeMiddlewareAuth.usersAndAdminOnly,  
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Sync Saved Data by id");
    let status, message = null, metadata;
    try {
        const syncSave = await SyncSaveDAO.selectById(id);
        if (syncSave && syncSave['_id']) {
            metadata = syncSave;
            status = 200;
            message = 'Success'
        } else {
            metadata = `No Sync Saved Data found with id ${id}`;
            status = 404;
            message = 'Nothing to Display'
        }
    } catch (e) {
        logger.warn("Failed while GET request to Sync Saved Data", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

// Get all Synched Data by StudyID
router.get('/studyid/:id', async (req, res) => {
    // AuthorizeMiddlewareAuth.usersAndAdminOnly, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Sync Saved Data by id");
    let status, message = null, metadata = null;
    try {
        const syncSave = await SyncSaveDAO.syncDataOnStudyId(id);
        if (syncSave) {
            metadata = syncSave;
            status = 200;
            message = 'Success'
        } else {
            metadata = `No Sync Saved Data found with id ${id}`;
            status = 404;
            message = 'Nothing to Display'
        }
    } catch (e) {
        logger.warn("Failed while GET request to Sync Saved Data", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

// Get all Synched Data by StudyID and Version
router.get('/version/:ver/studyid/:id', async (req, res) => {
    // AuthorizeMiddlewareAuth.usersAndAdminOnly,  
    const id = req.params.id;
    const ver = req.params.ver;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Synched Data by id");
    let status, message = null, metadata = null;
    try {
        const syncSave = await SyncSaveDAO.findDataOnLatestVer(ver, id);
        if (syncSave) {
            metadata = syncSave;
            status = 200;
            message = 'Success'
        } else {
            metadata = `No Synched Data found with id ${id}`;
            status = 404;
            message = 'Nothing to Display'
        }
    } catch (e) {
        logger.warn("Failed while GET request to Synched Data", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

//Creating Synched Data
router.post('/create', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: Synched Data');
    const syncSaveObj = SyncSave.getSyncSaveFromRequestObj(req.body);
    if (!syncSaveObj || syncSaveObj instanceof SyncSave === false || syncSaveObj.hasError()) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = SyncSaveDAO.create(syncSaveObj);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while creating the Synched Data";
        stat = 500;
        meta = syncSaveObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});

//Updating Synched Data
router.put('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('PUT: Synched Data');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = SyncSave.getSyncSaveFromRequestObj(req.body, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await SyncSaveDAO.update(id, updateables);
        stat = 200;
        msg = 'Success';
    } catch (e) {
        msg = "Server error while updating the Synched Data";
        stat = 500;
        meta = updateables;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});

//Deleting the Synched Data
router.delete('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('DELETE: Synched Data');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = SyncSave.getSyncSaveFromRequestObj({ isActive: false }, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await SyncSaveDAO.update(id, updateables);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while deleting the Synched Data";
        stat = 500;
        meta = syncSaveObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});

router.post('/bulkCreate', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: Synched Data');
    const syncSaveObj = req.body;
    if (!syncSaveObj) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = SyncSaveDAO.bulkCreate(syncSaveObj);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        console.log("e ", e);
        msg = "Server error while creating the Synched Data";
        stat = 500;
        meta = syncSaveObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});

function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }

// Get all Synched Data by StudyID
router.get('/sheetname/:sheetname/studyid/:id', async (req, res) => {
    // AuthorizeMiddlewareAuth.usersAndAdminOnly, 
    const id = req.params.id;
    const sheetname = req.params.sheetname;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Sync Saved Data by SheetName and StudyID");
    let status, message = null, sycmetadata = null, metadata = null;
    try {
        const sycdata = await SyncSaveDAO.syncDataOnStudyId(id);;
        if (sycdata) {
            sycmetadata = sycdata;
            // console.log("sycmetadata ", sycmetadata);
            let verNum = 0;
            sycmetadata && sycmetadata.map(verN => {
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
            metadata = await SyncSaveDAO.syncDataOnSheetName(id, sheetname, versn)
            status = 200;
            message = 'Success'
        } else {
            metadata = `No Data found with id ${id}`;
            status = 404;
            message = 'Nothing to Display'
        }
    } catch (e) {
        logger.warn("Failed while GET request to Sync Data", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

module.exports = router;