const mongoose = require('mongoose');
const TestCasesv2 = require("./test-cases-v2.model");
const Helper = require("../../utils/helper");
const Cryptic = require('../../utils/cryptic');
const AWS = require('aws-sdk');
const requiredKeysandIds = require('../../../config/custom-environment-variables.json');
const xlsx = require('xlsx')

console.log("Route ALS Staging Loaded...!");
const s3 = new AWS.S3({
    accessKeyId: requiredKeysandIds.S3_BUCKET_ACCESS_KEY_ID_PROD,
    secretAccessKey: requiredKeysandIds.S3_BUCKET_SECRET_ACCESS_KEY_PROD
});


class TestCasesv2DAO {
    /**
     * Static method to get Mongoose Schema of TestCasesv2DAO
     */
     static getMongooseSchema() {
        if (!TestCasesv2.DAOSchema) {
            TestCasesv2.DAOSchema = new mongoose.Schema({
                uuid: { type: String, required: true },
                STUDYID: { type: String, required: false },
                SITEID: { type: String, required: false },
                SUBJECT_ID: { type: String, required: false },
                eCRFV_VERSION: { type: String, required: false },
                FormOID: { type: String, required: false },
                FieldOID: { type: String, required: false }, 
                VariableOID: { type: String, required: false },
                dataDictionaryOID: { type: String, required: false },
                Test_Condition: { type: String, required: false }, 
                test_data: { type: String, required: false },
                creating_user_uuid: { type: String, required: false }, 
                description: { type: String, required: false },  
                Created_By: { type: String, required: false }, 
                test_status: { type: String, required: false }, 
                created: { type: Date, required: true, default: new Date() },
                lastUpdated: { type: Date, required: true, default: new Date() },
                isActive: { type: Boolean, default: true, required: false },
            });
        }
        return TestCasesv2.DAOSchema;
    }


        /**
* Static method that return Mongoose Model, this is helpful in CRUD actions
*/
static getMongooseModel() {
    if (!TestCasesv2.DAOModel) {
        TestCasesv2.DAOModel = mongoose.model('TestCasesv2', TestCasesv2DAO.getMongooseSchema());
    }
    return TestCasesv2.DAOModel;
}

    /**
* To create a TestCasesv2
* @param testcasesv2Obj TestCasesv2 
* @throws Error
*/
static create(testcasesv2Obj) {
    if (!testcasesv2Obj || testcasesv2Obj instanceof TestCasesv2 === false) throw new Error("Expecting a TestCasesv2 model");
    const err = testcasesv2Obj.hasError();
    if (err) throw new Error(err);
    const testcasesv2s = TestCasesv2DAO.getMongooseModel();
    const testcasesv2 = new testcasesv2s(testcasesv2Obj);
    testcasesv2.save();
    return testcasesv2;
}

    /**
* Returns the list of all TestCasesv2s
* @returns TestCasesv2s[]
*/
static async selectAll() {
    return await TestCasesv2DAO.getMongooseModel().find();
}

    /**
* To Update an Object, identified by Id
* @param id String ObjectId 
* @param object any, Updateable properties
* @return TestCasesv2
* @throws Error 
*/
static async update(id, object) {
    if (!id || !object) throw new Error("Expecting a valid Id and Updateable Object");
    if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);
    const updateable = TestCasesv2.getTestCasesv2FromRequestObj(object, true);
    if (!updateable) throw new Error("No Updateable properties matching TestCasesv2 object...");
    return await TestCasesv2DAO.getMongooseModel().findByIdAndUpdate(id, updateable, { new: true });
}


    /**
* Find TestCasesv2 by MongooseObjectId
* @param id
* @returns TestCasesv2 
* @throws Error
*/
static async selectById(id) {
    if (!id) throw new Error("Expecting a valid id");
    if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);
    return await TestCasesv2DAO.getMongooseModel().findOne({ _id: id });
}


    /**
     * Deleting the TestCasesv2 by MongooseOnjectID
     * @param id 
     * @returns TestCasesv2
     * @throws Error
     */
     static async deleteById(id) {
        if (!id) throw new Error("Expecting a valid id");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error(`Got an Invalid ObjectId "${id}"`);
        return await TestCasesv2DAO.getMongooseModel().findByIdAndRemove(id);
    }

    static async findBy(fileterObj) {
        if (!fileterObj) return null;
        return await TestCasesv2DAO.getMongooseModel().find(fileterObj);
    }

    static async findAllActiveSponser() {
        return await TestCasesv2DAO.getMongooseModel().find({ isActive: true });
    }

    
    static bulkCreate(testcasesv2Obj) {
        if (!testcasesv2Obj) throw new Error("Expecting a TestCasesv2 model");
        let testcasesv2s;
        let testcasesv2;
        let bulkinsertedData = [];
        testcasesv2Obj && testcasesv2Obj.map(objs => {
            objs.uuid = Cryptic.hash(objs.STUDYID + objs.created + objs.version);
            testcasesv2s = TestCasesv2DAO.getMongooseModel();
            testcasesv2 = new testcasesv2s(objs);
            testcasesv2.save();
            bulkinsertedData.push(testcasesv2);
          });
        return bulkinsertedData;
    }

    static async testCaseV2OnStudyId(id) {
        return await TestCasesv2DAO.getMongooseModel().find({ STUDYID: id });
    }

    static async testCaseV2OnFormOId(id) {
        return await TestCasesv2DAO.getMongooseModel().find({ FormOID: id });
    }

    static async testCaseV2OnFieldOId(id) {
        return await TestCasesv2DAO.getMongooseModel().find({ FieldOID: id });
    }

    static async testCasesOnStudyAndFormID(studyid, formoid) {
        return await TestCasesv2DAO.getMongooseModel().find({ STUDYID: studyid, FormOID: formoid });
    }

    static async testCasesOnVersionStudyAndFormID(studyid, formoid, version) {
        return await TestCasesv2DAO.getMongooseModel().find({ STUDYID: studyid, FormOID: formoid, version: version});
    }

    static async testCasesOnStudyAndFieldID(studyid, fieldoid) {
        return await TestCasesv2DAO.getMongooseModel().find({ STUDYID: studyid, FieldOID: fieldoid });
    }

    static async testCasesOnVersionStudyAndFieldID(studyid, fieldoid, version) {
        return await TestCasesv2DAO.getMongooseModel().find({ STUDYID: studyid, FieldOID: fieldoid, version: version});
    }

    static async testCasesOnStudyAndVariableOID(studyid, variableoid) {
        return await TestCasesv2DAO.getMongooseModel().find({ STUDYID: studyid, VariableOID: variableoid });
    }
}

module.exports = TestCasesv2DAO;