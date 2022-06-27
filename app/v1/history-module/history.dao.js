const mongoose = require('mongoose');
const History = require("./history.model");
const Helper = require("../../utils/helper");
// const Cryptic = require('../../utils/cryptic');

class HistoryDAO { 
    /**
* Static method to get Mongoose Schema of FormDAO
*/
static getMongooseSchema() {
if (!History.DAOSchema) {
    History.DAOSchema = new mongoose.Schema({
        uuid: { type: String, required: true },
        history_date: { type: Date, required: true, default: new Date() },
        element: { type: String, required: true },
        update_log: { type: String, required: true },
        version_code: { type: String, required: true },
        comment: { type: String, required: true },
        isActive: { type: Boolean, default: true, required: false },
        created: { type: Date, required: true, default: new Date() },
        lastUpdated: { type: Date, required: true, default: new Date() },
    });
}
return History.DAOSchema;
}

        /**
* Static method that return Mongoose Model, this is helpful in CRUD actions
*/
static getMongooseModel() {
if (!History.DAOModel) {
    History.DAOModel = mongoose.model('History', HistoryDAO.getMongooseSchema());
}
return History.DAOModel;
}

/**
* To create a History
* @param historyObj History 
* @throws Error
*/
static create(historyObj) {
if (!historyObj || historyObj instanceof History === false) throw new Error("Expecting a History model");

const err = historyObj.hasError();
if (err) throw new Error(err);

const histories = HistoryDAO.getMongooseModel();
const history = new histories(historyObj);
history.save();
return history;
}

/**
* Returns the list of all histories
* @returns Histories[]
*/
static async selectAll() {
return await HistoryDAO.getMongooseModel().find();
}


/**
* To Update an Object, identified by Id
* @param id String ObjectId 
* @param object any, Updateable properties
* @return History
* @throws Error 
*/
static async update(id, object) {
if (!id || !object) throw new Error("Expecting a valid Id and Updateable Object");
if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

const updateable = History.getHistoryFromRequestObj(object, true);
if (!updateable) throw new Error("No Updateable properties matching history object...");

return await HistoryDAO.getMongooseModel().findByIdAndUpdate(id, updateable, { new: true });
}


/**
* Find History by MongooseObjectId
* @param id
* @returns History 
* @throws Error
*/
static async selectById(id) {
if (!id) throw new Error("Expecting a valid id");
if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

return await HistoryDAO.getMongooseModel().findOne({ _id: id });
}

static async historyOnStudyId(id) {
return await HistoryDAO.getMongooseModel().find({ study_id: id });
}


/**
 * Deleting the History by MongooseOnjectID
 * @param id 
 * @returns History
 * @throws Error
 */
 static async deleteById(id) {
    if (!id) throw new Error("Expecting a valid id");
    if (!Helper.isValidMongooseObjectId(id)) throw new Error(`Got an Invalid ObjectId "${id}"`);

    return await HistoryDAO.getMongooseModel().findByIdAndRemove(id);
}

static async findBy(fileterObj) {
    if (!fileterObj) return null;
    return await HistoryDAO.getMongooseModel().find(fileterObj);
}

static async findAllActiveHistory() {
    return await HistoryDAO.getMongooseModel().find({ isActive: true });
}

static async historyOnFolderOID(oid, studyid) {
    return await HistoryDAO.getMongooseModel().find({ oid: oid, study_id: studyid });
}   

static async historyOnVersionFolderOIDandStudy(oid, studyid, ver) {
    return await HistoryDAO.getMongooseModel().find({ oid: oid, study_id: studyid, version: ver, isActive: true });
}  

static async findHistoriesOnLatestVer(ver, studyid) {
    return await HistoryDAO.getMongooseModel().find({ version: ver, study_id: studyid, isActive: true });
}

// static bulkCreate(formObj) {
//     if (!formObj) throw new Error("Expecting a Forms model");
//     let forms;
//     let formsData;
//     let bulkinsertedData = [];
//     formObj && formObj.map(objs => {
//         objs.uuid = Cryptic.hash(objs.oid + objs.created + objs.study_id);
//         forms = FormDAO.getMongooseModel();
//         formsData = new forms(objs);
//         formsData.save();
//         bulkinsertedData.push(formsData);
//       });
//     return bulkinsertedData;
// }
}

module.exports = HistoryDAO;