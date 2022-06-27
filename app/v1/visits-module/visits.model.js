const JOI = require("../../utils/JOI");
/**
 * A Visit has uuid, study_id, matrix_id, subject, scrn, 
 * visit1, cm, ae, version, isActive, created, lastUpdated properties
 */


 class Visit { 
    /**
     * To create a Visit instance
     * @param uuid String, Unique ID provided to each Visit
     * @param study_id string, study_id ID provided to a Visit
     * @param matrix_id String
     * @param subject String
     * @param scrn Number
     * @param visit1 String
     * @param cm String
     * @param ae String
     * @param version String
     * @param isActive Boolean, represents weather the user is active / closed the account
     * @param created Date, Represents the Created Date
     * @param lastUpdated Date, Represents the Last Updated Date
     */

     constructor( uuid, study_id, matrix_id, subject, scrn, visit1, cm, ae,
        version, isActive = true, created = new Date(), lastUpdated = new Date()) {
        this.uuid = uuid;
        this.study_id = study_id;
        this.matrix_id = matrix_id;
        this.subject = subject;
        this.scrn = scrn;
        this.visit1 = visit1;
        this.cm = cm;
        this.ae = ae;
        this.version = version;
        this.isActive = isActive;
        this.created = created;
        this.lastUpdated = lastUpdated;
    }

            
    /**
     * Static function to get JOI validation schema for Visit
     */
     static getJOIValidationSchema() {
        return {
            uuid: JOI.string(),  
            study_id: JOI.string(), 
            matrix_id: JOI.string(), 
            subject: JOI.string(), 
            scrn: JOI.string(), 
            visit1: JOI.string(), 
            cm: JOI.string(), 
            ae: JOI.string(), 
            version: JOI.string(), 
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
        let error = JOI.validate(this, Visit.getJOIValidationSchema());
        return (error && error.error) ? error.error : null;
    }

    
    
    /**
     * Static function to get Visit data from HttpRequest object
     * @param reqObj Any
     * @param updateableFields Boolean OPTIONAL DEFAULT = false, if true get only properties to be updated
     * @returns Visit | null
     */
     static getVisitFromRequestObj(reqObj, updateableFields = false) {
        if (!reqObj) return null;
        if (!updateableFields) {
            const visit = new Visit(
                reqObj.uuid, 
                reqObj.study_id,
                reqObj.matrix_id || 'null', 
                reqObj.subject || 'null', 
                reqObj.scrn || 'null', 
                reqObj.visit1 || 'null', 
                reqObj.cm || 'null', 
                reqObj.ae || 'null',
                reqObj.version || 'null', 
                reqObj.isActive || true,
                reqObj.created || new Date(), 
                reqObj.lastUpdated || new Date()
            );
            return visit;
        }
        const dtdtr = {};
        if (reqObj.subject) dtdtr.subject = reqObj.subject;
        if (reqObj.scrn) dtdtr.scrn = reqObj.scrn;
        if (reqObj.visit1) dtdtr.visit1 = reqObj.visit1;
        if (reqObj.cm) dtdtr.cm = reqObj.cm;
        if (reqObj.ae) dtdtr.ae = reqObj.ae;
        if (reqObj.version) dtdtr.version = reqObj.version;
        if (reqObj.isActive !== undefined && reqObj.isActive !== null) dtdtr.isActive = reqObj.isActive;
        dtdtr.lastUpdated = new Date();
        return dtdtr;
    }
}

module.exports = Visit;