const JOI = require("../../utils/JOI");
/**
 * A ALS-Staging has uuid, study_UUID, version, entityType, columns, creating_user_uuid, status, 
 * created, lastUpdated, isActive properties
 */
class AlsStaging {
    /**
     * To create a AlsStaging instance
     * @param uuid String, Unique ID provided to each AlsStaging
     * @param study_UUID string, Study ID provided to a AlsStaging
     * @param version String, represents the Version 
     * @param entityType String, represents the Entity Type
     * @param columns String, represents the Columns
     * @param creating_user_uuid String,
     * @param status String, Status of the project
     * @param isActive Boolean, represents weather the user is active / closed the account
     * @param created Date, Represents the Created Date
     * @param lastUpdated Date, Represents the Last Updated Date
     */

     constructor( uuid, study_UUID, version, entityType, columns, creating_user_uuid, status, 
        created = new Date(), lastUpdated = new Date(), isActive = true) {
        this.uuid = uuid;
        this.study_UUID = study_UUID;
        this.version = version;
        this.entityType = entityType;
        this.columns = columns;
        this.creating_user_uuid = creating_user_uuid;
        this.status = status;
        this.isActive = isActive;
        this.created = created;
        this.lastUpdated = lastUpdated;
    }

        /**
     * Static function to get JOI validation schema for AlsStaging
     */
         static getJOIValidationSchema() {
            return {
                uuid: JOI.string(), 
                study_UUID: JOI.string(), 
                version: JOI.string(), 
                entityType: JOI.string(), 
                columns: JOI.string(), 
                creating_user_uuid: JOI.string(), 
                status: JOI.string(),
                created: JOI.any().default(new Date()), 
                lastUpdated: JOI.any().default(new Date()), 
                isActive: JOI.any().default(true)
            };
        }


            /**
     * Verifies the instance value and if invalid state, retuns error object, if valied returns null
     * @returns any | null
     */
    hasError() {
        let error = JOI.validate(this, AlsStaging.getJOIValidationSchema());
        return (error && error.error) ? error.error : null;
    }


        /**
     * Static function to get AlsStaging data from HttpRequest object
     * @param reqObj Any
     * @param updateableFields Boolean OPTIONAL DEFAULT = false, if true get only properties to be updated
     * @returns AlsStaging | null
     */
         static getAlsStagingFromRequestObj(reqObj, updateableFields = false) {
            if (!reqObj) return null;
            if (!updateableFields) {
                const alsstaging = new AlsStaging(
                    reqObj.uuid, 
                    reqObj.study_UUID, 
                    reqObj.version || 'null', 
                    reqObj.entityType || 'null', 
                    reqObj.columns || 'null', 
                    reqObj.creating_user_uuid || 'null', 
                    reqObj.status || 'null', 
                    reqObj.created || new Date(), 
                    reqObj.lastUpdated || new Date(), 
                    reqObj.isActive || true
                );
                return alsstaging;
            }
            const alstgng = {};
            if (reqObj.study_UUID) alstgng.study_UUID = reqObj.study_UUID;
            if (reqObj.version) alstgng.version = reqObj.version;
            if (reqObj.entityType) alstgng.entityType = reqObj.entityType;
            if (reqObj.columns) alstgng.columns = reqObj.columns;
            if (reqObj.creating_user_uuid) alstgng.creating_user_uuid = reqObj.creating_user_uuid;
            if (reqObj.status) alstgng.status = reqObj.status;
            if (reqObj.isActive !== undefined && reqObj.isActive !== null) alstgng.isActive = reqObj.isActive;
            alstgng.lastUpdated = new Date();
            return alstgng;
        }
}

module.exports = AlsStaging;