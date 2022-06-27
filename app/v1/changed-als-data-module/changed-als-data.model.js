const JOI = require("../../utils/JOI");
/**
 * A ChangedAlsData has uuid, study_id, entity, data, created, lastUpdated, isActive, version, signature properties
 */

class ChangedAlsData {
    /**
     * To create a ChangedAlsData instance
     * @param uuid String, Unique ID provided to each Study
     * @param study_id string, Study ID
     * @param entity String
     * @param data String
     * @param version String
     * @param signature String
     * @param isActive Boolean, represents weather the user is active / closed the account
     * @param created Date, Represents the Created Date
     * @param lastUpdated Date, Represents the Last Updated Date
     */
    constructor(uuid, study_id, entity, data, version, signature,
        isActive = true, created = new Date(), lastUpdated = new Date()) {
        this.uuid = uuid;
        this.study_id = study_id;
        this.entity = entity;
        this.data = data;
        this.version = version;
        this.signature = signature;
        this.isActive = isActive;
        this.created = created;
        this.lastUpdated = lastUpdated;
    }

    /**
 * Static function to get JOI validation schema for ChangedAlsData
 */
    static getJOIValidationSchema() {
        return {
            uuid: JOI.string(),
            study_id: JOI.string(),
            entity: JOI.string(),
            data: JOI.string(),
            version: JOI.string(),
            signature: JOI.string(),
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
        let error = JOI.validate(this, ChangedAlsData.getJOIValidationSchema());
        return (error && error.error) ? error.error : null;
    }

    /**
     * Static function to get ChangedAlsData data from HttpRequest object
     * @param reqObj Any
     * @param updateableFields Boolean OPTIONAL DEFAULT = false, if true get only properties to be updated
     * @returns ChangedAlsData | null
     */
    static getChangedAlsDataFromRequestObj(reqObj, updateableFields = false) {
        if (!reqObj) return null;
        if (!updateableFields) {
            const changedalsdata = new ChangedAlsData(
                reqObj.uuid,
                reqObj.study_id,
                reqObj.entity || 'null',
                reqObj.data || 'null',
                reqObj.version || 'null',
                reqObj.signature || 'null',
                reqObj.isActive || true,
                reqObj.created || new Date(),
                reqObj.lastUpdated || new Date()
            );
            return changedalsdata;
        }
        const chgdalsdt = {};
        if (reqObj.entity) chgdalsdt.entity = reqObj.entity;
        if (reqObj.data) chgdalsdt.data = reqObj.data;
        if (reqObj.version) chgdalsdt.version = reqObj.version;
        if (reqObj.isActive !== undefined && reqObj.isActive !== null) chgdalsdt.isActive = reqObj.isActive;
        chgdalsdt.lastUpdated = new Date();
        return chgdalsdt;
    }
}

module.exports = ChangedAlsData;