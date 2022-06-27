const express = require("express");
const router = express.Router();
const SdtmMappingDAO = require("./sdtm-mapping.dao");
const SdtmMapping = require("./sdtm-mapping.model");
const logger = require("../../utils/logger");
const Helper = require("../../utils/helper");
const APIResponse = require("../../models/apiResponse");
const Cryptic = require('../../utils/cryptic');
const AuthorizeMiddlewareAuth = require("../../middlewares/jwt/auth");

console.log("Route SDTM Mapping Loaded...!");

// Get all SdtmMapping
router.get('/', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: SDTM-Mapping");
    let sdtmmappings = null, message = null;
    try {
        sdtmmappings = await SdtmMappingDAO.selectAll();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to SDTM-Mapping", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, sdtmmappings);
    return;
});


// Get all SdtmMapping
router.get('/getActiveSdtmMapping', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Active SdtmMapping");
    let sdtmmappings = null, message = null;
    try {
        sdtmmappings = await SdtmMappingDAO.findAllActiveSdtmMapping();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to SDTM-Mapping", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, sdtmmappings);
    return;
});


// Get all SdtmMappings byID
router.get('/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: SdtmMapping by id");
    let status, message = null, metadata = null;
    try {
        const sdtmmapping = await SdtmMappingDAO.selectById(id);
        if (sdtmmapping && sdtmmapping['_id']) {
            metadata = sdtmmapping;
            status = 200;
            message = 'Success';
        } else {
            message = `No SdtmMapping found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to SdtmMapping", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});


//Get SdtmMapping on Study ID
router.get('/studyid/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: SdtmMapping by StudyId");
    let status, message = null, metadata = null;
    try {
        const sdtmmapping = await SdtmMappingDAO.sdtmMappingDataOnStudyId(id);
        if (sdtmmapping) {
            metadata = sdtmmapping;
            status = 200;
            message = 'Success';
        } else {
            message = `No SdtmMapping found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to SdtmMapping", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});


//Creating SdtmMapping
router.post('/create', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: SdtmMapping');
        const sdtmmappingObj = SdtmMapping.getSDTMMappingFromRequestObj(req.body);
        sdtmmappingObj.uuid = Cryptic.hash(sdtmmappingObj.subject + sdtmmappingObj.created + sdtmmappingObj.study_id);
        if (!sdtmmappingObj || sdtmmappingObj instanceof SdtmMapping === false) {
            APIResponse.sendResponse(res, 400, 'Server error while processing the request');
            return;
        }
        let msg, stat, meta = null;
        try {
            meta = SdtmMappingDAO.create(sdtmmappingObj);
            stat = 200;
            msg = 'Success'
        } catch (e) {
            console.log("E ", e);
            msg = "Server error while creating the SdtmMapping";
            stat = 500;
            meta = sdtmmappingObj;
        }
        APIResponse.sendResponse(res, stat, msg, meta);
        return;
});


//Updating SdtmMapping
router.put('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('PUT: SdtmMapping');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = SdtmMapping.getSDTMMappingFromRequestObj(req.body, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await SdtmMappingDAO.update(id, updateables);
        stat = 200;
        msg = 'Success';
    } catch (e) {
        msg = "Server error while updating the SdtmMapping";
        stat = 500;
        meta = updateables;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


//Deleting the SdtmMapping
router.delete('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('DELETE: SdtmMapping');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = SdtmMapping.getSDTMMappingFromRequestObj({ isActive: false }, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await SdtmMappingDAO.update(id, updateables);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while deleting the SdtmMapping";
        stat = 500;
        meta = sdtmmappingObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


router.post('/bulkCreate', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: Bulk SdtmMappings');
    const sdtmmappingObj = req.body;
    if (!sdtmmappingObj) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = SdtmMappingDAO.bulkCreate(sdtmmappingObj);
        stat = 200;
        msg = 'Success';
    } catch (e) {
        console.log("e ", e);
        msg = "Server error while creating the SdtmMapping";
        stat = 500;
        meta = sdtmmappingObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});

// Get all SdtmMapping by EntityType
router.get('/entitytype/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    // if (!Helper.isValidMongooseObjectId(id)) {
    //     APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    //     return;
    // }
    console.log("GET: SdtmMapping by id");
    let status, message = null, metadata = null;
    try {
        console.log("ID ", id);
        const sdtmmapping = await SdtmMappingDAO.sdtmMappingDataOnEntityType(id);
        if (sdtmmapping) {
            metadata = sdtmmapping;
            status = 200;
            message = 'Success'
        } else {
            message = `No SdtmMapping found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        console.log("eee ", e);
        logger.warn("Failed while GET request to SdtmMapping", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

module.exports = router;