const JwtHelper = require("./jwtHelper");
const APIResponse = require("../../models/apiResponse");

class AuthorizeMiddlewareAuth {
    /**
 * To enable access for Admin only
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
    static async adminOnly(req, res, next) {
        const token = JwtHelper.getAuthTokenFromHeader(req);
        if (!token) {
            APIResponse.sendResponse(res, 403, "Authorized access only");
            return false;
        }
        // Token is present, so verify for the AuthToken validity
        const key = JwtHelper.getSecretKey();
        const tokenData = await JwtHelper.verify(token, key); // Helper.verifyAuthToken(token, Helper.getSecretKey());
        if (!tokenData || !tokenData.data) {
            APIResponse.sendResponse(res, 401, "You are not authorized to make this request", null);
            return false;
        } else {
            try {
                const data = JSON.parse(tokenData.data);
                if (!data || !data.userRole || data.userRole !== 'ADMIN') {
                    APIResponse.sendResponse(res, 401, "You do not have previlate make this request", null);
                    return false;
                }
            } catch (e) {
                APIResponse.sendResponse(res, 401, "You do not have previlate make this request", null);
                return false;
            }
        }
        next();
    }

    /**
* To enable access for Users and Admin only
* @param {*} req 
* @param {*} res 
* @param {*} next 
*/
    static async usersAndAdminOnly(req, res, next) {
        const token = JwtHelper.getAuthTokenFromHeader(req);
        if (!token) {
            APIResponse.sendResponse(res, 403, "Authorized access only");
            return false;
        }
        // Token is present, so verify for the AuthToken validity
        const key = JwtHelper.getSecretKey();
        const tokenData = await JwtHelper.verify(token, key); // Helper.verifyAuthToken(token, Helper.getSecretKey());
        if (!tokenData || !tokenData.data) {
            APIResponse.sendResponse(res, 401, "You are not authorized to make this request", null);
            return false;
        } else {
            try {
                const data = JSON.parse(tokenData.data);
                console.log("Data ", data);
                if (data || data.userRole || data.userRole === 'ADMIN' || data.userRole === 'USER') {
                    // APIResponse.sendResponse(res, 401, "You do not have previlate make this request", null);
                    // return false;
                    next();
                }
            } catch (e) {
                APIResponse.sendResponse(res, 401, "You do not have previlate make this request", null);
                return false;
            }
        }
        // next();
    }
}

module.exports = AuthorizeMiddlewareAuth;
