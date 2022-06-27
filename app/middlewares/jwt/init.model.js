const JwtHelper = require("./jwtHelper");
const APIResponse = require("../../models/apiResponse");
const JWTPayload = require('./jwtPayload');
const config = require('config');

module.exports = class InitModel { 

static async initSession(userRole, clientSignature) {

    // const key = config.get('secretkey');
    const key = 'This_is_the_Real_Secret_Key';
    const headerKey = JwtHelper.getAppConfig()["tokenNameInRequests"] || 'x-maiora-auth-token';
    // const data = JSON.stringify({ userId: userObj.user_id, email: reqBody.email });

    const JWTPaylodData = new JWTPayload(userRole, (new Date()).getTime(), clientSignature);

    const token = await JwtHelper.create(JWTPaylodData, key, '5h');  // await Helper.createAuthToken({ payload: data }, key);

    const initResp = {
        state: 'SUCCESS',
        token: token,
        httpHeaderKey: headerKey,
        // session: JWTPaylodData
    };

    return initResp;
}
}