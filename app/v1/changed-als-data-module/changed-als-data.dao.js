const mongoose = require('mongoose');
const ChangedAlsData = require("./changed-als-data.model");
const Helper = require("../../utils/helper");
const Cryptic = require('../../utils/cryptic');

class ChangedAlsDataDAO {

    /**
     * Static method to get Mongoose Schema of ChangedAlsDataDAO
     */
    static getMongooseSchema() {
        if (!ChangedAlsData.DAOSchema) {
            ChangedAlsData.DAOSchema = new mongoose.Schema({
                uuid: { type: String, required: false },
                study_id: { type: String, required: false },
                data: { type: String, required: false },
                entity: { type: String, required: false },
                version: { type: String, required: false },
                signature: { type: String, required: false },
                isActive: { type: Boolean, default: true, required: false },
                created: { type: Date, required: true, default: new Date() },
                lastUpdated: { type: Date, required: true, default: new Date() }
            });
        }
        return ChangedAlsData.DAOSchema;
    }
    /**
* Static method that return Mongoose Model, this is helpful in CRUD actions
*/
    static getMongooseModel() {
        if (!ChangedAlsData.DAOModel) {
            ChangedAlsData.DAOModel = mongoose.model('ChangedAlsData', ChangedAlsDataDAO.getMongooseSchema());
        }
        return ChangedAlsData.DAOModel;
    }


    /**
* Returns the list of all ChangedAlsData
* @returns ChangedAlsDatas[]
*/
static async selectAll() {
    return await ChangedAlsDataDAO.getMongooseModel().find();
}

static async findAllActiveChangedAlsData() {
    return await ChangedAlsDataDAO.getMongooseModel().find({ isActive: true });
}

        /**
* To create a ChangedAlsData
* @param changedalsdataObj ChangedAlsData 
* @throws Error
*/
static create(changedalsdataObj) {
    if (!changedalsdataObj) throw new Error("Expecting a ChangedAlsData model");
    // const err = changedalsdataObj.hasError();
    // console.log("err ", err);
    // if (err) throw new Error(err);
    const changedalsdatas = ChangedAlsDataDAO.getMongooseModel();
    const changedalsdata = new changedalsdatas(changedalsdataObj);
    changedalsdata.save();
    return changedalsdata;
}


    /**
* Find ChangedAlsData by MongooseObjectId
* @param id
* @returns ChangedAlsData 
* @throws Error
*/
    static async selectById(id) {
        if (!id) throw new Error("Expecting a valid id");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

        return await ChangedAlsDataDAO.getMongooseModel().findOne({ _id: id });
    }


    static async dataOnStudyId(id) {
        return await ChangedAlsDataDAO.getMongooseModel().find({ study_id: id, isActive: true });
    }
}

module.exports = ChangedAlsDataDAO;