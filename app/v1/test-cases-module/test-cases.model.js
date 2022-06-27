const JOI = require("../../utils/JOI");
/**
 * A ALS-Staging has uuid, study_UUID, site_uuid, formSeq, epoch, version, entityType, entity_OID, test_data,
 * creating_user_uuid, description, expected_output, generated_output, test_status, 
 * created, lastUpdated, isActive properties
 */

 class TestCases {
    /**
     * To create a TestCases instance
     * @param uuid String, Unique ID provided to each TestCases
     * @param study_UUID string, Study ID provided to a TestCases
     * @param site_uuid string, Site ID assigned to a testCase
     * @param formSeq string, Form Sequence
     * @param epoch String
     * @param version String, represents the Version 
     * @param entityType String, represents the Entity Type
     * @param entity_OID String, represents the entity_OID
     * @param test_data String, represents the Test Data
     * @param creating_user_uuid String,
     * @param description String, Description of the Test Case
     * @param expected_output String, Expected Output
     * @param generated_output String, Generated Output
     * @param test_status String, Type of the project
     * @param isActive Boolean, represents weather the user is active / closed the account
     * @param created Date, Represents the Created Date
     * @param lastUpdated Date, Represents the Last Updated Date
     */
     constructor( uuid, study_UUID, site_uuid, formSeq, epoch, version, entityType, entity_OID, test_data,
        creating_user_uuid, description, expected_output, generated_output, test_status, 
        created = new Date(), lastUpdated = new Date(), isActive = true) {
        this.uuid = uuid;
        this.study_UUID = study_UUID;
        this.site_uuid = site_uuid;
        this.formSeq = formSeq;
        this.epoch = epoch;
        this.version = version;
        this.entityType = entityType;
        this.entity_OID = entity_OID;
        this.test_data = test_data;
        this.creating_user_uuid = creating_user_uuid;
        this.description = description;
        this.expected_output = expected_output;
        this.generated_output = generated_output;
        this.test_status = test_status;
        this.isActive = isActive;
        this.created = created;
        this.lastUpdated = lastUpdated;
    }
        /**
     * Static function to get JOI validation schema for TestCases
     */
         static getJOIValidationSchema() {
            return {
                uuid: JOI.string(), 
                study_UUID: JOI.string(),
                site_uuid: JOI.string(),
                formSeq: JOI.string(),
                epoch: JOI.string(),
                version: JOI.string(), 
                entityType: JOI.string(), 
                entity_OID: JOI.string(),
                test_data: JOI.string(),
                creating_user_uuid: JOI.string(), 
                description: JOI.string(), 
                expected_output: JOI.string(), 
                generated_output: JOI.string(), 
                test_status: JOI.string(), 
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
        let error = JOI.validate(this, TestCases.getJOIValidationSchema());
        return (error && error.error) ? error.error : null;
    }


            /**
     * Static function to get TestCases data from HttpRequest object
     * @param reqObj Any
     * @param updateableFields Boolean OPTIONAL DEFAULT = false, if true get only properties to be updated
     * @returns TestCases | null
     */
             static getTestCasesFromRequestObj(reqObj, updateableFields = false) {
                if (!reqObj) return null;
                if (!updateableFields) {
                    const testcases = new TestCases(
                        reqObj.uuid, 
                        reqObj.study_UUID, 
                        reqObj.site_uuid || null,
                        reqObj.formSeq || null,
                        reqObj.epoch || null,
                        reqObj.version || null, 
                        reqObj.entityType || null, 
                        reqObj.entity_OID || null,
                        reqObj.test_data || null,
                        reqObj.creating_user_uuid || null,
                        reqObj.description || null, 
                        reqObj.expected_output || null, 
                        reqObj.generated_output || null, 
                        reqObj.test_status || null, 
                        reqObj.created || new Date(), 
                        reqObj.lastUpdated || new Date(), 
                        reqObj.isActive || true
                    );
                    return testcases;
                }
                const tstcse = {};
                if (reqObj.study_UUID) tstcse.study_UUID = reqObj.study_UUID;
                if (reqObj.site_uuid) tstcse.site_uuid = reqObj.site_uuid;
                if (reqObj.formSeq) tstcse.formSeq = reqObj.formSeq;
                if (reqObj.epoch) tstcse.epoch = reqObj.epoch;
                if (reqObj.version) tstcse.version = reqObj.version;
                if (reqObj.entityType) tstcse.entityType = reqObj.entityType;
                if (reqObj.entity_OID) tstcse.entity_OID = reqObj.entity_OID;
                if (reqObj.test_data) tstcse.test_data = reqObj.test_data;
                if (reqObj.creating_user_uuid) tstcse.creating_user_uuid = reqObj.creating_user_uuid;
                if (reqObj.description) tstcse.description = reqObj.description;
                if (reqObj.expected_output) tstcse.expected_output = reqObj.expected_output;
                if (reqObj.generated_output) tstcse.generated_output = reqObj.generated_output;
                if (reqObj.test_status) tstcse.test_status = reqObj.test_status;
                if (reqObj.isActive !== undefined && reqObj.isActive !== null) tstcse.isActive = reqObj.isActive;
                tstcse.lastUpdated = new Date();
                return tstcse;
            }
  }

  module.exports = TestCases;