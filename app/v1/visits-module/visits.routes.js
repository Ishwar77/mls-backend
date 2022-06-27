const express = require("express");
const router = express.Router();
const VisitDAO = require("./visits.dao");
const Visit = require("./visits.model");
const logger = require("../../utils/logger");
const Helper = require("../../utils/helper");
const APIResponse = require("../../models/apiResponse");
const Cryptic = require('../../utils/cryptic');
const AuthorizeMiddleware = require("../../middlewares/authorize");

console.log("Route Visit Loaded...!");

// Get all Visit
router.get('/', async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Visit");
    let visits = null, message = null;
    try {
        visits = await VisitDAO.selectAll();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to Visit", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, visits);
    return;
});


// Get all Visit
router.get('/getActiveVisit', async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Active Visit");
    let visits = null, message = null;
    try {
        visits = await VisitDAO.findAllActiveVisit();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to Visit", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, visits);
    return;
});


// Get all Visits byID
router.get('/:id', async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Visit by id");
    let status, message = null, metadata = null;
    try {
        const visit = await VisitDAO.selectById(id);
        if (visit && visit['_id']) {
            metadata = visit;
            status = 200;
            message = 'Success';
        } else {
            message = `No Visit found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to Visit", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

//Get Visit on Study ID
router.get('/studyid/:id', async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Visit by StudyId");
    let status, message = null, metadata = null;
    try {
        const visit = await VisitDAO.visitOnStudyId(id);
        if (visit) {
            metadata = visit;
            status = 200;
            message = 'Success';
        } else {
            message = `No Visit found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to Visit", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

//Get Visit on Version and Study ID
router.get('/version/:ver/studyid/:id', async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    const ver = req.params.ver;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Visit by StudyId");
    let status, message = null, metadata = null;
    try {
        const visit = await VisitDAO.findVisitsOnLatestVer(ver, id);
        if (visit) {
            metadata = visit;
            status = 200;
            message = 'Success';
        } else {
            message = `No Visit found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to Visit", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

//Creating Visit
router.post('/create', async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: Visit');
        const visitObj = Visit.getVisitFromRequestObj(req.body);
        visitObj.uuid = Cryptic.hash(visitObj.subject + visitObj.created + visitObj.study_id);
        if (!visitObj || visitObj instanceof Visit === false) {
            APIResponse.sendResponse(res, 400, 'Server error while processing the request');
            return;
        }
        let msg, stat, meta = null;
        try {
            meta = VisitDAO.create(visitObj);
            stat = 200;
            msg = 'Success'
        } catch (e) {
            console.log("E ", e);
            msg = "Server error while creating the Visit";
            stat = 500;
            meta = visitObj;
        }
        APIResponse.sendResponse(res, stat, msg, meta);
        return;
});


//Updating Visit
router.put('/:id', async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('PUT: Visit');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = Visit.getVisitFromRequestObj(req.body, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await VisitDAO.update(id, updateables);
        stat = 200;
        msg = 'Success';
    } catch (e) {
        msg = "Server error while updating the Visit";
        stat = 500;
        meta = updateables;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


//Deleting the Visit
router.delete('/:id', async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('DELETE: Visit');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = Visit.getVisitFromRequestObj({ isActive: false }, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await VisitDAO.update(id, updateables);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while deleting the Visit";
        stat = 500;
        meta = visitObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});

router.post('/bulkCreate', async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: Bulk Visits');
    const visitObj = req.body;
    if (!visitObj) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = VisitDAO.bulkCreate(visitObj);
        stat = 200;
        msg = 'Success';
    } catch (e) {
        console.log("e ", e);
        msg = "Server error while creating the Visits";
        stat = 500;
        meta = visitObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }

// Get all Visits byStudyID snd Latest Version
router.get('/latestversion/study/:id', async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Visits by id");
    let status, message = null, mtrxmetadata = null, metadata = null;
    try {
        const visit = await VisitDAO.visitOnStudyId(id);
        if (visit) {
            mtrxmetadata = visit;
            let verNum = 0;
            mtrxmetadata && mtrxmetadata.map(verN => {
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
            metadata = await VisitDAO.findVisitsOnLatestVer(versn, id)
            status = 200;
            message = 'Success'
        } else {
            metadata = `No Visit found with id ${id}`;
            status = 404;
            message = 'Nothing to Display'
        }
    } catch (e) {
        logger.warn("Failed while GET request to Visit", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});


module.exports = router;