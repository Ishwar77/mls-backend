const JOI = require("../../utils/JOI");
/**
 * A Field has uuid, study_id, formOID, fieldOID, ordinal, draftFieldName, draftFieldActive, 
 * variableOID, dataFormat, dataDictionaryName, unitDictionaryName, codingDictionary, 
 * controlType, preText, fixedUnit, sourceDocument, isLog, defaultValue, sasLable, 
 * isRequired, queryFutureDate, isVisible, analyteName, isClinicalSignificance, 
 * queryNonConformance, doesNotBreakSignature, viewRstrictions, entryRestrictions, reviewGroups, 
 * version, isActive, created, lastUpdated properties
 */
 class Field { 
    /**
     * To create a Field instance
     * @param uuid String, Unique ID provided to each Field
     * @param study_id string, study_id ID provided to a Field
     * @param formOID String
     * @param fieldOID String
     * @param ordinal Number
     * @param draftFieldName String
     * @param draftFieldActive String
     * @param variableOID String
     * @param dataFormat String
     * @param dataDictionaryName String
     * @param unitDictionaryName String
     * @param codingDictionary String
     * @param controlType String
     * @param preText String
     * @param fixedUnit String
     * @param sourceDocument String
     * @param isLog String
     * @param defaultValue String
     * @param sasLable String
     * @param isRequired String
     * @param queryFutureDate String
     * @param isVisible String
     * @param analyteName String
     * @param isClinicalSignificance String
     * @param queryNonConformance String
     * @param doesNotBreakSignature String
     * @param viewRstrictions String
     * @param entryRestrictions String
     * @param reviewGroups String
     * @param version String
     * @param isActive Boolean, represents weather the user is active / closed the account
     * @param created Date, Represents the Created Date
     * @param lastUpdated Date, Represents the Last Updated Date
     */

     constructor( uuid, study_id, formOID, fieldOID, ordinal, draftFieldName, draftFieldActive, 
        variableOID, dataFormat, dataDictionaryName, unitDictionaryName, codingDictionary, 
        controlType, preText, fixedUnit, sourceDocument, isLog, defaultValue, sasLable, 
        isRequired, queryFutureDate, isVisible, analyteName, isClinicalSignificance, 
        queryNonConformance, doesNotBreakSignature, viewRstrictions, entryRestrictions, reviewGroups,
        version, isActive = true, created = new Date(), lastUpdated = new Date()) {
        this.uuid = uuid;
        this.study_id = study_id;
        this.formOID = formOID;
        this.fieldOID = fieldOID;
        this.ordinal = ordinal;
        this.draftFieldName = draftFieldName;
        this.draftFieldActive = draftFieldActive;
        this.variableOID = variableOID;
        this.dataFormat = dataFormat;
        this.dataDictionaryName = dataDictionaryName;
        this.unitDictionaryName = unitDictionaryName;
        this.codingDictionary = codingDictionary;
        this.controlType = controlType;
        this.preText = preText;
        this.fixedUnit = fixedUnit;
        this.sourceDocument = sourceDocument;
        this.isLog = isLog;
        this.defaultValue = defaultValue;
        this.sasLable = sasLable;
        this.isRequired = isRequired;
        this.queryFutureDate = queryFutureDate;
        this.isVisible = isVisible;
        this.analyteName = analyteName;
        this.isClinicalSignificance = isClinicalSignificance;
        this.queryNonConformance = queryNonConformance;
        this.doesNotBreakSignature = doesNotBreakSignature;
        this.viewRstrictions = viewRstrictions;
        this.entryRestrictions = entryRestrictions;
        this.reviewGroups = reviewGroups; 
        this.version = version;
        this.isActive = isActive;
        this.created = created;
        this.lastUpdated = lastUpdated;
    }

                  
    /**
     * Static function to get JOI validation schema for Field
     */
     static getJOIValidationSchema() {
        return {
            uuid: JOI.string(),  
            study_id: JOI.string(), 
            formOID: JOI.string(), 
            fieldOID: JOI.string(), 
            ordinal: JOI.string(), 
            draftFieldName: JOI.string(), 
            draftFieldActive: JOI.string(), 
            variableOID: JOI.string(), 
            dataFormat: JOI.string(), 
            dataDictionaryName: JOI.string(), 
            unitDictionaryName: JOI.string(), 
            codingDictionary: JOI.string(), 
            controlType: JOI.string(), 
            preText: JOI.string(), 
            fixedUnit: JOI.string(), 
            sourceDocument: JOI.string(), 
            isLog: JOI.string(), 
            defaultValue: JOI.string(), 
            sasLable: JOI.string(), 
            isRequired: JOI.string(), 
            queryFutureDate: JOI.string(), 
            isVisible: JOI.string(), 
            analyteName: JOI.string(), 
            isClinicalSignificance: JOI.string(),
            queryNonConformance: JOI.string(), 
            doesNotBreakSignature: JOI.string(), 
            viewRstrictions: JOI.string(), 
            entryRestrictions: JOI.string(), 
            reviewGroups: JOI.string(),
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
        let error = JOI.validate(this, Field.getJOIValidationSchema());
        return (error && error.error) ? error.error : null;
    }

    /**
     * Static function to get Field data from HttpRequest object
     * @param reqObj Any
     * @param updateableFields Boolean OPTIONAL DEFAULT = false, if true get only properties to be updated
     * @returns Field | null
     */
     static getFieldFromRequestObj(reqObj, updateableFields = false) {
        if (!reqObj) return null;
        if (!updateableFields) {
            const field = new Field(
                reqObj.uuid, 
                reqObj.study_id,
                reqObj.formOID || 'null' ,
                reqObj.fieldOID || 'null' ,
                reqObj.ordinal || 'null', 
                reqObj.draftFieldName || 'null', 
                reqObj.draftFieldActive || 'null', 
                reqObj.variableOID || 'null', 
                reqObj.dataFormat || 'null', 
                reqObj.dataDictionaryName || 'null', 
                reqObj.unitDictionaryName || 'null', 
                reqObj.codingDictionary || 'null', 
                reqObj.controlType || 'null', 
                reqObj.preText || 'null', 
                reqObj.fixedUnit || 'null', 
                reqObj.sourceDocument || 'null', 
                reqObj.isLog || 'null', 
                reqObj.defaultValue || 'null', 
                reqObj.sasLable || 'null', 
                reqObj.isRequired || 'null', 
                reqObj.queryFutureDate || 'null', 
                reqObj.isVisible || 'null', 
                reqObj.analyteName || 'null', 
                reqObj.isClinicalSignificance || 'null',
                reqObj.queryNonConformance || 'null', 
                reqObj.doesNotBreakSignature || 'null', 
                reqObj.viewRstrictions || 'null', 
                reqObj.entryRestrictions || 'null', 
                reqObj.reviewGroups || 'null',
                reqObj.version || 'null', 
                reqObj.isActive || true,
                reqObj.created || new Date(), 
                reqObj.lastUpdated || new Date()
            );
            return field;
        }
        const fld = {};
        if (reqObj.formOID) fld.formOID = reqObj.formOID;
        if (reqObj.fieldOID) fld.fieldOID = reqObj.fieldOID;
        if (reqObj.ordinal) fld.ordinal = reqObj.ordinal;
        if (reqObj.draftFieldName) fld.draftFieldName = reqObj.draftFieldName;
        if (reqObj.draftFieldActive) fld.draftFieldActive = reqObj.draftFieldActive;
        if (reqObj.variableOID) fld.variableOID = reqObj.variableOID;
        if (reqObj.dataFormat) fld.dataFormat = reqObj.dataFormat;
        if (reqObj.dataDictionaryName) fld.dataDictionaryName = reqObj.dataDictionaryName;
        if (reqObj.unitDictionaryName) fld.unitDictionaryName = reqObj.unitDictionaryName;
        if (reqObj.codingDictionary) fld.codingDictionary = reqObj.codingDictionary;
        if (reqObj.controlType) fld.controlType = reqObj.controlType;
        if (reqObj.preText) fld.preText = reqObj.preText;
        if (reqObj.fixedUnit) fld.fixedUnit = reqObj.fixedUnit;
        if (reqObj.sourceDocument) fld.sourceDocument = reqObj.sourceDocument;
        if (reqObj.isLog) fld.isLog = reqObj.isLog;
        if (reqObj.defaultValue) fld.defaultValue = reqObj.defaultValue;
        if (reqObj.sasLable) fld.sasLable = reqObj.sasLable;
        if (reqObj.isRequired) fld.isRequired = reqObj.isRequired;
        if (reqObj.queryFutureDate) fld.queryFutureDate = reqObj.queryFutureDate;
        if (reqObj.isVisible) fld.isVisible = reqObj.isVisible;
        if (reqObj.analyteName) fld.analyteName = reqObj.analyteName;
        if (reqObj.isClinicalSignificance) fld.isClinicalSignificance = reqObj.isClinicalSignificance;
        if (reqObj.queryNonConformance) fld.queryNonConformance = reqObj.queryNonConformance;
        if (reqObj.doesNotBreakSignature) fld.doesNotBreakSignature = reqObj.doesNotBreakSignature;
        if (reqObj.viewRstrictions) fld.viewRstrictions = reqObj.viewRstrictions;
        if (reqObj.entryRestrictions) fld.entryRestrictions = reqObj.entryRestrictions;
        if (reqObj.reviewGroups) fld.reviewGroups = reqObj.reviewGroups;
        if (reqObj.version) fld.version = reqObj.version;
        if (reqObj.isActive !== undefined && reqObj.isActive !== null) fld.isActive = reqObj.isActive;
        fld.lastUpdated = new Date();
        return fld;
    }
}
 
module.exports = Field;