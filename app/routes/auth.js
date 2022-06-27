const express = require("express");
const router = express.Router();
const Auth = require("../models/auth");
const logger = require("../utils/logger");
const Helper = require("../utils/helper");
const APIResponse = require("../models/apiResponse");
const EmailUtils = require("../utils/emailUtils");
const AuthorizeMiddleware = require("../middlewares/authorize");

/**
 * todo
 * Email and password based authentication
 */


console.log("Route Auth Loaded...!");
/**
 * To generate the authentication token and send an Email
 * This is the first API which will be called by an end-user
 * Note: Email validation is removed, so only password is sufficient 
 */
router.post('/generate', async (req, res) => {
    console.log('POST: Auth');
    const authObj = Auth.getAuthInfoFromRequestObj(req.body);
    if (!authObj || !authObj.pass || authObj instanceof Auth === false) {  /* authObj.email */
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }

    // 1. create auth token, using password
    const authToken = await Helper.createAuthToken({ payload: authObj.pass, locked: false }, Helper.getSecretKey());
    // console.log(authToken);

    if (!authToken) {
        APIResponse.sendResponse(res, 400, `Encountered and error while processing the request`, { email: authObj.email });
        return;
    }

    const tokenName = Helper.getAppConfig()['tokenNameInRequests'];
    const metaData = {
        email: authObj.email, 
        locked: authObj.locked,
        token: authToken,
        tokenNameInRequests: tokenName,
        comment: `Set the token "${tokenName}", in all future requests with value "${authToken}" `
    };
    // console.log('metaData = ', metaData);

    APIResponse.sendResponse(res, 200, 'Proceed to login', metaData);
    return;

    /*  
        // Send email with login Url
        try {
            const resp = await Helper.sendEMail(authObj.email, 'Access to Memo Feeds', EmailUtils.getTextMessage(url) , EmailUtils.getHtmlMessage(url));
            if(resp && resp['accepted']) {
                APIResponse.sendResponse(res, 200, `An email has sent to ${authObj.email}`, metaData);
            } else {
                APIResponse.sendResponse(res, 400, `Encountered and error while processing the request`, metaData);
            }
            return false;
        } catch(e) {
            // Failed to send email, so share redirect to login Url
            res.writeHead(302, {
                'Location': url
            });
            logger.error(`Failed to send an email to ${authObj.email} `, JSON.stringify(metaData));
            logger.error(e);
            APIResponse.sendResponse(res, 302, 'Redirecting to login page', metaData);
        } 
            return;
    */

});

// lockState = 'lock' | 'unlock'
router.get('/session/:lockState', async (req, res) => {
    console.log('PUT: Auth');
    const lockState =  req.params.lockState || null;
    const validStates = ['lock', 'unlock'];

    if (!lockState || validStates.indexOf(lockState.toLowerCase()) < 0 ) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }

    // Update the token, with appropriate lockState
    const token = Helper.getAuthTokenFromHeader(req);
    if(!token) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request');
        return;
    }

    // Decode token and get TokenData
    const tokenData = await Helper.verifyJWT(token, Helper.getSecretKey());
    if(!tokenData || !tokenData.payload) {
        APIResponse.sendResponse(res, 400, 'Server error while processing the request, payload corrupted');
        return;
    }

    if((tokenData.locked && lockState === validStates[0]) || (!tokenData.locked && lockState === validStates[1])) {
        // session is locked & again making a lock request, so dont generate new token
        APIResponse.sendResponse(res, 429, `The user session state is already "${tokenData.locked ? 'Locked' : 'Un locked'}", your request was ignored..!`);
        return;
    }

    // update tokenData.locked, generate new token with same payload and expiry and send to user
    tokenData.locked = lockState === validStates[0] ? true : false;

    // console.log('tokenData = ', tokenData );

    // IMPORTANT: Simply sign the data, dont alter expiry and payload
    const newJwt = await Helper.generateJWT(tokenData, null, null, true);

    const tokenName = Helper.getAppConfig()['tokenNameInRequests'];
    const metaData = {
        locked: tokenData.locked,
        token: newJwt,
        tokenNameInRequests: tokenName,
        comment: `Set the token "${tokenName}", in all future requests with value "${newJwt}" `
    };
    // console.log('metaData = ', metaData);

    APIResponse.sendResponse(res, 200, `User session is now "${lockState}ed"`, metaData);
    return;
});


module.exports = router;