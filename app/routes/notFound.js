const express = require("express");
const router = express.Router();
const APIResponse = require("../models/apiResponse");

router.get('*', async(req, res) => {
    APIResponse.sendResponse(res, 404, 'Requested resource may not exist');
    return;
});

router.post('*', async(req, res) => {
    APIResponse.sendResponse(res, 404, 'Requested resource may not exist');
    return;
});

router.put('*', async(req, res) => {
    APIResponse.sendResponse(res, 404, 'Requested resource may not exist');
    return;
});

router.delete('*', async(req, res) => {
    APIResponse.sendResponse(res, 404, 'Requested resource may not exist');
    return;
});

module.exports = router;