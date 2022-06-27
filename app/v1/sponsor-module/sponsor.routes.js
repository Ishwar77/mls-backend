const express = require("express");
const router = express.Router();
const SponsorDAO = require("./sponsor.dao");
const Sponsor = require("./sponsor.models");
const logger = require("../../utils/logger");
const Helper = require("../../utils/helper");
const APIResponse = require("../../models/apiResponse");
const Cryptic = require('../../utils/cryptic');
const AuthorizeMiddlewareAuth = require("../../middlewares/jwt/auth");

console.log("Route Sponsor Loaded...!");


// Get all Sponsor
router.get('/', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Sponsor");
    let sponsors = null, message = null;
    try {
        sponsors = await SponsorDAO.selectAll();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to Sponsor", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, sponsors);
    return;
});


// Get all Sponsor
router.get('/getActiveSponsors', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log("GET: Active Sponsor");
    let sponsors = null, message = null;
    try {
        sponsors = await SponsorDAO.findAllActiveSponser();
        message = 'Success'
    } catch (e) {
        logger.warn("Failed while GET request to Sponsor", e);
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
    }
    APIResponse.sendResponse(res, 200, message, sponsors);
    return;
});


// Get all Sponsors byID
router.get('/:id', AuthorizeMiddlewareAuth.usersAndAdminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    console.log("GET: Sponsor by id");
    let status, message = null, metadata = null;
    try {
        const sponsor = await SponsorDAO.selectById(id);
        if (sponsor && sponsor['_id']) {
            metadata = sponsor;
            status = 200;
            message = 'Success'
        } else {
            message = `No Sponsor found with id ${id}`;
            status = 404;
        }
    } catch (e) {
        logger.warn("Failed while GET request to Sponsor", e);
        status = 500;
        message = "Server error while processing the request";
    }
    APIResponse.sendResponse(res, status, message, metadata);
    return;
});


//Creating Sponsor
router.post('/create', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate,
    console.log('POST: Sponsor');
    const sponsorObj = Sponsor.getSponsorFromRequestObj(req.body);
    sponsorObj.uuid = Cryptic.hash(sponsorObj.name + sponsorObj.created);
    if (!sponsorObj || sponsorObj instanceof Sponsor === false || sponsorObj.hasError()) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = SponsorDAO.create(sponsorObj);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while creating the Sponsor";
        stat = 500;
        meta = sponsorObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


//Updating Sponsor
router.put('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('PUT: Sponsor');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = Sponsor.getSponsorFromRequestObj(req.body, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await SponsorDAO.update(id, updateables);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while updating the Sponsor";
        stat = 500;
        meta = updateables;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


//Deleting the Sponsor
router.delete('/:id', AuthorizeMiddlewareAuth.adminOnly, async (req, res) => {
    // AuthorizeMiddleware.authenticate, 
    console.log('DELETE: Sponsor');
    const id = req.params.id;
    if (!Helper.isValidMongooseObjectId(id)) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    const updateables = Sponsor.getSponsorFromRequestObj({ isActive: false }, true);
    if (!updateables) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }
    let msg, stat, meta = null;
    try {
        meta = await SponsorDAO.update(id, updateables);
        stat = 200;
        msg = 'Success'
    } catch (e) {
        msg = "Server error while deleting the Sponsor";
        stat = 500;
        meta = sponsorObj;
    }
    APIResponse.sendResponse(res, stat, msg, meta);
    return;
});


module.exports = router;