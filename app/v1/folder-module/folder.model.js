const JOI = require("../../utils/JOI");
/**
 * A Folder has uuid, study_id, oid, ordinal, folderName, 
 * parentFolderOID, isReusable, version, isActive, created, lastUpdated properties
 */

 class Folder {
    /**
     * To create a Folder instance
     * @param uuid String, Unique ID provided to each Folder
     * @param study_id string, study_id ID provided to a Folder
     * @param oid String, represents the title of this Folder 
     * @param ordinal String, contains the Description of the Folder
     * @param folderName Integer, Property to delete Existing Folder
     * @param parentFolderOID String, Name of the Project
     * @param isReusable String, Type of the project
     * @param version String
     * @param isActive Boolean, represents weather the user is active / closed the account
     * @param created Date, Represents the Created Date
     * @param lastUpdated Date, Represents the Last Updated Date
     */

     constructor( uuid, study_id, oid, ordinal, folderName, parentFolderOID, isReusable, version,
        isActive = true, created = new Date(), lastUpdated = new Date()) {
        this.uuid = uuid;
        this.study_id = study_id;
        this.oid = oid;
        this.ordinal = ordinal;
        this.folderName = folderName;
        this.parentFolderOID = parentFolderOID;
        this.isReusable = isReusable;
        this.version = version;
        this.isActive = isActive;
        this.created = created;
        this.lastUpdated = lastUpdated;
    }

    
    /**
     * Static function to get JOI validation schema for Folder
     */
     static getJOIValidationSchema() {
        return {
            uuid: JOI.string(),  
            study_id: JOI.string(), 
            oid: JOI.string(), 
            ordinal: JOI.string(), 
            folderName: JOI.string(), 
            parentFolderOID: JOI.string(), 
            isReusable: JOI.string(),
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
            let error = JOI.validate(this, Folder.getJOIValidationSchema());
            return (error && error.error) ? error.error : null;
        }


        
    /**
     * Static function to get Folder data from HttpRequest object
     * @param reqObj Any
     * @param updateableFields Boolean OPTIONAL DEFAULT = false, if true get only properties to be updated
     * @returns Folder | null
     */
    static getFolderFromRequestObj(reqObj, updateableFields = false) {
        if (!reqObj) return null;
        if (!updateableFields) {
            const folder = new Folder(
                reqObj.uuid, 
                reqObj.study_id,
                reqObj.oid, 
                reqObj.ordinal || 'null',
                reqObj.folderName || 'null', 
                reqObj.parentFolderOID || 'null', 
                reqObj.isReusable || 'null',
                reqObj.version || 'null', 
                reqObj.isActive || true,
                reqObj.created || new Date(), 
                reqObj.lastUpdated || new Date()
            );
            return folder;
        }
        const fldr = {};
        if (reqObj.oid) fldr.oid = reqObj.oid;
        if (reqObj.ordinal) fldr.ordinal = reqObj.ordinal;
        if (reqObj.folderName) fldr.folderName = reqObj.folderName;
        if (reqObj.parentFolderOID) fldr.parentFolderOID = reqObj.parentFolderOID;
        if (reqObj.isReusable) fldr.isReusable = reqObj.isReusable;
        if (reqObj.version) fldr.version = reqObj.version;
        if (reqObj.isActive !== undefined && reqObj.isActive !== null) fldr.isActive = reqObj.isActive;
        fldr.lastUpdated = new Date();
        return fldr;
    }
 }

 module.exports = Folder;