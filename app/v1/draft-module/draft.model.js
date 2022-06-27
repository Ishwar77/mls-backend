const JOI = require("../../utils/JOI");
/**
 * A Draft has uuid, study_id, draftName, description, deleteExisting, projectName, projectType, 
 * primaryFormOID, DefaultMatrixOID, confirmMessage, created, lastUpdated, isActive properties
 */
class Draft {
    /**
     * To create a Draft instance
     * @param uuid String, Unique ID provided to each Draft
     * @param study_id string, study_id ID provided to a Draft
     * @param draftName String, represents the title of this Draft 
     * @param description String, contains the Description of the Draft
     * @param deleteExisting Integer, Property to delete Existing Draft
     * @param projectName String, Name of the Project
     * @param projectType String, Type of the project
     * @param primaryFormOID String
     * @param DefaultMatrixOID String
     * @param confirmMessage String
     * @param version String
     * @param isActive Boolean, represents weather the user is active / closed the account
     * @param created Date, Represents the Created Date
     * @param lastUpdated Date, Represents the Last Updated Date
     */
    constructor( uuid, study_id, draftName, description, deleteExisting, projectName, projectType, 
        primaryFormOID, DefaultMatrixOID, confirmMessage, version,
        isActive = true, created = new Date(), lastUpdated = new Date()) {
        this.uuid = uuid;
        this.study_id = study_id;
        this.draftName = draftName;
        this.description = description;
        this.deleteExisting = deleteExisting;
        this.projectName = projectName;
        this.projectType = projectType;
        this.primaryFormOID = primaryFormOID;
        this.DefaultMatrixOID = DefaultMatrixOID;
        this.confirmMessage = confirmMessage;
        this.version = version;
        this.isActive = isActive;
        this.created = created;
        this.lastUpdated = lastUpdated;
    }

    /**
     * Static function to get JOI validation schema for Draft
     */
    static getJOIValidationSchema() {
        return {
            uuid: JOI.string(),  
            study_id: JOI.string(), 
            draftName: JOI.string(), 
            description: JOI.string(), 
            deleteExisting: JOI.string(), 
            projectName: JOI.string(), 
            projectType: JOI.string(),
            primaryFormOID: JOI.string(), 
            DefaultMatrixOID: JOI.string(), 
            confirmMessage: JOI.string(), 
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
        let error = JOI.validate(this, Draft.getJOIValidationSchema());
        return (error && error.error) ? error.error : null;
    }


    /**
     * Static function to get Draft data from HttpRequest object
     * @param reqObj Any
     * @param updateableFields Boolean OPTIONAL DEFAULT = false, if true get only properties to be updated
     * @returns Draft | null
     */
    static getDraftFromRequestObj(reqObj, updateableFields = false) {
        if (!reqObj) return null;
        if (!updateableFields) {
            const draft = new Draft(
                reqObj.uuid, 
                reqObj.study_id,
                reqObj.draftName || 'null', 
                reqObj.description || 'null', 
                reqObj.deleteExisting || 'null', 
                reqObj.projectName || 'null', 
                reqObj.projectType || 'null',
                reqObj.primaryFormOID || 'null', 
                reqObj.DefaultMatrixOID || 'null', 
                reqObj.confirmMessage || 'null', 
                reqObj.version || 'null', 
                reqObj.isActive || true,
                reqObj.created || new Date(), 
                reqObj.lastUpdated || new Date()
            );
            return draft;
        }
        const drft = {};
        if (reqObj.draftName) drft.draftName = reqObj.draftName;
        if (reqObj.description) drft.description = reqObj.description;
        if (reqObj.deleteExisting) drft.deleteExisting = reqObj.deleteExisting;
        if (reqObj.projectName) drft.projectName = reqObj.projectName;
        if (reqObj.projectType) drft.projectType = reqObj.projectType;
        if (reqObj.primaryFormOID) drft.primaryFormOID = reqObj.primaryFormOID;
        if (reqObj.DefaultMatrixOID) drft.DefaultMatrixOID = reqObj.DefaultMatrixOID;
        if (reqObj.confirmMessage) drft.confirmMessage = reqObj.confirmMessage;
        if (reqObj.version) drft.version = reqObj.version;
        if (reqObj.isActive !== undefined && reqObj.isActive !== null) drft.isActive = reqObj.isActive;
        drft.lastUpdated = new Date();
        return drft;
    }
}

module.exports = Draft;
