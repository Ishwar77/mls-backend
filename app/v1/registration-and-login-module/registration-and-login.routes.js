const express = require("express");
const crypto = require('crypto');
const router = express.Router();
const RegistrationAndLoginDAO = require("./registration-and-login.dao");
const RegistrationAndLogin = require("./registration-and-login.model");
const logger = require("../../utils/logger");
const Helper = require("../../utils/helper");
const APIResponse = require("../../models/apiResponse");
const Cryptic = require('../../utils/cryptic');
const AuthorizeMiddlewareAuth = require("../../middlewares/jwt/auth");
const reqIp = require("request-ip");
const InitModel = require('../../middlewares/jwt/init.model');

console.log("Route Registration and Login Loaded...!");

// Get all RegistrationAndLogin
router.get('/', async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Registration/Login");
    let registrationandlogins = null, message = null;
    try {
        registrationandlogins = await RegistrationAndLoginDAO.selectAll();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to Registration/Login", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, registrationandlogins);
    return;
});

// Get all RegistrationAndLogin
router.get('/getActiveUsers', async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Active Registration/Login");
    let registrationandlogins = null, message = null;
    try {
        registrationandlogins = await RegistrationAndLoginDAO.findAllActiveUsers();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to Registration/Login", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, registrationandlogins);
    return;
});

//Creating RegistrationAndLogin
router.post('/register', async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: Registration');
        const registrationandloginObj = RegistrationAndLogin.getUserModelFromRequestObj(req.body);
        console.log("registrationandloginObj.password BEFORE", registrationandloginObj.password);
        registrationandloginObj.password = crypto.createHash('sha256').update(registrationandloginObj.password).digest('hex');
        console.log("registrationandloginObj.password AFTER", registrationandloginObj.password);
        if (!registrationandloginObj || registrationandloginObj instanceof RegistrationAndLogin === false) {
            APIResponse.sendResponse(res, 400, 'Server error while processing the request');
            return;
        }
        let userCount = 0;
        const rgisteredUsers = await RegistrationAndLoginDAO.findAllActiveUsers();
        rgisteredUsers && rgisteredUsers.map(obj => {
            if(obj.userName === registrationandloginObj.userName || obj.emailId === registrationandloginObj.emailId || obj.mobileNumber === registrationandloginObj.mobileNumber) {
                userCount ++;
            }
        });
        console.log("userCount ", userCount);
        let msg, stat, meta = null;
        if(!userCount) {
            try {
                meta = RegistrationAndLoginDAO.create(registrationandloginObj);
                stat = 200;
                msg = 'Success'
            } catch (e) {
                console.log("E ", e);
                msg = "Server error while creating the RegistrationAndLogin";
                stat = 500;
                meta = registrationandloginObj;
            }
        } else {
            stat = 400;
            msg = "Already existing UserName / EmailID / MobileNumber - Please enter other Details"
        }
        APIResponse.sendResponse(res, stat, msg, meta);
        return;
});

//Login
router.post('/login', async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: Login');
        const loginObj = RegistrationAndLogin.getUserModelFromRequestObj(req.body);
        const password = crypto.createHash('sha256').update(loginObj.password).digest('hex');
        const loginUser = await RegistrationAndLoginDAO.findAllActiveUsers();
        let userCount = 0, userRole = null;
        loginUser && loginUser.map(obj => {
            if(obj.userName === loginObj.userName && obj.password === password) {
                userRole = obj.userRole;
                userCount ++;
            }
        });
        if(userCount) {
            const ip = reqIp.getClientIp(req);
            const clientSignature = req.body['clientSignature'] || {};
            const roleUser = userRole || "USER";
            clientSignature['IP'] = clientSignature['IP'] ? clientSignature['IP'] : ip;
            const events = await InitModel.initSession(roleUser, clientSignature);
            if(events && events.state === 'ERROR') {
                APIResponse.sendResponse(res, 400, "Creating User Session Failed", events);
            } else {
                APIResponse.sendResponse(res, 200, "Creating User Session Success", events);
            }
        } else {
            APIResponse.sendResponse(res, 400, "Login Failed Please enter Valid Credentials");
        }
        console.log("userCount ", userCount, "userRole ", userRole);
});

//Updating RegistrationAndLogin
router.put('/:id', async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('PUT: RegistrationAndLogin');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = RegistrationAndLogin.getUserModelFromRequestObj(req.body, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await RegistrationAndLoginDAO.update(id, updateables);
        stat = 200;
        msg = 'Success';
    } catch (e) {
        msg = "Server error while updating the RegistrationAndLogin";
        stat = 500;
        meta = updateables;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});

//Deleting the RegistrationAndLogin
router.delete('/:id', async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('DELETE: RegistrationAndLogin');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = RegistrationAndLogin.getUserModelFromRequestObj({ isActive: false }, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await RegistrationAndLoginDAO.update(id, updateables);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while deleting the RegistrationAndLogin";
        stat = 500;
        meta = registrationandloginObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});

module.exports = router;