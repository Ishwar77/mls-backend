const JOI = require("../../utils/JOI");
/**
 * A SDTM-Mapping has uuid, study_id, study_version, entityType, columnNames, mapped_data, creating_user_id, status, 
 * comment, commenting_user_id, version, created, lastUpdated, isActive properties
 */

 class SdtmMapping {  
    /**
     * To create a SDTM-Mapping instance
     * @param uuid String, Unique ID provided to each SDTM-Mapping
     * @param study_id string, study_id ID provided to a SDTM-Mapping
     * @param study_version String
     * @param entityType String
     * @param columnNames Number
     * @param mapped_data String
     * @param creating_user_id String
     * @param status String
     * @param comment String
     * @param commenting_user_id String
     * @param version String
     * @param isActive Boolean, represents weather the user is active / closed the account
     * @param created Date, Represents the Created Date
     * @param lastUpdated Date, Represents the Last Updated Date
     */
     constructor( uuid, study_id, study_version, entityType, columnNames, mapped_data, 
        creating_user_id, status, comment, commenting_user_id,
        version, isActive = true, created = new Date(), lastUpdated = new Date()) {
        this.uuid = uuid;
        this.study_id = study_id;
        this.study_version = study_version;
        this.entityType = entityType;
        this.columnNames = columnNames;
        this.mapped_data = mapped_data;
        this.creating_user_id = creating_user_id;
        this.status = status;
        this.comment = comment;
        this.commenting_user_id = commenting_user_id;
        this.version = version;
        this.isActive = isActive;
        this.created = created;
        this.lastUpdated = lastUpdated;
    }

        /**
     * Static function to get JOI validation schema for SDTM-Mapping
     */
         static getJOIValidationSchema() {
            return {
                uuid: JOI.string(),  
                study_id: JOI.string(), 
                study_version: JOI.string(), 
                entityType: JOI.string(), 
                columnNames: JOI.string(), 
                mapped_data: JOI.string(), 
                creating_user_id: JOI.string(), 
                status: JOI.string(), 
                comment: JOI.string(), 
                commenting_user_id: JOI.string(), 
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
        let error = JOI.validate(this, SdtmMapping.getJOIValidationSchema());
        return (error && error.error) ? error.error : null;
    }

    
    /**
     * Static function to get SDTM-Mapping data from HttpRequest object
     * @param reqObj Any
     * @param updateableFields Boolean OPTIONAL DEFAULT = false, if true get only properties to be updated
     * @returns SDTM-Mapping | null
     */
     static getSDTMMappingFromRequestObj(reqObj, updateableFields = false) {
        if (!reqObj) return null;
        if (!updateableFields) {
            const sdtmmapping = new SdtmMapping(
                reqObj.uuid, 
                reqObj.study_id,
                reqObj.study_version || 'null', 
                reqObj.entityType || 'null', 
                reqObj.columnNames || 'null', 
                reqObj.mapped_data || 'null', 
                reqObj.creating_user_id || 'null', 
                reqObj.status || 'null',
                reqObj.comment || 'null',
                reqObj.commenting_user_id || 'null',
                reqObj.version || 'null', 
                reqObj.isActive || true,
                reqObj.created || new Date(), 
                reqObj.lastUpdated || new Date()
            );
            return sdtmmapping;
        }
        const sdtm = {};
        if (reqObj.study_version) sdtm.study_version = reqObj.study_version;
        if (reqObj.entityType) sdtm.entityType = reqObj.entityType;
        if (reqObj.columnNames) sdtm.columnNames = reqObj.columnNames;
        if (reqObj.mapped_data) sdtm.mapped_data = reqObj.mapped_data;
        if (reqObj.creating_user_id) sdtm.creating_user_id = reqObj.creating_user_id;
        if (reqObj.status) sdtm.status = reqObj.status;
        if (reqObj.comment) sdtm.comment = reqObj.comment;
        if (reqObj.commenting_user_id) sdtm.commenting_user_id = reqObj.commenting_user_id;
        if (reqObj.version) sdtm.version = reqObj.version;
        if (reqObj.isActive !== undefined && reqObj.isActive !== null) sdtm.isActive = reqObj.isActive;
        sdtm.lastUpdated = new Date();
        return sdtm;
    }
 }

module.exports = SdtmMapping;