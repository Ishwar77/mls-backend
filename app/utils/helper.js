const mongoose = require('mongoose');
const config = require('config');
const logger = require('./logger');
const jwt = require("jsonwebtoken");
const Cryptic = require("./cryptic");
const nodemailer = require("nodemailer");
const Auth = require("../models/auth");
var smtpTransport = require('nodemailer-smtp-transport');
module.exports = class Helper {

    /**
     * Static method to validate for valid Mongoose ObjectId
     * @param objectId String
     * @returns Boolean 
     */
    static isValidMongooseObjectId(objectId) {
        if (!objectId) return false;
        return mongoose.Types.ObjectId.isValid(objectId);
    }


    /**
     * Static function to get connection string for a given data base type
     * @param  dbType String OPTIONAL, DEFAULT = 'mongodb'
     * @return String
     */
    static getConnectionString(dbType = 'mongodb') {
        const dbConf = config.get("db");
        if (!dbConf || !dbConf.length) throw new Error('No Database configuration exists...!');
        // console.log('DBC = ', dbConf);

        const match = dbConf.filter(db => db.type.toLowerCase() === dbType.toLowerCase());
        // console.log('Match = ', match);
        if (!match || !match.length) throw new Error(`No Database configuration exists, for ${dbType} ...!`);

        let cstr = `${match[0].protocol}${match[0].host}/${match[0].database}`;
        // logger.info("Cstr = ", cstr);

        if (dbType === 'mongodb-mlab') {
            // replace un and ps
            const unpsrep = cstr.replace('<username>', config.get('mlabUsername'));
            cstr = unpsrep.replace('<password>', config.get('mlabPassword'));
        }

        return cstr;
    }

    /**
     * Utility function to establish DB connection
     * @param dbType String, OPTIONAL, DEFAULT = 'mongodb'  
     */
    static connectToDb(dbType = 'mongodb') {
        if (dbType && dbType.toLowerCase().startsWith('mongodb')) {
          //  console.log("Connecting to MongoDB");
            mongoose.connect(Helper.getConnectionString(dbType), { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true }).then(res => {
                console.log("Connected to MongoDB...!");
            }).catch(err => {
                logger.error(`Failed connecting to MongoDB, Connection String = "${Helper.getConnectionString(dbType)}"`);
                throw new Error(err);
            });
        } else {
            console.log(`Database of type ${dbType} is not configured...!`);
            return null;
        }
    }

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

    /**
     * To fetch secret key, stored in environment variable
     * @returns String | null
     * @see "../../scripts/dev.bat"
     */
    static getSecretKey() {
        if(!Helper.secretKey) {
            Helper.secretKey = config.get("secretkey");
        }
        return Helper.secretKey ;
    }

    /**
     * To generate JWT token on a given payload
     * @param payload Object, data to be sent throught JWT 
     * @param secretKey String, OPTIONAL Secret String used to encrypt the data, obtained rom environment variable
     * @param expiry String, OPTIONAL How long the tokin s valid e.g. '2' for 2 seconds, '3h' for 3 hours, DEFAULT '1d' i.e. 1 day
     * @returns String
     */
    static async generateJWT(payload, secretKey = null, expiry = "1d", blankSign = false) {
        secretKey = secretKey ? secretKey : Helper.getSecretKey();

        const conf = blankSign ? null :  { expiresIn: expiry };

        return await jwt.sign(payload, secretKey, conf);
    }

    /**
     * To verify the correctness of the JWT Signature
     * @param token String, the JWT Signature 
     * @param secretKey String, the secrate key
     * @returns string | object
     */
    static async verifyJWT(token, secretKey = null) {
        secretKey = secretKey ? secretKey : Helper.getSecretKey();
        return await jwt.verify(token, secretKey);
    }


    /**
     * Utility method to create an Authorized token, with default expiry of 30 day
     * @param data Object{payload: any, locked: boolean} 
     * @param key String
     * @returns String
     * @see https://gitlab.com/memo-feeds/documentation/blob/master/backend/Auth.md#authorization
     */
    static async createAuthToken(data, key, expiry = '30 days') {
        if (!data || !key) return null;

        const transformedData = Cryptic.transformData(data.payload, 'ENC');
        const hash = Cryptic.hash(transformedData, key);
 
        if (!transformedData) return null;

        const authInfo = {
            payload: hash,
            locked: data.locked || false
        };

        let tok = null;
        try {
            tok = await Helper.generateJWT(authInfo, key, expiry);
        } catch(e) {
            logger.error(`Failed to create Auth token `);
            logger.error(e);
        }
        return tok; 
    }

    /**
     * Utility method to Verify given Authorized token, with default expiry of 1 day
     * @param data String, JWT web token create by  Helper.createAuthToken()
     * @param key String, Pass phrase 
     * @returns boolean | null
     * @see https://gitlab.com/memo-feeds/documentation/blob/master/backend/Auth.md#authorization
     */
    static async verifyAuthToken(token, key) {
        if (!token || !key) return null;
      
        let tokenData = null;
        try {
            tokenData = await Helper.verifyJWT(token, key);
            return (tokenData && tokenData.payload) ? true : false;
            // todo : This is not a proper token validation...!
        } catch(e) {
            logger.error(`Failed to verify Auth token "${token}"`);
            logger.error(e);
        }
        return null;
    }

    static getAuthTokenFromHeader(httpRequest) {
        if (!httpRequest || !httpRequest.headers) throw new Error("Missing HttpRequest");

        const tokenName = Helper.getAppConfig()['tokenNameInRequests'] || 'authtoken';
        const token = Auth.getTokenFromReqObj(httpRequest.headers, tokenName);
        return token;
    }

    /**
     * To send Email using nodemailer
     * @param to String or comma seperated strings 
     * @param subject String  
     * @param text String, plain text email 
     * @param html String, Html format of email 
     * @param from String, OPTIONAL Sender address DEFAULT =  "Memo Feeds <cr.sriharsha92@gmail.com>", mail config obtained from /config/*.json
     * @param attachements Object[{ filename: string, content: Buffer }], OPTIONAL attachements list
     * @see https://nodemailer.com/about/
     * @see https://stackoverflow.com/questions/45494639/nodemailer-error-self-signed-certificate-in-certificate-chain
     */
    static async sendEMail(to, subject, text, html, from, attachements) {
        const apiKey = config.get('mailerApiKey');
        if (!apiKey) return;

        if (!from) {
            from = config.get('mail').sender;
        }

        const transporter = nodemailer.createTransport(smtpTransport({
            service: 'SendGrid',
            secure: false,
            auth: {
                user: 'apikey', // generated ethereal user
                pass: apiKey // generated ethereal password
            }
        }));

        try {
            const info = await transporter.sendMail({
                from: from,
                to: to, // list of receivers comma seperated
                subject: subject, // Subject line
                text: text, // plain text body
                html: html // html body
            });

            return info;
        } catch (e) {
            logger.error(`Failed to send email to ${to} `);
            logger.error(e);
            return null;

        } finally {
            transporter.close();
        }

    }

};
