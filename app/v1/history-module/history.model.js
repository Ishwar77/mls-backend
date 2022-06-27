const JOI = require("../../utils/JOI");

 class History { 
    /**
     * To create a Form instance
     * @param uuid String,
     * @param history_date Date, 
     * @param element String
     * @param update_log String
     * @param version_code Number
     * @param comment String
     * @param isActive Boolean, represents weather the user is active / closed the account
     * @param created Date, Represents the Created Date
     * @param lastUpdated Date, Represents the Last Updated Date
     */
    
     constructor( uuid, history_date = new Date() , element, update_log, version_code, comment, 
        isActive = true, created = new Date(), lastUpdated = new Date()) {
        this.uuid = uuid;
        this.history_date = history_date;
        this.element = element;
        this.update_log = update_log;
        this.version_code = version_code;
        this.comment = comment;
        this.isActive = isActive;
        this.created = created;
        this.lastUpdated = lastUpdated;
    }

                
    /**
     * Static function to get JOI validation schema for Form
     */
     static getJOIValidationSchema() {
        return {
            uuid: JOI.string(),  
            history_date: JOI.any().default(new Date()), 
            element: JOI.string(), 
            update_log: JOI.string(), 
            version_code: JOI.string(), 
            comment: JOI.string(), 
            isActive: JOI.any().default(true),
            created: JOI.any().default(new Date()), 
            lastUpdated: JOI.any().default(new Date()),
        };
    }

                
    /**
     * Verifies the instance value and if invalid state, retuns error object, if valied returns null
     * @returns any | null
     */
     hasError() {
        let error = JOI.validate(this, History.getJOIValidationSchema());
        return (error && error.error) ? error.error : null;
    }

        
    
    /**
     * Static function to get Form data from HttpRequest object
     * @param reqObj Any
     * @param updateableFields Boolean OPTIONAL DEFAULT = false, if true get only properties to be updated
     * @returns History | null
     */
     static getHistoryFromRequestObj(reqObj, updateableFields = false) {
        if (!reqObj) return null;
        if (!updateableFields) {
            const history = new History(
                reqObj.uuid, 
                reqObj.history_date || new Date(),
                reqObj.element || 'null', 
                reqObj.update_log || 'null', 
                reqObj.version_code || 'null', 
                reqObj.comment || 'null', 
                reqObj.isActive || true,
                reqObj.created || new Date(), 
                reqObj.lastUpdated || new Date(),
            );
            return history;
        }

        const dtdtr = {};
        // if (reqObj.history_date) dtdtr.history_date = reqObj.history_date;
        if (reqObj.element) dtdtr.element = reqObj.element;
        if (reqObj.update_log) dtdtr.update_log = reqObj.update_log;
        if (reqObj.version_code) dtdtr.version_code = reqObj.version_code;
        if (reqObj.comment) dtdtr.comment = reqObj.comment;
        if (reqObj.isActive !== undefined && reqObj.isActive !== null)
        dtdtr.history_date = new Date();
        dtdtr.isActive = reqObj.isActive;
        dtdtr.lastUpdated = new Date();
        return dtdtr;
    }
 }
 
module.exports = History;