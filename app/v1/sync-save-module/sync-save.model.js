const JOI = require("../../utils/JOI");
/**
 * A Saving Synched Data has studyId, sheetName, data, created, lastUpdated, isActive, version, properties
 */

 class SyncSave {
    /**
     * To create a Saving Synched Data instance
     * @param studyId String
     * @param sheetName string
     * @param data String
     * @param version String
     * @param isActive Boolean, represents weather the user is active / closed the account
     * @param created Date, Represents the Created Date
     * @param lastUpdated Date, Represents the Last Updated Date
     */
     constructor( studyId, sheetName, data, version,
        isActive = true, created = new Date(), lastUpdated = new Date()) {
        this.studyId = studyId;
        this.sheetName = sheetName;
        this.data = data;
        this.version = version;
        this.isActive = isActive;
        this.created = created;
        this.lastUpdated = lastUpdated;
    }

        /**
     * Static function to get JOI validation schema for Saving Synched Data
     */
         static getJOIValidationSchema() {
            return {
                studyId: JOI.string(), 
                sheetName: JOI.string(), 
                data: JOI.string(), 
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
        let error = JOI.validate(this, SyncSave.getJOIValidationSchema());
        return (error && error.error) ? error.error : null;
    }

        /**
     * Static function to get Saving Synched Data data from HttpRequest object
     * @param reqObj Any
     * @param updateableFields Boolean OPTIONAL DEFAULT = false, if true get only properties to be updated
     * @returns Saving Synched Data | null
     */
         static getSyncSaveFromRequestObj(reqObj, updateableFields = false) {
            if (!reqObj) return null;
            if (!updateableFields) {
                const syncsave = new SyncSave(
                    reqObj.studyId, 
                    reqObj.sheetName, 
                    reqObj.data, 
                    reqObj.version, 
                    reqObj.isActive || true,
                    reqObj.created || new Date(), 
                    reqObj.lastUpdated || new Date()
                );
                return syncsave;
            }
            const stdy = {};
            if (reqObj.sheetName) stdy.sheetName = reqObj.sheetName;
            if (reqObj.data) stdy.data = reqObj.data;
            if (reqObj.version) stdy.version = reqObj.version;
            if (reqObj.isActive !== undefined && reqObj.isActive !== null) stdy.isActive = reqObj.isActive;
            stdy.lastUpdated = new Date();
            return stdy;
        }
 }
 
module.exports = SyncSave;