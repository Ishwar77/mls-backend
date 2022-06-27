const mongoose = require('mongoose');
const DataDictionary = require("./data-dictionary.model");
const Helper = require("../../utils/helper");
const Cryptic = require('../../utils/cryptic');

class DataDictionaryDAO {
    
    /**
 * Static method to get Mongoose Schema of DataDictionaryDAO
 */
     static getMongooseSchema() {
        if (!DataDictionary.DAOSchema) {
            DataDictionary.DAOSchema = new mongoose.Schema({
                uuid: { type: String, required: true },
                study_id: { type: String, required: true },
                dataDictionaryName: { type: String, required: false },
                codedData: { type: String, required: false },
                ordinal: { type: String, required: false },
                userDataString: { type: String, required: false },
                specify: { type: String, required: false },
                version: { type: String, required: false },
                isActive: { type: Boolean, default: true, required: false },
                created: { type: Date, required: true, default: new Date() },
                lastUpdated: { type: Date, required: true, default: new Date() }
            });
        }
        return DataDictionary.DAOSchema;
    }

        /**
* Static method that return Mongoose Model, this is helpful in CRUD actions
*/
static getMongooseModel() {
    if (!DataDictionary.DAOModel) {
        DataDictionary.DAOModel = mongoose.model('DataDictionary', DataDictionaryDAO.getMongooseSchema());
    }
    return DataDictionary.DAOModel;
}


    /**
* To create a DataDictionary
* @param datadictionaryObj DataDictionary 
* @throws Error
*/
static create(datadictionaryObj) {
    if (!datadictionaryObj || datadictionaryObj instanceof DataDictionary === false) throw new Error("Expecting a DataDictionary model");

    const err = datadictionaryObj.hasError();
    if (err) throw new Error(err);

    const datadictionarys = DataDictionaryDAO.getMongooseModel();
    const datadictionary = new datadictionarys(datadictionaryObj);
    datadictionary.save();
    return datadictionary;
}

    /**
* Returns the list of all DataDictionarys
* @returns DataDictionarys[]
*/
static async selectAll() {
    return await DataDictionaryDAO.getMongooseModel().find();
}


    /**
* To Update an Object, identified by Id
* @param id String ObjectId 
* @param object any, Updateable properties
* @return DataDictionary
* @throws Error 
*/
static async update(id, object) {
    if (!id || !object) throw new Error("Expecting a valid Id and Updateable Object");
    if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

    const updateable = DataDictionary.getDataDictionaryFromRequestObj(object, true);
    if (!updateable) throw new Error("No Updateable properties matching DataDictionary object...");

    return await DataDictionaryDAO.getMongooseModel().findByIdAndUpdate(id, updateable, { new: true });
}


    /**
* Find DataDictionary by MongooseObjectId
* @param id
* @returns DataDictionary 
* @throws Error
*/
static async selectById(id) {
    if (!id) throw new Error("Expecting a valid id");
    if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

    return await DataDictionaryDAO.getMongooseModel().findOne({ _id: id });
}

static async dataDictionaryOnStudyId(id) {
    return await DataDictionaryDAO.getMongooseModel().find({ study_id: id });
}


    /**
     * Deleting the DataDictionary by MongooseOnjectID
     * @param id 
     * @returns DataDictionary
     * @throws Error
     */
     static async deleteById(id) {
        if (!id) throw new Error("Expecting a valid id");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error(`Got an Invalid ObjectId "${id}"`);

        return await DataDictionaryDAO.getMongooseModel().findByIdAndRemove(id);
    }

    static async findBy(fileterObj) {
        if (!fileterObj) return null;
        return await DataDictionaryDAO.getMongooseModel().find(fileterObj);
    }

    static async findAllActiveDataDictionary() {
        return await DataDictionaryDAO.getMongooseModel().find({ isActive: true });
    }

    static async findDataDictionaryOnLatestVer(ver, id) {
        return await DataDictionaryDAO.getMongooseModel().find({ version: ver, study_id: id, isActive: true });
    }
    
    static bulkCreate(dataDictionaryObj) {
        if (!dataDictionaryObj) throw new Error("Expecting a Data Dictionary model");
        let dataDictionarys;
        let dataDictionaryData;
        let bulkinsertedData = [];
        dataDictionaryObj && dataDictionaryObj.map(objs => {
            objs.uuid = Cryptic.hash(objs.dataDictionaryName + objs.created + objs.study_id);
            dataDictionarys = DataDictionaryDAO.getMongooseModel();
            dataDictionaryData = new dataDictionarys(objs);
            dataDictionaryData.save();
            bulkinsertedData.push(dataDictionaryData);
          });
        return bulkinsertedData;
    }
}


module.exports = DataDictionaryDAO;