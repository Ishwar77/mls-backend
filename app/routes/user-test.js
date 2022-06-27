const express = require("express");
const router = express.Router();
const UserDAO = require("../daos/user-test");
const User = require("../models/user-test");
const logger = require("../utils/logger");
const Helper = require("../utils/helper");
const APIResponse = require("../models/apiResponse");
const AuthorizeMiddleware = require("../middlewares/authorize");

console.log("Route User Loaded...!");

router.get('/', async (req, res) => {
    console.log("GET: User");
    // Get all Users
    let users = null;
    try {
        users = await UserDAO.selectAll();
    } catch (e) {
        logger.warn("Failed while GET request to User", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, users);
    return;
});

router.get('/:id', async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;

    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }

    console.log("GET: User by id");
    // Get all Users
    let status, message = null;
    try {
        const user = await UserDAO.selectById(id);
        if (user && user['_id']) {
            message = user;
            status = 200;
        } else {
            message = `No User found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to User", e);
        status = 500;
        message = "Server error while processing the request";
    }

    APIResponse.sendResponse(res, status, message);
    return;
});

router.post('/create', async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: User');
    const userObj = User.getUserFromRequestObj(req.body);
    if (!userObj || userObj instanceof User === false || userObj.hasError()) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }

    let msg, stat, meta = null;
    try {
        msg = UserDAO.create(userObj);
        stat = 200;
    } catch (e) {
        msg = "Server error while creating the User";
        stat = 500;
        meta = userObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});

router.put('/:id', async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('PUT: User');
    const id = req.params.id;

    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }

    const updateables = User.getUserFromRequestObj(req.body, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }

    let msg, stat, meta = null;
    try {
        msg = await UserDAO.update(id, updateables);
        stat = 200;
    } catch (e) {
        msg = "Server error while updating the User";
        stat = 500;
        meta = userObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


router.delete('/:id', async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('DELETE: User');
    const id = req.params.id;

    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }

    let msg, stat, meta = null;
    try {
        msg = await UserDAO.deleteById(id);
        stat = 200;
    } catch (e) {
        msg = "Server error while deleting the User";
        stat = 500;
        meta = userObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;

});



module.exports = router;