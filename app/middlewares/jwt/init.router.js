const express = require("express");
const router = express.Router();
const ApiResponse = require('../../models/apiResponse');
const reqIp = require("request-ip");
const InitModel = require('./init.model');

router.post('/init-session', async (req, res) => {
    const ip = reqIp.getClientIp(req);
    const clientSignature = req.body['clientSignature'] || {};
    const userRole = req.body['userRole'] || 2;
    // const userId = req.body['userId'] || -1;
    // const isGuest = req.body['isGuest'] || true;
    clientSignature['IP'] = clientSignature['IP'] ? clientSignature['IP'] : ip;

    const events = await InitModel.initSession(userRole, clientSignature);
   // console.log(events);
    if(events && events.state === 'ERROR') {
        ApiResponse.sendResponse(res, 400, "Creating User Session Failed", events);
    } else {
        ApiResponse.sendResponse(res, 200, "Creating User Session Success", events);
    }
});

module.exports = router;