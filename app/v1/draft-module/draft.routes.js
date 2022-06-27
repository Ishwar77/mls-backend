const express = require("express");
const router = express.Router();
const DraftDAO = require("./draft.dao");
const Draft = require("./draft.model");
const logger = require("../../utils/logger");
const Helper = require("../../utils/helper");
const APIResponse = require("../../models/apiResponse");
const Cryptic = require('../../utils/cryptic');
const AuthorizeMiddlewareAuth = require("../../middlewares/jwt/auth");

console.log("Route Draft Loaded...!");

// Get all Draft
router.get('/', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Draft");
    let drafts = null, message = null;
    try {
        drafts = await DraftDAO.selectAll();
        message = 'Success';
    } catch (e) {
        logger.warn("Failed while GET request to Draft", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, drafts);
    return;
});

// Get all Draft
router.get('/getActiveDrafts', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Active Draft");
    let drafts = null , message = null;
    try {
        drafts = await DraftDAO.findAllActiveDraft();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to Draft", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, drafts);
    return;
});

// Get all Drafts byID
router.get('/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Draft by id");
    let status, message = null, metadata = null;
    try {
        const draft = await DraftDAO.selectById(id);
        if (draft && draft['_id']) {
            metadata = draft;
            status = 200;
            message = 'Success'
        } else {
            metadata = `No Draft found with id ${id}`;
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

//Get Draft on Study ID
router.get('/studyid/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Draft by StudyId");
    let status, message = null, metadata = null;
    try {
        const draft = await DraftDAO.draftOnStudyId(id);
        if (draft) {
            metadata = draft;
            status = 200;
            message = 'Success'
        } else {
            message = `No Draft found with id ${id}`;
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


//Creating Draft
router.post('/create', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: Draft');
        const draftObj = Draft.getDraftFromRequestObj(req.body);
        draftObj.uuid = Cryptic.hash(draftObj.draftName + draftObj.created + draftObj.study_id);
        if (!draftObj || draftObj instanceof Draft === false) {
            APIResponse.sendResponse(res, 400, 'Server error while processing the request');
            return;
        }
        let msg, stat, meta = null;
        try {
            meta = DraftDAO.create(draftObj);
            stat = 200;
            msg = 'Success'
        } catch (e) {
            msg = "Server error while creating the Draft";
            stat = 500;
            meta = draftObj;
        }
        APIResponse.sendResponse(res, stat, msg, meta);
        return;
});

router.post('/bulkCreate', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: Bulk Draft');
    const draftObj = req.body;
    if (!draftObj) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = DraftDAO.bulkCreate(draftObj);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        console.log("e ", e);
        msg = "Server error while creating the Draft";
        stat = 500;
        meta = draftObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


//Updating Draft
router.put('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('PUT: Draft');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = Draft.getDraftFromRequestObj(req.body, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await DraftDAO.update(id, updateables);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while updating the Draft";
        stat = 500;
        meta = updateables;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


//Deleting the Draft
router.delete('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('DELETE: Draft');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = Draft.getDraftFromRequestObj({ isActive: false }, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await DraftDAO.update(id, updateables);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while deleting the Draft";
        stat = 500;
        meta = draftObj;
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
    console.log("GET: Draft by id");
    let status, message = null, drftmetadata = null, metadata = null;
    try {
        const draft = await DraftDAO.draftOnStudyId(id);
        if (draft) {
            drftmetadata = draft;
            let verNum = 0;
            drftmetadata && drftmetadata.map(verN => {
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
            metadata = await DraftDAO.findDraftOnLatestVer(versn)
            status = 200;
            message = 'Success'
        } else {
            metadata = `No Draft found with id ${id}`;
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

module.exports = router;