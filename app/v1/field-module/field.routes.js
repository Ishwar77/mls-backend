const express = require("express");
const router = express.Router();
const FieldDAO = require("./field.dao");
const Field = require("./field.model");
const logger = require("../../utils/logger");
const Helper = require("../../utils/helper");
const APIResponse = require("../../models/apiResponse");
const Cryptic = require('../../utils/cryptic');
const AuthorizeMiddlewareAuth = require("../../middlewares/jwt/auth");

console.log("Route Field Loaded...!");

// Get all Field
router.get('/', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Field");
    let fields = null, message = null;
    try {
        fields = await FieldDAO.selectAll();
        message = 'Success';
    } catch (e) {
        logger.warn("Failed while GET request to Field", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, fields);
    return;
});

// Get all Field
router.get('/getActiveField', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Active Field");
    let fields = null, message = null;
    try {
        fields = await FieldDAO.findAllActiveField();
        message = 'Success';
    } catch (e) {
        logger.warn("Failed while GET request to Field", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, fields);
    return;
});

// Get all Fields byID
router.get('/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Field by id");
    let status, message = null, metadata = null;
    try {
        const field = await FieldDAO.selectById(id);
        if (field && field['_id']) {
            metadata = field;
            status = 200;
            message = 'Success'
        } else {
            metadata = `No Field found with id ${id}`;
            status = 404;
            message = 'Nothing to Display'
        }
    } catch (e) {
        logger.warn("Failed while GET request to Field", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});

//Get Field on Study ID
router.get('/studyid/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Field by StudyId");
    let status, message = null, metadata = null;
    try {
        const field = await FieldDAO.fieldOnStudyId(id);
        if (field) {
            metadata = field;
            status = 200;
            message = 'Success'
        } else {
            message = `No Field found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to Field", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});


//Get Field on FormOID ID
router.get('/formoid/:id/studyid/:studyid', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    const studyid = req.params.studyid;
    if (!Helper.isValidMongooseObjectId(studyid)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Field by StudyId");
    let status, message = null, metadata = null;
    try {
        const field = await FieldDAO.fieldOnFormOId(id, studyid);
        if (field) {
            metadata = field;
            status = 200;
            message = 'Success'
        } else {
            message = `No Field found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to Field", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});


//Get Field on FormOID ID and Version
router.get('/version/:ver/formoid/:id/studyid/:studyid', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    const studyid = req.params.studyid;
    const ver = req.params.ver;
    if (!Helper.isValidMongooseObjectId(studyid)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Field by StudyId");
    let status, message = null, metadata = null;
    try {
        const field = await FieldDAO.fieldOnVersionFolderOIDandStudy(id, studyid, ver);
        if (field) {
            metadata = field;
            status = 200;
            message = 'Success'
        } else {
            message = `No Field found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to Field", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});


//Creating Field
router.post('/create', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: Field');
        const fieldObj = Field.getFieldFromRequestObj(req.body);
        fieldObj.uuid = Cryptic.hash(fieldObj.draftFieldName + fieldObj.created + fieldObj.study_id);
        if (!fieldObj || fieldObj instanceof Field === false) {
            APIResponse.sendResponse(res, 400, 'Server error while processing the request');
            return;
        }
        let msg, stat, meta = null;
        try {
            meta = FieldDAO.create(fieldObj);
            stat = 200;
            msg = 'Success'
        } catch (e) {
            console.log("E ", e);
            msg = "Server error while creating the Field";
            stat = 500;
            meta = fieldObj;
        }
        APIResponse.sendResponse(res, stat, msg, meta);
        return;
});


//Updating Field
router.put('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('PUT: Field');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = Field.getFieldFromRequestObj(req.body, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await FieldDAO.update(id, updateables);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while updating the Field";
        stat = 500;
        meta = updateables;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


//Deleting the Field
router.delete('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('DELETE: Field');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = Field.getFieldFromRequestObj({ isActive: false }, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await FieldDAO.update(id, updateables);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while deleting the Field";
        stat = 500;
        meta = fieldObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});

router.post('/bulkCreate', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: Bulk Field');
    const fieldObj = req.body;
    if (!fieldObj) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = FieldDAO.bulkCreate(fieldObj);
        stat = 200;
        msg = 'Success';
    } catch (e) {
        console.log("e ", e);
        msg = "Server error while creating the Field";
        stat = 500;
        meta = fieldObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});



function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }

// Get all Field byStudyID snd Latest Version
router.get('/latestversion/form/:oid/study/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    const oid = req.params.oid;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Filed by id");
    let status, message = null, fldmetadata = null, metadata = null;
    try {
        console.log("oid ", oid);
        console.log("id ", id);
        const field = await FieldDAO.fieldOnFormOId(oid, id);
        console.log("field ", field);
        if (field) {
            fldmetadata = field;
            let verNum = 0;
            fldmetadata && fldmetadata.map(verN => {
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
            metadata = await FieldDAO.findFieldOnLatestVer(versn, id);
            status = 200;
            message = 'Success'
        } else {
            metadata = `No Filed found with id ${id}`;
            status = 404;
            message = 'Nothing to Display'
        }
    } catch (e) {
        logger.warn("Failed while GET request to Filed", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});



module.exports = router;