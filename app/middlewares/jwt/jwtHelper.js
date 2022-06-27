const jwt = require('jsonwebtoken');
const config = require('config');
const logger = require('../../utils/logger');
const Payload = require('./jwtPayload');
module.exports = class JWTHelper {


        /** 
     * To get configured application port 
     * @returns number 
     */
    static getAppConfig(conf = null) {
        const appConf = config.get("app");

        if (!appConf) return null;
        if (!conf) return appConf;

        conf = conf.trim();

        if (conf === 'port') {
            if (process.env && process.env.PORT) {
                return process.env.PORT;
            }
            return appConf.port || null;
        } else {
            return appConf.conf;
        }
    }

    static getAuthTokenFromHeader(httpRequest) {
        if (!httpRequest || !httpRequest.headers) throw new Error("Missing HttpRequest");

        const tokenName = JWTHelper.getAppConfig()['tokenNameInRequests'] || 'authtoken';
        // const token = Payload.getTokenFromReqObj(httpRequest.headers, tokenName);
        const token = Payload.getTokenFromReqObj(httpRequest.headers, "x-memo-auth-token")
        return token;
    }

    static getSecretKey() {
        if (!JWTHelper.secretKey) {
            JWTHelper.secretKey = config.get("secretkey");
        }
        return JWTHelper.secretKey;
    }

    /**
     * Utility function to create a JWT
     * @param {*} data string 
     * @param {*} secretKey string
     * @param {*} expiry string DEFAULT = '1h'
     * @param {*} blankSign boolean DEFAULT = false
     * @see https://www.npmjs.com/package/jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback
     */
    static async create(data, secretKey = null, expiry = '8h', blankSign = false) {
        if (typeof data !== 'string') {
            data = JSON.stringify(data);
        }

        secretKey = secretKey ? secretKey : Helper.getSecretKey();
        const conf = blankSign ? null : { expiresIn: expiry };
        return await jwt.sign({
            data: data,
        }, secretKey, { expiresIn: expiry }); // jwt.sign( data, secretKey, conf);
    }


    /**
     * Utility method to verify given JWT token, using the key
     * @param {*} token string
     * @param {*} secretKey string
     * @returns Decoded object | null
     */
    static async verify(token, secretKey = null) {
        const flag = null;
        try {
            secretKey = secretKey ? secretKey : JWTHelper.getSecretKey();
            return await jwt.verify(token, secretKey);
        } catch (e) {
            // TOKEN HAS EXPIRED
            // logger.error('Trying to Verify invalid JWT');
            // logger.error('Token = ' + token);
            // logger.error('Key = ' + secretKey);
            // logger.error('Error ERROR ERROR ' + e);
            return null;
        }
    }


    static async decode(token) {
        return await jwt.decode(token);
    }
}
