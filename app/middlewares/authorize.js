const Helper = require("../utils/helper");
const APIResponse = require("../models/apiResponse");
const Auth = require("../models/auth");

class AuthorizeMiddleware {
    /**
 * To control access to API endpoints
 * NOTE: Auth token must be present & lock field must be false to access the APIs
 * @param {*} req HttpRequest 
 * @param {*} res HttpResponse
 * @param {*} next any
 */
    static async authenticate(req, res, next) {

        const token = Helper.getAuthTokenFromHeader(req);
        if (!token) {
            APIResponse.sendResponse(res, 403, "Authorized access only");
            return false;
        }

        // Token is present, so verify for the AuthToken validity
        const tokenData = await Helper.verifyJWT(token, Helper.getSecretKey()); // Helper.verifyAuthToken(token, Helper.getSecretKey());
        if (!tokenData || !tokenData.payload) {
            APIResponse.sendResponse(res, 401, "You are not authorized to make this request", null);
            return false;
        }

        // Verify for lock state
        if(tokenData.locked) {
            // User have locked the session, so no further access to any resources
            res.setHeader("lock-token-submitted", "true");
            APIResponse.sendResponse(res, 423, "The user session is locked", null);
            return false;
        }

        next();
    }

}
module.exports = AuthorizeMiddleware;
