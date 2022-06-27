const mongoose = require('mongoose');
const AlsStaging = require("./als-staging.model");
const Helper = require("../../utils/helper");
const Cryptic = require('../../utils/cryptic');

class AlsStagingDAO {
    /**
     * Static method to get Mongoose Schema of AlsStagingDAO
     */
    static getMongooseSchema() {
        if (!AlsStaging.DAOSchema) {
            AlsStaging.DAOSchema = new mongoose.Schema({
                uuid: { type: String, required: true },
                study_UUID: { type: String, required: false },
                version: { type: String, required: false },
                entityType: { type: String, required: false },
                columns: { type: String, required: false },
                creating_user_uuid: { type: String, required: false },
                status: { type: String, required: false },
                created: { type: Date, required: true, default: new Date() },
                lastUpdated: { type: Date, required: true, default: new Date() },
                isActive: { type: Boolean, default: true, required: false },
            });
        }
        return AlsStaging.DAOSchema;
    }


    /**
* Static method that return Mongoose Model, this is helpful in CRUD actions
*/
    static getMongooseModel() {
        if (!AlsStaging.DAOModel) {
            AlsStaging.DAOModel = mongoose.model('AlsStaging', AlsStagingDAO.getMongooseSchema());
        }
        return AlsStaging.DAOModel;
    }


    /**
* To create a AlsStaging
* @param alsstagingObj AlsStaging 
* @throws Error
*/
    static create(alsstagingObj) {
        if (!alsstagingObj || alsstagingObj instanceof AlsStaging === false) throw new Error("Expecting a AlsStaging model");
        const err = alsstagingObj.hasError();
        if (err) throw new Error(err);
        const alsstagings = AlsStagingDAO.getMongooseModel();
        const alsstaging = new alsstagings(alsstagingObj);
        alsstaging.save();
        return alsstaging;
    }


    /**
* Returns the list of all AlsStagings
* @returns AlsStagings[]
*/
    static async selectAll() {
        return await AlsStagingDAO.getMongooseModel().find();
    }


    /**
* To Update an Object, identified by Id
* @param id String ObjectId 
* @param object any, Updateable properties
* @return AlsStaging
* @throws Error 
*/
    static async update(id, object) {
        if (!id || !object) throw new Error("Expecting a valid Id and Updateable Object");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);
        const updateable = AlsStaging.getAlsStagingFromRequestObj(object, true);
        if (!updateable) throw new Error("No Updateable properties matching AlsStaging object...");
        return await AlsStagingDAO.getMongooseModel().findByIdAndUpdate(id, updateable, { new: true });
    }


    /**
* Find AlsStaging by MongooseObjectId
* @param id
* @returns AlsStaging 
* @throws Error
*/
    static async selectById(id) {
        if (!id) throw new Error("Expecting a valid id");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);
        return await AlsStagingDAO.getMongooseModel().findOne({ _id: id });
    }


    /**
     * Deleting the AlsStaging by MongooseOnjectID
     * @param id 
     * @returns AlsStaging
     * @throws Error
     */
    static async deleteById(id) {
        if (!id) throw new Error("Expecting a valid id");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error(`Got an Invalid ObjectId "${id}"`);
        return await AlsStagingDAO.getMongooseModel().findByIdAndRemove(id);
    }


    static async findBy(fileterObj) {
        if (!fileterObj) return null;
        return await AlsStagingDAO.getMongooseModel().find(fileterObj);
    }

    static async findAllActiveSponser() {
        return await AlsStagingDAO.getMongooseModel().find({ isActive: true });
    }

    static async findStagingDataOnLatestVer(ver, id) {
        return await AlsStagingDAO.getMongooseModel().find({ version: ver, study_UUID: id, isActive: true });
    }

    static bulkCreate(alsstagingObj) {
        if (!alsstagingObj) throw new Error("Expecting a AlsStaging model");
        let alsstagings;
        let alsstaging;
        let bulkinsertedData = [];
        alsstagingObj && alsstagingObj.map(objs => {
            objs.uuid = Cryptic.hash(objs.study_UUID + objs.created + objs.version);
            alsstagings = AlsStagingDAO.getMongooseModel();
            alsstaging = new alsstagings(objs);
            alsstaging.save();
            bulkinsertedData.push(alsstaging);
          });
        return bulkinsertedData;
    }


    static async alsStagingOnStudyId(id) {
        return await AlsStagingDAO.getMongooseModel().find({study_UUID: id});
    }
}

module.exports = AlsStagingDAO;