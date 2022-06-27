const express = require("express");
const router = express.Router();
const FolderDAO = require("./folder.dao");
const Folder = require("./folder.model");
const logger = require("../../utils/logger");
const Helper = require("../../utils/helper");
const APIResponse = require("../../models/apiResponse");
const Cryptic = require('../../utils/cryptic');
const AuthorizeMiddlewareAuth = require("../../middlewares/jwt/auth");

console.log("Route Folder Loaded...!");

// Get all Folder
router.get('/', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Folder");
    let folders = null, message = null;
    try {
        folders = await FolderDAO.selectAll();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to Folder", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, folders);
    return;
});

// Get all Folder
router.get('/getActiveFolders', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Active Folder");
    let folders = null, message = null;
    try {
        folders = await FolderDAO.findAllActiveFolder();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to Folder", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, folders);
    return;
});


// Get all Folders byID
router.get('/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Folder by id");
    let status, message = null, metadata = null;
    try {
        const folder = await FolderDAO.selectById(id);
        if (folder && folder['_id']) {
            metadata = folder;
            status = 200;
            message = 'Success'
        } else {
            message = `No Folder found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to Folder", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

//Get Folder on Study ID
router.get('/studyid/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Folder by StudyId");
    let status, message = null, metadata = null;
    try {
        const folder = await FolderDAO.folderOnStudyId(id);
        if (folder) {
            metadata = folder;
            status = 200;
            message = 'Success'
        } else {
            message = `No Folder found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to Folder", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

//Creating Folder
router.post('/create', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: Folder');
        const folderObj = Folder.getFolderFromRequestObj(req.body);
        folderObj.uuid = Cryptic.hash(folderObj.oid + folderObj.created + folderObj.study_id);
        if (!folderObj || folderObj instanceof Folder === false) {
            APIResponse.sendResponse(res, 400, 'Server error while processing the request');
            return;
        }
        let msg, stat, meta = null;
        try {
            meta = FolderDAO.create(folderObj);
            stat = 200;
            msg = 'Success'
        } catch (e) {
            msg = "Server error while creating the Folder";
            stat = 500;
            meta = folderObj;
        }
        APIResponse.sendResponse(res, stat, msg, meta);
        return;
});

//Updating Folder
router.put('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('PUT: Folder');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = Folder.getFolderFromRequestObj(req.body, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await FolderDAO.update(id, updateables);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while updating the Folder";
        stat = 500;
        meta = updateables;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


//Deleting the Folder
router.delete('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('DELETE: Folder');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = Folder.getFolderFromRequestObj({ isActive: false }, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await FolderDAO.update(id, updateables);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while deleting the Folder";
        stat = 500;
        meta = folderObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});

router.post('/bulkCreate', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: Bulk Folder');
    const folderObj = req.body;
    if (!folderObj) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = FolderDAO.bulkCreate(folderObj);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        console.log("e ", e);
        msg = "Server error while creating the Folder";
        stat = 500;
        meta = folderObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});

function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }

// Get all Draft byStudyID snd Latest Version
router.get('/latestversion/study/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Folder by id");
    let status, message = null, fldrmetadata = null, metadata = null;
    try {
        const folder = await FolderDAO.folderOnStudyId(id);
        if (folder) {
            fldrmetadata = folder;
            let verNum = 0;
            fldrmetadata && fldrmetadata.map(verN => {
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
            metadata = await FolderDAO.findFolderOnLatestVer(versn, id)
            status = 200;
            message = 'Success'
        } else {
            metadata = `No Folder found with id ${id}`;
            status = 404;
            message = 'Nothing to Display'
        }
    } catch (e) {
        logger.warn("Failed while GET request to Draft", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

//Get Folder on Study ID and Version
router.get('/version/:ver/studyid/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    const ver = req.params.ver;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Folder by StudyId");
    let status, message = null, metadata = null;
    try {
        const folder = await FolderDAO.findFolderOnLatestVer(ver, id);
        if (folder) {
            metadata = folder;
            status = 200;
            message = 'Success'
        } else {
            message = `No Folder found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to Folder", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

module.exports = router;