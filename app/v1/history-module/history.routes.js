const express = require("express");
const router = express.Router();
const HistoryDAO = require("./history.dao");
const History = require("./history.model");
const logger = require("../../utils/logger");
const Helper = require("../../utils/helper");
const APIResponse = require("../../models/apiResponse");
const Cryptic = require('../../utils/cryptic');
const AuthorizeMiddlewareAuth = require("../../middlewares/jwt/auth");
// let { PythonShell } = require('python-shell')


console.log("Route Form Loaded...!");

// Get all History
router.get('/', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Form");
    let histories = null, message = null;
    try {
        histories = await HistoryDAO.selectAll();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to History", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, histories);
    return;
});

// Get all Form
router.get('/getActiveForm', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Active Form");
    let histories = null, message = null;
    try {
        histories = await HistoryDAO.findAllActiveHistory();
        message = 'Success';
    } catch (e) {
        logger.warn("Failed while GET request to Form", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, histories);
    return;
});

// Get all Forms byID
// router.get('/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
//     // AuthorizeMiddleware.authenticate, 
//     const id = req.params.id;
//     if (!Helper.isValidMongooseObjectId(id)) {
//         APIResponse.sendResponse(res, 400, 'Server error while processing the request');
//         return;
//     }
//     console.log("GET: Form by id");
//     let status, message = null, metadata = null;
//     try {
//         const form = await FormDAO.selectById(id);
//         if (form && form['_id']) {
//             metadata = form;
//             status = 200;
//             message = 'Success'
//         } else {
//             message = `No Form found with id ${id}`;
//             status = 404;
//         }
//     } catch (e) {
//         logger.warn("Failed while GET request to Form", e);
//         status = 500;
//         message = "Server error while processing the request";
//     }
//     APIResponse.sendResponse(res, status, message, metadata);
//     return;
// });


// //Get Form on Study ID
// router.get('/studyid/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
//     // AuthorizeMiddleware.authenticate, 
//     const id = req.params.id;
//     if (!Helper.isValidMongooseObjectId(id)) {
//         APIResponse.sendResponse(res, 400, 'Server error while processing the request');
//         return;
//     }
//     console.log("GET: Form by StudyId");
//     let status, message = null, metadata = null;
//     try {
//         const form = await FormDAO.formOnStudyId(id);
//         if (form) {
//             metadata = form;
//             status = 200;
//             message = 'Success';
//         } else {
//             message = `No Form found with id ${id}`;
//             status = 404;
//         }
//     } catch (e) {
//         logger.warn("Failed while GET request to Form", e);
//         status = 500;
//         message = "Server error while processing the request";
//     }
//     APIResponse.sendResponse(res, status, message, metadata);
//     return;
// });


// //Get Form on FormOID ID
// router.get('/folderoid/:oid/studyid/:studyid', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
//     // AuthorizeMiddleware.authenticate, 
//     const oid = req.params.oid;
//     const studyid = req.params.studyid;
//     if (!Helper.isValidMongooseObjectId(studyid)) {
//         APIResponse.sendResponse(res, 400, 'Server error while processing the request');
//         return;
//     }
//     console.log("GET: Form by FormOID");
//     let status, message = null, metadata = null;
//     try {
//         const form = await FormDAO.formOnFolderOID(oid, studyid);
//         if (form) {
//             metadata = form;
//             status = 200;
//             message = 'Success';
//         } else {
//             message = `No Form found with id ${oid}`;
//             status = 404;
//         }
//     } catch (e) {
//         logger.warn("Failed while GET request to Form", e);
//         status = 500;
//         message = "Server error while processing the request";
//     }
//     APIResponse.sendResponse(res, status, message, metadata);
//     return;
// });


// //Get Form on FormOID ID and Version with StudyID
// router.get('/version/:ver/folderoid/:oid/studyid/:studyid', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
//     // AuthorizeMiddleware.authenticate, 
//     const oid = req.params.oid;
//     const studyid = req.params.studyid;
//     const ver = req.params.ver;
//     if (!Helper.isValidMongooseObjectId(studyid)) {
//         APIResponse.sendResponse(res, 400, 'Server error while processing the request');
//         return;
//     }
//     console.log("GET: Form by FormOID");
//     let status, message = null, metadata = null;
//     try {
//         const form = await FormDAO.formOnVersionFolderOIDandStudy(oid, studyid, ver);
//         if (form) {
//             metadata = form;
//             status = 200;
//             message = 'Success';
//         } else {
//             message = `No Form found with id ${oid}`;
//             status = 404;
//         }
//     } catch (e) {
//         logger.warn("Failed while GET request to Form", e);
//         status = 500;
//         message = "Server error while processing the request";
//     }
//     APIResponse.sendResponse(res, status, message, metadata);
//     return;
// });


//Creating History
router.post('/create', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: History');
    const historyObj = History.getHistoryFromRequestObj(req.body);
    historyObj.uuid = Cryptic.hash(historyObj.version_code + historyObj.created + historyObj.comment);
    if (!historyObj || historyObj instanceof History === false) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = HistoryDAO.create(historyObj);
        stat = 200;
        msg = 'Success';
    } catch (e) {
        console.log("E ", e);
        msg = "Server error while creating the Form";
        stat = 500;
        meta = historyObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});

// //Updating Form
// router.put('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
//     // AuthorizeMiddleware.authenticate, 
//     console.log('PUT: Form');
//     const id = req.params.id;
//     if (!Helper.isValidMongooseObjectId(id)) {
//         APIResponse.sendResponse(res, 400, 'Server error while processing the request');
//         return;
//     }
//     const updateables = Form.getFormFromRequestObj(req.body, true);
//     if (!updateables) {
//         APIResponse.sendResponse(res, 400, 'Server error while processing the request');
//         return;
//     }
//     let msg, stat, meta = null;
//     try {
//         meta = await FormDAO.update(id, updateables);
//         stat = 200;
//         msg = 'Success';
//     } catch (e) {
//         msg = "Server error while updating the Form";
//         stat = 500;
//         meta = updateables;
//     }
//     APIResponse.sendResponse(res, stat, msg, meta);
//     return;
// });


// //Deleting the Form
// router.delete('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
//     // AuthorizeMiddleware.authenticate, 
//     console.log('DELETE: Form');
//     const id = req.params.id;
//     if (!Helper.isValidMongooseObjectId(id)) {
//         APIResponse.sendResponse(res, 400, 'Server error while processing the request');
//         return;
//     }
//     const updateables = Form.getFormFromRequestObj({ isActive: false }, true);
//     if (!updateables) {
//         APIResponse.sendResponse(res, 400, 'Server error while processing the request');
//         return;
//     }
//     let msg, stat, meta = null;
//     try {
//         meta = await FormDAO.update(id, updateables);
//         stat = 200;
//         msg = 'Success';
//     } catch (e) {
//         msg = "Server error while deleting the Form";
//         stat = 500;
//         meta = formObj;
//     }
//     APIResponse.sendResponse(res, stat, msg, meta);
//     return;
// });

// router.post('/bulkCreate', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
//     // AuthorizeMiddleware.authenticate,
//     console.log('POST: Bulk Forms');
//     const formObj = req.body;
//     if (!formObj) {
//         APIResponse.sendResponse(res, 400, 'Server error while processing the request');
//         return;
//     }
//     let msg, stat, meta = null;
//     try {
//         meta = FormDAO.bulkCreate(formObj);
//         stat = 200;
//         msg = 'Success';
//     } catch (e) {
//         console.log("e ", e);
//         msg = "Server error while creating the Forms";
//         stat = 500;
//         meta = formObj;
//     }
//     APIResponse.sendResponse(res, stat, msg, meta);
//     return;
// });


// function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }

// // Get all Form byStudyID snd Latest Version
// router.get('/latestversion/folder/:oid/study/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
//     // AuthorizeMiddleware.authenticate, 
//     const id = req.params.id;
//     const oid = req.params.oid;
//     if (!Helper.isValidMongooseObjectId(id)) {
//         APIResponse.sendResponse(res, 400, 'Server error while processing the request');
//         return;
//     }
//     console.log("GET: Form by id");
//     let status, message = null, frmetadata = null, metadata = null;
//     try {
//         console.log("oid ", oid);
//         console.log("id ", id);
//         const form = await FormDAO.formOnFolderOID(oid, id);
//         console.log("form ", form);
//         if (form) {
//             frmetadata = form;
//             let verNum = 0;
//             frmetadata && frmetadata.map(verN => {
//                 let filteredVNum = verN.version
//                 console.log("filteredVNum ", filteredVNum);
//                 if (filteredVNum !== 'null') {
//                     let versionNum = filteredVNum.split("V");
//                     let firstVer = filteredVNum.split("");
//                     if (firstVer[0] === "V" && isNumber(versionNum[1]) === true) {
//                         if (parseInt(versionNum[1]) >= verNum) {
//                             verNum = parseInt(versionNum[1]);
//                             console.log("verNum ", verNum);
//                         }
//                     }
//                 }
//             });
//             let versn = 'V' + verNum;
//             console.log("versn ", versn);
//             metadata = await FormDAO.findFormsOnLatestVer(versn, id)
//             status = 200;
//             message = 'Success'
//         } else {
//             metadata = `No Form found with id ${id}`;
//             status = 404;
//             message = 'Nothing to Display'
//         }
//     } catch (e) {
//         logger.warn("Failed while GET request to Form", e);
//         status = 500;
//         message = "Server error while processing the request";
//     }
//     APIResponse.sendResponse(res, status, message, metadata);
//     return;
// });

// //Creating Form folder connection via matrix script
// router.post('/runmatrixscript', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
//     //run script here
//     PythonShell.run('./app/others/als_matrix.py', null, function (err, results) {
//         if (err) throw err;
//         console.log('alsfinished');
//         // console.log("alsresults ", results);
//         const scriptResults = results;

//         if (scriptResults) {
//             // AuthorizeMiddleware.authenticate,
//             console.log('POST: Form');
//             const formObj = Form.getFormFromRequestObj(req.body);
//             const stringifydata = JSON.stringify(scriptResults);
//             formObj.uuid = Cryptic.hash(formObj.oid + formObj.created + formObj.study_id);
//             formObj.matrixdata = stringifydata;
//             console.log(formObj);
//             if (!formObj || formObj instanceof Form === false) {
//                 APIResponse.sendResponse(res, 400, 'Server error while processing the request');
//                 return;
//             }
//             let msg, stat, meta = null;
//             try {
//                 meta = FormDAO.create(formObj);
//                 stat = 200;
//                 msg = 'Success';
//             } catch (e) {
//                 console.log("E ", e);
//                 msg = "Server error while creating the Form";
//                 stat = 500;
//                 meta = formObj;
//             }
//             console.log('meta',meta);
//             APIResponse.sendResponse(res, stat, msg, meta);
//             return;
//         } else {
//             console.log('no sR');
//         }
//     });
// });

//get from readme text file
// router.get('/getMatrixScriptResult', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
//     // AuthorizeMiddleware.authenticate, 
//     // const id = req.params.id;
//     // if (!Helper.isValidMongooseObjectId(id)) {
//     //     APIResponse.sendResponse(res, 400, 'Server error while processing the request');
//     //     return;
//     // }
//     console.log('running script');

//     PythonShell.run('./app/others/als_matrix.py', null, function (err, results) {
//         if (err) throw err;
//         console.log('alsfinished');
//         console.log("alsresults ", results);
//         const scriptResults = results;
//         if (scriptResults) {
//             console.log("GET: Form by id");
//             let status, message = null, metadata = null;
//             try {
//                 console.log('file',"./readme7.txt");
//                 if (scriptResults) {
//                     metadata = scriptResults ;
//                     status = 200;
//                     message = 'Success'
//                 } else {
//                     message = `No Form found with id `;
//                     status = 404;
//                 }
//             } catch (e) {
//                 logger.warn("Failed while GET request to Form", e);
//                 status = 500;
//                 message = "Server error while processing the request sdjhfvjsd";
//             }
//             APIResponse.sendResponse(res, status, message, metadata);
//             return;
//         }
//     });
// });

module.exports = router;