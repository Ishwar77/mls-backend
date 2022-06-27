const mongoose = require('mongoose');
const TestCases = require("./test-cases.model");
const Helper = require("../../utils/helper");
const Cryptic = require('../../utils/cryptic');


class TestCasesDAO {
    /**
     * Static method to get Mongoose Schema of TestCasesDAO
     */
     static getMongooseSchema() {
        if (!TestCases.DAOSchema) {
            TestCases.DAOSchema = new mongoose.Schema({
                uuid: { type: String, required: true },
                study_UUID: { type: String, required: false },
                site_uuid: { type: String, required: false },
                formSeq: { type: String, required: false },
                epoch: { type: String, required: false },
                version: { type: String, required: false }, 
                entityType: { type: String, required: false }, 
                entity_OID: { type: String, required: false },
                test_data: { type: String, required: false },
                creating_user_uuid: { type: String, required: false }, 
                description: { type: String, required: false }, 
                expected_output: { type: String, required: false }, 
                generated_output: { type: String, required: false }, 
                test_status: { type: String, required: false }, 
                created: { type: Date, required: true, default: new Date() },
                lastUpdated: { type: Date, required: true, default: new Date() },
                isActive: { type: Boolean, default: true, required: false },
            });
        }
        return TestCases.DAOSchema;
    }


        /**
* Static method that return Mongoose Model, this is helpful in CRUD actions
*/
static getMongooseModel() {
    if (!TestCases.DAOModel) {
        TestCases.DAOModel = mongoose.model('TestCases', TestCasesDAO.getMongooseSchema());
    }
    return TestCases.DAOModel;
}

    /**
* To create a TestCases
* @param testcasesObj TestCases 
* @throws Error
*/
static create(testcasesObj) {
    if (!testcasesObj || testcasesObj instanceof TestCases === false) throw new Error("Expecting a TestCases model");
    const err = testcasesObj.hasError();
    if (err) throw new Error(err);
    const testcasess = TestCasesDAO.getMongooseModel();
    const testcases = new testcasess(testcasesObj);
    testcases.save();
    return testcases;
}

    /**
* Returns the list of all TestCasess
* @returns TestCasess[]
*/
static async selectAll() {
    return await TestCasesDAO.getMongooseModel().find();
}

    /**
* To Update an Object, identified by Id
* @param id String ObjectId 
* @param object any, Updateable properties
* @return TestCases
* @throws Error 
*/
static async update(id, object) {
    if (!id || !object) throw new Error("Expecting a valid Id and Updateable Object");
    if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);
    const updateable = TestCases.getTestCasesFromRequestObj(object, true);
    if (!updateable) throw new Error("No Updateable properties matching TestCases object...");
    return await TestCasesDAO.getMongooseModel().findByIdAndUpdate(id, updateable, { new: true });
}


    /**
* Find TestCases by MongooseObjectId
* @param id
* @returns TestCases 
* @throws Error
*/
static async selectById(id) {
    if (!id) throw new Error("Expecting a valid id");
    if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);
    return await TestCasesDAO.getMongooseModel().findOne({ _id: id });
}


    /**
     * Deleting the TestCases by MongooseOnjectID
     * @param id 
     * @returns TestCases
     * @throws Error
     */
     static async deleteById(id) {
        if (!id) throw new Error("Expecting a valid id");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error(`Got an Invalid ObjectId "${id}"`);
        return await TestCasesDAO.getMongooseModel().findByIdAndRemove(id);
    }

    static async findBy(fileterObj) {
        if (!fileterObj) return null;
        return await TestCasesDAO.getMongooseModel().find(fileterObj);
    }

    static async findAllActiveSponser() {
        return await TestCasesDAO.getMongooseModel().find({ isActive: true });
    }

    
    static bulkCreate(testcasesObj) {
        if (!testcasesObj) throw new Error("Expecting a TestCases model");
        let testcasess;
        let testcases;
        let bulkinsertedData = [];
        testcasesObj && testcasesObj.map(objs => {
            objs.uuid = Cryptic.hash(objs.study_UUID + objs.created + objs.version);
            testcasess = TestCasesDAO.getMongooseModel();
            testcases = new testcasess(objs);
            testcases.save();
            bulkinsertedData.push(testcases);
          });
        return bulkinsertedData;
    }
}

module.exports = TestCasesDAO;