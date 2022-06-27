const express = require("express");
const router = express.Router();
const TestCasesv2DAO = require("./test-cases-v2.dao");
const TestCasesv2 = require("./test-cases-v2.model");
const logger = require("../../utils/logger");
const Helper = require("../../utils/helper");
const APIResponse = require("../../models/apiResponse");
const Cryptic = require('../../utils/cryptic');
const AuthorizeMiddlewareAuth = require("../../middlewares/jwt/auth");

console.log("Route Test Cases Loaded...!");

// Get all TestCasesv2
router.get('/', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: TestCasesv2");
    let testcasesv2s = null, message = null;
    try {
        testcasesv2s = await TestCasesv2DAO.selectAll();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to TestCasesv2", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, testcasesv2s);
    return;
});

// Get all TestCasesv2
router.get('/getActiveTestCasesv2', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Active TestCasesv2");
    let testcasesv2s = null, message = null;
    try {
        testcasesv2s = await TestCasesv2DAO.findAllActiveSponser();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to TestCasesv2", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, testcasesv2s);
    return;
});

// Get all TestCasesv2s byID
router.get('/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: TestCasesv2 by id");
    let status, message = null, metadata = null;
    try {
        const testcasesv2 = await TestCasesv2DAO.selectById(id);
        if (testcasesv2 && testcasesv2['_id']) {
            metadata = testcasesv2;
            status = 200;
            message = 'Success'
        } else {
            message = `No TestCasesv2 found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to TestCasesv2", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});


//Creating TestCasesv2
router.post('/create', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: TestCasesv2');
    const testcasesv2Obj = TestCasesv2.getTestCasesv2FromRequestObj(req.body);
    testcasesv2Obj.uuid = Cryptic.hash(testcasesv2Obj.STUDYID + testcasesv2Obj.created + testcasesv2Obj.version);
    if (!testcasesv2Obj || testcasesv2Obj instanceof TestCasesv2 === false || testcasesv2Obj.hasError()) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = TestCasesv2DAO.create(testcasesv2Obj);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while creating the TestCasesv2";
        stat = 500;
        meta = testcasesv2Obj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


//Updating TestCasesv2
router.put('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('PUT: TestCasesv2');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = TestCasesv2.getTestCasesv2FromRequestObj(req.body, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await TestCasesv2DAO.update(id, updateables);
        stat = 200;
        msg = 'Success';
    } catch (e) {
        msg = "Server error while updating the TestCasesv2";
        stat = 500;
        meta = updateables;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});



//Deleting the TestCasesv2
router.delete('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('DELETE: TestCasesv2');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = TestCasesv2.getTestCasesv2FromRequestObj({ isActive: false }, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await TestCasesv2DAO.update(id, updateables);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while deleting the TestCasesv2";
        stat = 500;
        meta = testcasesv2Obj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


router.post('/bulkCreate', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: TestCasesv2');
    const testcasesv2Obj = req.body;
    if (!testcasesv2Obj) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = TestCasesv2DAO.bulkCreate(testcasesv2Obj);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        console.log("e ", e);
        msg = "Server error while creating the TestCasesv2";
        stat = 500;
        meta = testcasesv2Obj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


// Get all TestCasesv2s by StudyID
router.get('/studyid/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    // if (!Helper.isValidMongooseObjectId(id)) {
    //     APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    //     return;
    // }
    console.log("GET: TestCasesv2 by id");
    let status, message = null, metadata = null;
    try {
        const testcasesv2 = await TestCasesv2DAO.testCaseV2OnStudyId(id);
        if (testcasesv2) {
            metadata = testcasesv2;
            status = 200;
            message = 'Success'
        } else {
            message = `No TestCasesv2 found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to TestCasesv2", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

// Get all TestCasesv2s by FormOIID
router.get('/formoid/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    // if (!Helper.isValidMongooseObjectId(id)) {
    //     APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    //     return;
    // }
    console.log("GET: TestCasesv2 by id");
    let status, message = null, metadata = null;
    try {
        const testcasesv2 = await TestCasesv2DAO.testCaseV2OnFormOId(id);
        if (testcasesv2) {
            metadata = testcasesv2;
            status = 200;
            message = 'Success'
        } else {
            message = `No TestCasesv2 found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to TestCasesv2", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

// Get all TestCasesv2s by FieldOIID
router.get('/fieldoid/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    // if (!Helper.isValidMongooseObjectId(id)) {
    //     APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    //     return;
    // }
    console.log("GET: TestCasesv2 by id");
    let status, message = null, metadata = null;
    try {
        const testcasesv2 = await TestCasesv2DAO.testCaseV2OnFieldOId(id);
        if (testcasesv2) {
            metadata = testcasesv2;
            status = 200;
            message = 'Success'
        } else {
            message = `No TestCasesv2 found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to TestCasesv2", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

// Get all TestCasesv2s by StudyID and FormOID
router.get('/version/:ver/formoid/:formoid/study/:studyid', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    const studyid = req.params.studyid;
    const formoid = req.params.formoid;
    const ver = req.params.ver;
    console.log("GET: TestCasesv2 by studyid and formoid");
    let status, message = null, metadata = null;
    try {
        const testcasesv2 = await TestCasesv2DAO.testCasesOnVersionStudyAndFormID(studyid, formoid, ver);
        if (testcasesv2) {
            metadata = testcasesv2;
            status = 200;
            message = 'Success'
        } else {
            message = `No TestCasesv2 found with id ${studyid} and ${formoid}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to TestCasesv2", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});


// Get all TestCasesv2s by StudyID and FormOIID
router.get('/studyid/:studyid/formid/:formoid', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    const studyid = req.params.studyid;
    const formoid = req.params.formoid;
    console.log("GET: TestCasesv2 by studyid and formoid");
    let status, message = null, metadata = null;
    try {
        const testcasesv2 = await TestCasesv2DAO.testCasesOnStudyAndFormID(studyid, formoid);
        if (testcasesv2) {
            metadata = testcasesv2;
            status = 200;
            message = 'Success'
        } else {
            message = `No TestCasesv2 found with id ${studyid} and ${formoid}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to TestCasesv2", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

// Get all TestCasesv2s by StudyID and FieldOIID
router.get('/version/:ver/fieldoid/:fieldoid/study/:studyid', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    const studyid = req.params.studyid;
    const fieldoid = req.params.fieldoid;
    const ver = req.params.ver;
    console.log("GET: TestCasesv2 by studyid and fieldoid");
    let status, message = null, metadata = null;
    try {
        const testcasesv2 = await TestCasesv2DAO.testCasesOnVersionStudyAndFieldID(studyid, fieldoid, ver);
        if (testcasesv2) {
            metadata = testcasesv2;
            status = 200;
            message = 'Success'
        } else {
            message = `No TestCasesv2 found with id ${studyid} and ${fieldoid}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to TestCasesv2", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});


// Get all TestCasesv2s by StudyID and FieldOIID
router.get('/studyid/:studyid/fieldid/:fieldoid', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    const studyid = req.params.studyid;
    const fieldoid = req.params.fieldoid;
    console.log("GET: TestCasesv2 by studyid and fieldoid");
    let status, message = null, metadata = null;
    try {
        const testcasesv2 = await TestCasesv2DAO.testCasesOnStudyAndFieldID(studyid, fieldoid);
        if (testcasesv2) {
            metadata = testcasesv2;
            status = 200;
            message = 'Success'
        } else {
            message = `No TestCasesv2 found with id ${studyid} and ${fieldoid}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to TestCasesv2", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

// Get all TestCasesv2s by StudyID and VariableOID
router.get('/studyid/:studyid/variableoid/:variableoid', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    const studyid = req.params.studyid;
    const variableoid = req.params.variableoid;
    console.log("GET: TestCasesv2 by studyid and variableoid");
    let status, message = null, metadata = null;
    try {
        const testcasesv2 = await TestCasesv2DAO.testCasesOnStudyAndFieldID(studyid, variableoid);
        if (testcasesv2) {
            metadata = testcasesv2;
            status = 200;
            message = 'Success'
        } else {
            message = `No TestCasesv2 found with id ${studyid} and ${variableoid}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to TestCasesv2", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

module.exports = router;