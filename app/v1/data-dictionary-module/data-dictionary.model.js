const JOI = require("../../utils/JOI");
/**
 * A DataDictionary has uuid, study_id, dataDictionaryName, codedData, 
 * ordinal, userDataString, specify, version, isActive, created, lastUpdated properties
 */

 class DataDictionary {
    /**
     * To create a DataDictionary instance
     * @param uuid String, Unique ID provided to each DataDictionary
     * @param study_id string, study_id ID provided to a DataDictionary
     * @param dataDictionaryName String, represents the title of this DataDictionary 
     * @param codedData String
     * @param ordinal Number
     * @param userDataString String
     * @param specify String
     * @param version String
     * @param isActive Boolean, represents weather the user is active / closed the account
     * @param created Date, Represents the Created Date
     * @param lastUpdated Date, Represents the Last Updated Date
     */

     constructor( uuid, study_id, dataDictionaryName, codedData, ordinal, 
        userDataString, specify, version,
        isActive = true, created = new Date(), lastUpdated = new Date()) {
        this.uuid = uuid;
        this.study_id = study_id;
        this.dataDictionaryName = dataDictionaryName;
        this.codedData = codedData;
        this.ordinal = ordinal;
        this.userDataString = userDataString;
        this.specify = specify;
        this.version = version;
        this.isActive = isActive;
        this.created = created;
        this.lastUpdated = lastUpdated;
    }

    
    /**
     * Static function to get JOI validation schema for DataDictionary
     */
     static getJOIValidationSchema() {
        return {
            uuid: JOI.string(),  
            study_id: JOI.string(), 
            dataDictionaryName: JOI.string(), 
            codedData: JOI.string(), 
            ordinal: JOI.string(), 
            userDataString: JOI.string(), 
            specify: JOI.string(),
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
        let error = JOI.validate(this, DataDictionary.getJOIValidationSchema());
        return (error && error.error) ? error.error : null;
    }
    

    /**
     * Static function to get DataDictionary data from HttpRequest object
     * @param reqObj Any
     * @param updateableFields Boolean OPTIONAL DEFAULT = false, if true get only properties to be updated
     * @returns DataDictionary | null
     */
     static getDataDictionaryFromRequestObj(reqObj, updateableFields = false) {
        if (!reqObj) return null;
        if (!updateableFields) {
            const dataDictionary = new DataDictionary(
                reqObj.uuid, 
                reqObj.study_id,
                reqObj.dataDictionaryName || 'null', 
                reqObj.codedData || 'null', 
                reqObj.ordinal || 'null', 
                reqObj.userDataString || 'null', 
                reqObj.specify || 'null',
                reqObj.version || 'null', 
                reqObj.isActive || true,
                reqObj.created || new Date(), 
                reqObj.lastUpdated || new Date()
            );
            return dataDictionary;
        }
        const dtdtr = {};
        if (reqObj.dataDictionaryName) dtdtr.dataDictionaryName = reqObj.dataDictionaryName;
        if (reqObj.codedData) dtdtr.codedData = reqObj.codedData;
        if (reqObj.ordinal) dtdtr.ordinal = reqObj.ordinal;
        if (reqObj.userDataString) dtdtr.userDataString = reqObj.userDataString;
        if (reqObj.specify) dtdtr.specify = reqObj.specify;
        if (reqObj.version) dtdtr.version = reqObj.version;
        if (reqObj.isActive !== undefined && reqObj.isActive !== null) dtdtr.isActive = reqObj.isActive;
        dtdtr.lastUpdated = new Date();
        return dtdtr;
    }
  }

  module.exports = DataDictionary;