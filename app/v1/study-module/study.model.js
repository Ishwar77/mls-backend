const JOI = require("../../utils/JOI");
/**
 * A study has uuid, sponsor_id, title, description, studyStatus, rawData, sampleFilePath
 * created, lastUpdated, isActive, version, docPath, signature properties
 */
class Study {
    /**
     * To create a Study instance
     * @param uuid String, Unique ID provided to each Study
     * @param sponsor_id string, Client ID provided to a study
     * @param title String, represents the title of this Study 
     * @param description String, contains the Description of the Study
     * @param version String
     * @param docPath String
     * @param signature String
     * @param studyStatus String
     * @param rawData String
     * @param sampleFilePath String
     * @param isActive Boolean, represents weather the user is active / closed the account
     * @param created Date, Represents the Created Date
     * @param lastUpdated Date, Represents the Last Updated Date
     */
    constructor( uuid, sponsor_id, title, description, 
        version, docPath, signature, studyStatus, rawData, sampleFilePath,
        isActive = true, created = new Date(), lastUpdated = new Date()) {
        this.uuid = uuid;
        this.sponsor_id = sponsor_id;
        this.title = title;
        this.description = description;
        this.version = version;
        this.docPath = docPath;
        this.signature = signature;
        this.studyStatus = studyStatus;
        this.rawData = rawData;
        this.sampleFilePath = sampleFilePath;
        this.isActive = isActive;
        this.created = created;
        this.lastUpdated = lastUpdated;
    }

    /**
     * Static function to get JOI validation schema for Study
     */
    static getJOIValidationSchema() {
        return {
            uuid: JOI.string(), 
            sponsor_id: JOI.string(), 
            title: JOI.string().min(3).max(50).required(), 
            description: JOI.string(), 
            version: JOI.string(), 
            docPath: JOI.string(), 
            signature: JOI.string(),
            studyStatus: JOI.string(),
            rawData: JOI.string(),
            sampleFilePath: JOI.string(),
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
        let error = JOI.validate(this, Study.getJOIValidationSchema());
        return (error && error.error) ? error.error : null;
    }


    /**
     * Static function to get Study data from HttpRequest object
     * @param reqObj Any
     * @param updateableFields Boolean OPTIONAL DEFAULT = false, if true get only properties to be updated
     * @returns Study | null
     */
    static getStudyFromRequestObj(reqObj, updateableFields = false) {
        if (!reqObj) return null;
        if (!updateableFields) {
            const study = new Study(
                reqObj.uuid, 
                reqObj.sponsor_id, 
                reqObj.title, 
                reqObj.description || 'null', 
                reqObj.version || 'null', 
                reqObj.docPath || 'null', 
                reqObj.signature || 'null',
                reqObj.studyStatus || 'null',
                reqObj.rawData || 'null',
                reqObj.sampleFilePath || 'null',
                reqObj.isActive || true,
                reqObj.created || new Date(), 
                reqObj.lastUpdated || new Date()
            );
            return study;
        }
        const stdy = {};
        if (reqObj.title) stdy.title = reqObj.title;
        if (reqObj.description) stdy.description = reqObj.description;
        if (reqObj.version) stdy.version = reqObj.version;
        if (reqObj.docPath) stdy.docPath = reqObj.docPath;
        if (reqObj.studyStatus) stdy.studyStatus = reqObj.studyStatus;
        if (reqObj.rawData) stdy.rawData = reqObj.rawData;
        if (reqObj.sampleFilePath) stdy.sampleFilePath = reqObj.sampleFilePath;
        if (reqObj.isActive !== undefined && reqObj.isActive !== null) stdy.isActive = reqObj.isActive;
        stdy.lastUpdated = new Date();
        return stdy;
    }
}

module.exports = Study;
