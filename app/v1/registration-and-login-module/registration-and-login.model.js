const JOI = require("../../utils/JOI");
/**
 * A User has userRole, userName, emailId, mobileNumber, password, created, lastUpdated, isActive properties
 */

 class RegistrationAndLogin {  
    /**
     * To create a User instance
     * @param userRole string, userRole provided to a User
     * @param userName String
     * @param emailId String
     * @param mobileNumber String
     * @param password String
     * @param isActive Boolean, represents weather the user is active / closed the account
     * @param created Date, Represents the Created Date
     * @param lastUpdated Date, Represents the Last Updated Date
     */
     constructor( userRole, userName, emailId, mobileNumber, password,  
        isActive = true, created = new Date(), lastUpdated = new Date()) {
        this.userRole = userRole;
        this.userName = userName;
        this.emailId = emailId;
        this.mobileNumber = mobileNumber;
        this.password = password;
        this.isActive = isActive;
        this.created = created;
        this.lastUpdated = lastUpdated;
    }

        /**
     * Static function to get JOI validation schema for User
     */
         static getJOIValidationSchema() {
            return {
                userRole: JOI.string(),  
                userName: JOI.string(), 
                emailId: JOI.string(), 
                mobileNumber: JOI.string(), 
                password: JOI.string(), 
                isActive: JOI.any().default(true),
                created: JOI.any().default(new Date()), 
                lastUpdated: JOI.any().default(new Date())
            };
        }

            /**
     * Verifies the instance value and if invalid state, retuns error object, if valied returns null
     * @returns any | null
     */
     hasError() {
        let error = JOI.validate(this, RegistrationAndLogin.getJOIValidationSchema());
        return (error && error.error) ? error.error : null;
    }

    
    /**
     * Static function to get User data from HttpRequest object
     * @param reqObj Any
     * @param updateableFields Boolean OPTIONAL DEFAULT = false, if true get only properties to be updated
     * @returns User | null
     */
     static getUserModelFromRequestObj(reqObj, updateableFields = false) {
        if (!reqObj) return null;
        if (!updateableFields) {
            const user = new RegistrationAndLogin(
                reqObj.userRole, 
                reqObj.userName,
                reqObj.emailId || 'null', 
                reqObj.mobileNumber || 'null', 
                reqObj.password || 'null', 
                reqObj.isActive || true,
                reqObj.created || new Date(), 
                reqObj.lastUpdated || new Date()
            );
            return user;
        }
        const loguser = {};
        if (reqObj.emailId) loguser.emailId = reqObj.emailId;
        if (reqObj.mobileNumber) loguser.mobileNumber = reqObj.mobileNumber;
        if (reqObj.isActive !== undefined && reqObj.isActive !== null) loguser.isActive = reqObj.isActive;
        loguser.lastUpdated = new Date();
        return loguser;
    }
 }

module.exports = RegistrationAndLogin;