const express = require("express");
const router = express.Router();
const TestCasesDAO = require("./test-cases.dao");
const TestCases = require("./test-cases.model");
const logger = require("../../utils/logger");
const Helper = require("../../utils/helper");
const APIResponse = require("../../models/apiResponse");
const Cryptic = require('../../utils/cryptic');
const AuthorizeMiddlewareAuth = require("../../middlewares/jwt/auth");

console.log("Route Test Cases Loaded...!");

// Get all TestCases
router.get('/', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: TestCases");
    let testcasess = null, message = null;
    try {
        testcasess = await TestCasesDAO.selectAll();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to TestCases", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, testcasess);
    return;
});

// Get all TestCases
router.get('/getActiveTestCases', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Active TestCases");
    let testcasess = null, message = null;
    try {
        testcasess = await TestCasesDAO.findAllActiveSponser();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to TestCases", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, testcasess);
    return;
});

// Get all TestCasess byID
router.get('/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: TestCases by id");
    let status, message = null, metadata = null;
    try {
        const testcases = await TestCasesDAO.selectById(id);
        if (testcases && testcases['_id']) {
            metadata = testcases;
            status = 200;
            message = 'Success'
        } else {
            message = `No TestCases found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to TestCases", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});


//Creating TestCases
router.post('/create', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: TestCases');
    const testcasesObj = TestCases.getTestCasesFromRequestObj(req.body);
    testcasesObj.uuid = Cryptic.hash(testcasesObj.study_UUID + testcasesObj.created + testcasesObj.version);
    if (!testcasesObj || testcasesObj instanceof TestCases === false || testcasesObj.hasError()) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = TestCasesDAO.create(testcasesObj);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while creating the TestCases";
        stat = 500;
        meta = testcasesObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


//Updating TestCases
router.put('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('PUT: TestCases');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = TestCases.getTestCasesFromRequestObj(req.body, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await TestCasesDAO.update(id, updateables);
        stat = 200;
        msg = 'Success';
    } catch (e) {
        msg = "Server error while updating the TestCases";
        stat = 500;
        meta = updateables;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});



//Deleting the TestCases
router.delete('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('DELETE: TestCases');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = TestCases.getTestCasesFromRequestObj({ isActive: false }, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await TestCasesDAO.update(id, updateables);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while deleting the TestCases";
        stat = 500;
        meta = testcasesObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


router.post('/bulkCreate', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: TestCases');
    const testcasesObj = req.body;
    if (!testcasesObj) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = TestCasesDAO.bulkCreate(testcasesObj);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        console.log("e ", e);
        msg = "Server error while creating the TestCases";
        stat = 500;
        meta = testcasesObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});

module.exports = router;