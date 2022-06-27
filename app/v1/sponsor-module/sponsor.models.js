const JOI = require("../../utils/JOI");
/**
 * A sponsor has uuid, name, description, isActive, created, lastUpdated properties
 */
class Sponsor {
    /**
     * To create a Sponsor instance
     * @param uuid String, Unique ID provided to each sponsor
     * @param name String, represents the name of this Sponsor 
     * @param description String, contains the Description of the Sponsor
     * @param isActive Boolean, represents weather the user is active / closed the account
     * @param created Date, Represents the Created Date
     * @param lastUpdated Date, Represents the Last Updated Date
     */
    constructor(uuid, name, description, isActive = true, created = new Date(), lastUpdated = new Date()) {
        this.uuid = uuid;
        this.name = name;
        this.description = description;
        this.isActive = isActive;
        this.created = created;
        this.lastUpdated = lastUpdated;
    }

    /**
     * Static function to get JOI validation schema for Sponsor
     */
    static getJOIValidationSchema() {
        return {
            uuid: JOI.string(),
            name: JOI.string().min(3).max(50).required(),
            description: JOI.string(),
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
        let error = JOI.validate(this, Sponsor.getJOIValidationSchema());
        return (error && error.error) ? error.error : null;
    }


    /**
     * Static function to get Sponsor data from HttpRequest object
     * @param reqObj Any
     * @param updateableFields Boolean OPTIONAL DEFAULT = false, if true get only properties to be updated
     * @returns Sponsor | null
     */
    static getSponsorFromRequestObj(reqObj, updateableFields = false) {
        if (!reqObj) return null;
        if (!updateableFields) {
            const sponsor = new Sponsor(
                reqObj.uuid,
                reqObj.name,
                reqObj.description || 'null',
                reqObj.isActive || true,
                reqObj.created || new Date(),
                reqObj.lastUpdated || new Date());
            return sponsor;
        }
        const spnsr = {};
        if (reqObj.name) spnsr.name = reqObj.name;
        if (reqObj.description) spnsr.description = reqObj.description;
        if (reqObj.isActive !== undefined && reqObj.isActive !== null) spnsr.isActive = reqObj.isActive;
        spnsr.lastUpdated = new Date();
        return spnsr;
    }
}

module.exports = Sponsor;
