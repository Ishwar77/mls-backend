const express = require("express");
const router = express.Router();
const ChangedAlsDataDAO = require("./changed-als-data.dao");
const ChangedAlsData = require("./changed-als-data.model");
const logger = require("../../utils/logger");
const Helper = require("../../utils/helper");
const APIResponse = require("../../models/apiResponse");
const Cryptic = require('../../utils/cryptic');
const AuthorizeMiddleware = require("../../middlewares/authorize");
const AuthorizeMiddlewareAuth = require("../../middlewares/jwt/auth");

console.log("Route Changed ALS Data Loaded...!");

// Get all ChangedAlsData
router.get('/', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: ChangedAlsData");
    let changedalsdatas = null, message = null;
    try {
        changedalsdatas = await ChangedAlsDataDAO.selectAll();
        message = 'Success';
    } catch (e) {
        logger.warn("Failed while GET request to ChangedAlsData", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, changedalsdatas);
    return;
});

// Get all ChangedAlsData
router.get('/getActiveChangedAlsData', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Active ChangedAlsData");
    let changedalsdatas = null , message = null;
    try {
        changedalsdatas = await ChangedAlsDataDAO.findAllActiveChangedAlsData();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to ChangedAlsData", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, changedalsdatas);
    return;
});

// Get all ChangedAlsData byID
router.get('/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: ChangedAlsData by id");
    let status, message = null, metadata = null;
    try {
        const changedalsdata = await ChangedAlsDataDAO.selectById(id);
        if (changedalsdata && changedalsdata['_id']) {
            metadata = changedalsdata;
            status = 200;
            message = 'Success'
        } else {
            metadata = `No ChangedAlsData found with id ${id}`;
            status = 404;
            message = 'Nothing to Display'
        }
    } catch (e) {
        logger.warn("Failed while GET request to ChangedAlsData", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

//Get ChangedAlsData on Study ID
router.get('/studyid/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: ChangedAlsData by StudyId");
    let status, message = null, metadata = null;
    try {
        const changedalsdata = await ChangedAlsDataDAO.dataOnStudyId(id);
        if (changedalsdata) {
            metadata = changedalsdata;
            status = 200;
            message = 'Success'
        } else {
            message = `No ChangedAlsData found with id ${id}`;
            status = 404;
            message = 'Nothing to Display'
        }
    } catch (e) {
        logger.warn("Failed while GET request to ChangedAlsData", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

module.exports = router;