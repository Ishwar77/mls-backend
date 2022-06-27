const express = require("express");
const router = express.Router();
const MatrixDAO = require("./matrix.dao");
const Matrix = require("./matrix.model");
const logger = require("../../utils/logger");
const Helper = require("../../utils/helper");
const APIResponse = require("../../models/apiResponse");
const Cryptic = require('../../utils/cryptic');
const AuthorizeMiddlewareAuth = require("../../middlewares/jwt/auth");

console.log("Route Matrix Loaded...!");

// Get all Matrix
router.get('/', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Matrix");
    let matrixs = null, message = null;
    try {
        matrixs = await MatrixDAO.selectAll();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to Matrix", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, matrixs);
    return;
});

// Get all Matrix
router.get('/getActiveMatrix', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Active Matrix");
    let matrixs = null, message = null;
    try {
        matrixs = await MatrixDAO.findAllActiveMatrix();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to Matrix", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, matrixs);
    return;
});

// Get all Matrixs byID
router.get('/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Matrix by id");
    let status, message = null, metadata = null;
    try {
        const matrix = await MatrixDAO.selectById(id);
        if (matrix && matrix['_id']) {
            metadata = matrix;
            status = 200;
            message = 'Success'
        } else {
            message = `No Matrix found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to Matrix", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});


//Get Matrix on Study ID
router.get('/studyid/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Matrix by StudyId");
    let status, message = null, metadata = null;
    try {
        const matrix = await MatrixDAO.matrixOnStudyId(id);
        if (matrix) {
            metadata = matrix;
            status = 200;
            message = 'Success'
        } else {
            message = `No Matrix found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to Matrix", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});


//Get Matrix on Version and Study ID
router.get('/version/:ver/studyid/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    const ver = req.params.ver;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Matrix by Version and StudyId");
    let status, message = null, metadata = null;
    try {
        const matrix = await MatrixDAO.findMatrixOnLatestVer(ver, id);
        if (matrix) {
            metadata = matrix;
            status = 200;
            message = 'Success'
        } else {
            message = `No Matrix found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to Matrix", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

//Creating Matrix
router.post('/create', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: Matrix');
        const matrixObj = Matrix.getMatrixFromRequestObj(req.body);
        matrixObj.uuid = Cryptic.hash(matrixObj.matrixName + matrixObj.created + matrixObj.study_id);
        if (!matrixObj || matrixObj instanceof Matrix === false) {
            APIResponse.sendResponse(res, 400, 'Server error while processing the request');
            return;
        }
        let msg, stat, meta = null;
        try {
            meta = MatrixDAO.create(matrixObj);
            stat = 200;
            msg = 'Success'
        } catch (e) {
            console.log("E ", e);
            msg = "Server error while creating the Matrix";
            stat = 500;
            meta = matrixObj;
        }
        APIResponse.sendResponse(res, stat, msg, meta);
        return;
});


//Updating Matrix
router.put('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('PUT: Matrix');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = Matrix.getMatrixFromRequestObj(req.body, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await MatrixDAO.update(id, updateables);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while updating the Matrix";
        stat = 500;
        meta = updateables;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


//Deleting the Matrix
router.delete('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('DELETE: Matrix');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = Matrix.getMatrixFromRequestObj({ isActive: false }, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await MatrixDAO.update(id, updateables);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while deleting the Matrix";
        stat = 500;
        meta = matrixObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});

router.post('/bulkCreate', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: Bulk matrixObj');
    const matrixObj = req.body;
    if (!matrixObj) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = MatrixDAO.bulkCreate(matrixObj);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        console.log("e ", e);
        msg = "Server error while creating the matrixObj";
        stat = 500;
        meta = matrixObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});

function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }

// Get all Matrix byStudyID snd Latest Version
router.get('/latestversion/study/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Matrix by id");
    let status, message = null, mtrxmetadata = null, metadata = null;
    try {
        const matrix = await MatrixDAO.matrixOnStudyId(id);
        if (matrix) {
            mtrxmetadata = matrix;
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
            metadata = await MatrixDAO.findMatrixOnLatestVer(versn, id)
            status = 200;
            message = 'Success'
        } else {
            metadata = `No Matrix found with id ${id}`;
            status = 404;
            message = 'Nothing to Display'
        }
    } catch (e) {
        logger.warn("Failed while GET request to Matrix", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

module.exports = router;