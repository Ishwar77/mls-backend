const JOI = require("../utils/JOI");
/**
 * A user has name, signup_date, isActive, inActive_from properties
 */
class User {
    /**
     * To create a User instance
     * @param name String, represents the name of this User 
     * @param signup_date Date OPTIONAL, represents the date of signup with this application 
     * @param isActive Boolean OPTIONAL, represents weather the user is active / closed the account
     * @param inActive_from Date OPTIONAL , represents the date when the user closed the account
     * @param channels any[] OPTIONAL, represents the channel id's selected by the user
     */
    constructor(name, signup_date = new Date(), isActive = true, inActive_from = null, channels = null) {
        this.name = name;
        this.signup_date = signup_date;
        this.isActive = isActive;
        this.inActive_from = inActive_from;
        this.channels = channels;
    }

    /**
     * Static function to get JOI validation schema for User
     */
    static getJOIValidationSchema() {
        return {
            name: JOI.string().min(3).max(50).required(),
            signup_date: JOI.any().default(new Date()),
            isActive: JOI.any().default(true),
            inActive_from: JOI.any(),
            channels: JOI.any()
        };
    }

    /**
     * Verifies the instance value and if invalid state, retuns error object, if valied returns null
     * @returns any | null
     */
    hasError() {
        let error = JOI.validate(this, User.getJOIValidationSchema());
        return (error && error.error) ? error.error : null;
    }


    /**
     * Static function to get User data from HttpRequest object
     * @param reqObj Any
     * @param updateableFields Boolean OPTIONAL DEFAULT = false, if true get only properties to be updated
     * @returns User | null
     */
    static getUserFromRequestObj(reqObj, updateableFields = false) {
        if(!reqObj || !reqObj.name) return null;

        if(!updateableFields) {
            const user = new User(reqObj.name,
                reqObj.signup_date || new Date(), 
                reqObj.isActive || true, 
                reqObj.inActive_from || null, 
                reqObj.channels || null );
            return user;
        }

        const usr = {};
        usr.name = reqObj.name;

        if(reqObj.signup_date) usr.signup_date = reqObj.signup_date;
        if(reqObj.isActive !== undefined && reqObj.isActive !== null) usr.isActive = reqObj.isActive;
        if(reqObj.inActive_from) usr.inActive_from = reqObj.inActive_from;
        if(reqObj.channels) usr.channels = reqObj.channels;

        return usr;
    }
}

module.exports = User;
