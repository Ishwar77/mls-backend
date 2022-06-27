const JOI = require("../../utils/JOI");
/**
 * A ALS-Staging has uuid, STUDYID, SITEID, SUBJECT_ID, eCRFV_VERSION, FormOID, FieldOID, 
 * dataDictionaryOID, VariableOID, Test_Condition, 
 * test_data, creating_user_uuid, description, test_status, Created_By, 
 * created, lastUpdated, isActive properties
 */

 class TestCasesv2 {
    /**
     * To create a TestCasesv2 instance
     * @param uuid String, Unique ID provided to each TestCasesv2
     * @param STUDYID string, Study ID provided to a TestCasesv2
     * @param SITEID string, Site ID assigned to a testCase
     * @param SUBJECT_ID String
     * @param eCRFV_VERSION string, Form Sequence
     * @param FormOID String
     * @param FieldOID String, represents the Version 
     * @param VariableOID String, represents Variable OID
     * @param dataDictionaryOID String
     * @param Test_Condition String, represents the Entity Type
     * @param test_data String, represents the entity_OID
     * @param creating_user_uuid String, represents the Test Data
     * @param description String,
     * @param Created_By String,
     * @param test_status String, Type of the project
     * @param isActive Boolean, represents weather the user is active / closed the account
     * @param created Date, Represents the Created Date
     * @param lastUpdated Date, Represents the Last Updated Date
     */
     constructor( uuid, STUDYID, SITEID, eCRFV_VERSION, FormOID, FieldOID, test_data,
        dataDictionaryOID, creating_user_uuid, description, test_status, SUBJECT_ID, Created_By,
        VariableOID, Test_Condition, created = new Date(), lastUpdated = new Date(), isActive = true) {
        this.uuid = uuid;
        this.STUDYID = STUDYID;
        this.SITEID = SITEID;
        this.SUBJECT_ID = SUBJECT_ID;
        this.eCRFV_VERSION = eCRFV_VERSION;
        this.FormOID = FormOID;
        this.FieldOID = FieldOID;
        this.VariableOID = VariableOID;
        this.dataDictionaryOID = dataDictionaryOID;
        this.Test_Condition = Test_Condition;
        this.test_data = test_data;
        this.creating_user_uuid = creating_user_uuid;
        this.description = description;
        this.Created_By = Created_By;
        this.test_status = test_status;
        this.isActive = isActive;
        this.created = created;
        this.lastUpdated = lastUpdated;
    }
        /**
     * Static function to get JOI validation schema for TestCasesv2
     */
         static getJOIValidationSchema() {
            return {
                uuid: JOI.string(), 
                STUDYID: JOI.string(),
                SITEID: JOI.string(),
                SUBJECT_ID: JOI.string(),
                eCRFV_VERSION: JOI.string(),
                FormOID: JOI.string(),
                FieldOID: JOI.string(), 
                VariableOID: JOI.string(),
                dataDictionaryOID: JOI.string(),
                Test_Condition: JOI.string(),
                test_data: JOI.string(),
                creating_user_uuid: JOI.string(), 
                description: JOI.string(), 
                test_status: JOI.string(),
                Created_By: JOI.string(), 
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
        let error = JOI.validate(this, TestCasesv2.getJOIValidationSchema());
        return (error && error.error) ? error.error : null;
    }


            /**
     * Static function to get TestCasesv2 data from HttpRequest object
     * @param reqObj Any
     * @param updateableFields Boolean OPTIONAL DEFAULT = false, if true get only properties to be updated
     * @returns TestCasesv2 | null
     */
             static getTestCasesv2FromRequestObj(reqObj, updateableFields = false) {
                if (!reqObj) return null;
                if (!updateableFields) {
                    const testcasesv2 = new TestCasesv2(
                        reqObj.uuid, 
                        reqObj.STUDYID, 
                        reqObj.SITEID || 'null',
                        reqObj.SUBJECT_ID || 'null',
                        reqObj.eCRFV_VERSION || 'null',
                        reqObj.FormOID || 'null',
                        reqObj.FieldOID || 'null', 
                        reqObj.VariableOID || 'null',
                        reqObj.dataDictionaryOID || 'null',
                        reqObj.Test_Condition || 'null', 
                        reqObj.test_data || 'null',
                        reqObj.creating_user_uuid || 'null',
                        reqObj.description || 'null', 
                        reqObj.test_status || 'null', 
                        reqObj.Created_By || 'null',
                        reqObj.created || new Date(), 
                        reqObj.lastUpdated || new Date(), 
                        reqObj.isActive || true
                    );
                    return testcasesv2;
                }
                const tstcse = {};
                if (reqObj.STUDYID) tstcse.STUDYID = reqObj.STUDYID;
                if (reqObj.SITEID) tstcse.SITEID = reqObj.SITEID;
                if (reqObj.SUBJECT_ID) tstcse.SUBJECT_ID = reqObj.SUBJECT_ID;
                if (reqObj.eCRFV_VERSION) tstcse.eCRFV_VERSION = reqObj.eCRFV_VERSION;
                if (reqObj.FormOID) tstcse.FormOID = reqObj.FormOID;
                if (reqObj.FieldOID) tstcse.FieldOID = reqObj.FieldOID;
                if (reqObj.VariableOID) tstcse.VariableOID = reqObj.VariableOID;
                if (reqObj.dataDictionaryOID) tstcse.dataDictionaryOID = reqObj.dataDictionaryOID;
                if (reqObj.Test_Condition) tstcse.Test_Condition = reqObj.Test_Condition;
                if (reqObj.test_data) tstcse.test_data = reqObj.test_data;
                if (reqObj.creating_user_uuid) tstcse.creating_user_uuid = reqObj.creating_user_uuid;
                if (reqObj.description) tstcse.description = reqObj.description;
                if (reqObj.test_status) tstcse.test_status = reqObj.test_status;
                if (reqObj.isActive !== undefined && reqObj.isActive !== null) tstcse.isActive = reqObj.isActive;
                tstcse.lastUpdated = new Date();
                return tstcse;
            }
  }

  module.exports = TestCasesv2;