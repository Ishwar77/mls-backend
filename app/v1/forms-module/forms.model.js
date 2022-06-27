const JOI = require("../../utils/JOI");
/**
 * A Form has uuid, study_id, oid, ordinal, draftFormName, draftFormActive, isTemplate, 
 * isSignatureRequired, viewRestrictions, entryRestrictions, logDirection, 
 * version, isActive, created, lastUpdated properties
 */


 class Form { 
    /**
     * To create a Form instance
     * @param uuid String, Unique ID provided to each Form
     * @param study_id string, study_id ID provided to a Form
     * @param oid String
     * @param ordinal String
     * @param draftFormName Number
     * @param draftFormActive String
     * @param isTemplate String
     * @param isSignatureRequired String
     * @param viewRestrictions String
     * @param entryRestrictions String
     * @param logDirection String
     * @param version String
     * @param isActive Boolean, represents weather the user is active / closed the account
     * @param created Date, Represents the Created Date
     * @param lastUpdated Date, Represents the Last Updated Date
     * @param matrixdata Matrix Data on linking folder forms
     */
    
     constructor( uuid, study_id, oid, ordinal, draftFormName, draftFormActive, isTemplate, 
        isSignatureRequired, viewRestrictions, entryRestrictions, logDirection, 
        version, isActive = true, created = new Date(), lastUpdated = new Date(),matrixdata) {
        this.uuid = uuid;
        this.study_id = study_id;
        this.oid = oid;
        this.ordinal = ordinal;
        this.draftFormName = draftFormName;
        this.draftFormActive = draftFormActive;
        this.isTemplate = isTemplate;
        this.isSignatureRequired = isSignatureRequired;
        this.viewRestrictions = viewRestrictions;
        this.entryRestrictions = entryRestrictions;
        this.logDirection = logDirection;
        this.version = version;
        this.isActive = isActive;
        this.created = created;
        this.lastUpdated = lastUpdated;
        this.matrixdata = matrixdata;
    }

                
    /**
     * Static function to get JOI validation schema for Form
     */
     static getJOIValidationSchema() {
        return {
            uuid: JOI.string(),  
            study_id: JOI.string(), 
            oid: JOI.string(), 
            ordinal: JOI.string(), 
            draftFormName: JOI.string(), 
            draftFormActive: JOI.string(), 
            isTemplate: JOI.string(), 
            isSignatureRequired: JOI.string(), 
            viewRestrictions: JOI.string(),
            entryRestrictions: JOI.string(),
            logDirection: JOI.string(),
            version: JOI.string(), 
            isActive: JOI.any().default(true),
            created: JOI.any().default(new Date()), 
            lastUpdated: JOI.any().default(new Date()),
            matrixdata: JOI.string()
        };
    }

                
    /**
     * Verifies the instance value and if invalid state, retuns error object, if valied returns null
     * @returns any | null
     */
     hasError() {
        let error = JOI.validate(this, Form.getJOIValidationSchema());
        return (error && error.error) ? error.error : null;
    }

        
    
    /**
     * Static function to get Form data from HttpRequest object
     * @param reqObj Any
     * @param updateableFields Boolean OPTIONAL DEFAULT = false, if true get only properties to be updated
     * @returns Form | null
     */
     static getFormFromRequestObj(reqObj, updateableFields = false) {
        if (!reqObj) return null;
        if (!updateableFields) {
            const form = new Form(
                reqObj.uuid, 
                reqObj.study_id,
                reqObj.oid || 'null', 
                reqObj.ordinal || 'null', 
                reqObj.draftFormName || 'null', 
                reqObj.draftFormActive || 'null', 
                reqObj.isTemplate || 'null', 
                reqObj.isSignatureRequired || 'null',
                reqObj.viewRestrictions || 'null', 
                reqObj.entryRestrictions || 'null', 
                reqObj.logDirection || 'null',
                reqObj.version || 'null', 
                reqObj.isActive || true,
                reqObj.created || new Date(), 
                reqObj.lastUpdated || new Date(),
                reqObj.matrixdata || 'null'
            );
            return form;
        }
        const dtdtr = {};
        if (reqObj.oid) dtdtr.oid = reqObj.oid;
        if (reqObj.ordinal) dtdtr.ordinal = reqObj.ordinal;
        if (reqObj.draftFormName) dtdtr.draftFormName = reqObj.draftFormName;
        if (reqObj.draftFormActive) dtdtr.draftFormActive = reqObj.draftFormActive;
        if (reqObj.isTemplate) dtdtr.isTemplate = reqObj.isTemplate;
        if (reqObj.isSignatureRequired) dtdtr.isSignatureRequired = reqObj.isSignatureRequired;
        if (reqObj.viewRestrictions) dtdtr.viewRestrictions = reqObj.viewRestrictions;
        if (reqObj.entryRestrictions) dtdtr.entryRestrictions = reqObj.entryRestrictions;
        if (reqObj.logDirection) dtdtr.logDirection = reqObj.logDirection;
        if (reqObj.version) dtdtr.version = reqObj.version;
        if (reqObj.isActive !== undefined && reqObj.isActive !== null) dtdtr.isActive = reqObj.isActive;
        dtdtr.lastUpdated = new Date();
        if (reqObj.matrixdata) dtdtr.matrixdata = reqObj.matrixdata;
        return dtdtr;
    }
 }
 
module.exports = Form;