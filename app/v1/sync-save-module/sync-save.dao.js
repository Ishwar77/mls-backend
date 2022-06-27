const mongoose = require('mongoose');
const SyncSave = require("./sync-save.model");
const Helper = require("../../utils/helper");

class SyncSaveDAO {

    /**
 * Static method to get Mongoose Schema of SyncSaveDAO
 */
    static getMongooseSchema() {
        if (!SyncSave.DAOSchema) {
            SyncSave.DAOSchema = new mongoose.Schema({
                studyId: { type: String, required: true },
                sheetName: { type: String, required: true },
                data: { type: String, required: true },
                version: { type: String, required: false },
                isActive: { type: Boolean, default: true, required: false },
                created: { type: Date, required: true, default: new Date() },
                lastUpdated: { type: Date, required: true, default: new Date() }
            });
        }
        return SyncSave.DAOSchema;
    }

    /**
* Static method that return Mongoose Model, this is helpful in CRUD actions
*/
    static getMongooseModel() {
        if (!SyncSave.DAOModel) {
            SyncSave.DAOModel = mongoose.model('SyncSave', SyncSaveDAO.getMongooseSchema());
        }
        return SyncSave.DAOModel;
    }

                /**
* To create a SyncSave
* @param syncSaveObj SyncSave 
* @throws Error
*/
static create(syncSaveObj) {
    if (!syncSaveObj) throw new Error("Expecting a SyncSave model");

    // const err = syncSaveObj.hasError();
    // if (err) throw new Error(err);

    const syncSaves = SyncSaveDAO.getMongooseModel();
    const syncSave = new syncSaves(syncSaveObj);
    syncSave.save();
    return syncSave;
}

        /**
 * Returns the list of all SyncSaves
 * @returns SyncSaves[]
 */
         static async selectAll() {
            return await SyncSaveDAO.getMongooseModel().find();
        }

        
            /**
* To Update an Object, identified by Id
* @param id String ObjectId 
* @param object any, Updateable properties
* @return SyncSave
* @throws Error 
*/
    static async update(id, object) {
        if (!id || !object) throw new Error("Expecting a valid Id and Updateable Object");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

        const updateable = SyncSave.getSyncSaveFromRequestObj(object, true);
        if (!updateable) throw new Error("No Updateable properties matching SyncSave object...");

        return await SyncSaveDAO.getMongooseModel().findByIdAndUpdate(id, updateable, { new: true });
    }

           /**
* Find SyncSave by MongooseObjectId
* @param id
* @returns SyncSave 
* @throws Error
*/
static async selectById(id) {
    if (!id) throw new Error("Expecting a valid id");
    if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

    return await SyncSaveDAO.getMongooseModel().findOne({ _id: id });
}

static async syncDataOnStudyId(id) {
    return await SyncSaveDAO.getMongooseModel().find({studyId: id});
}

static async syncDataOnSheetName(id, sheetName, version) {
    return await SyncSaveDAO.getMongooseModel().find({studyId: id, sheetName: sheetName, version: version, isActive: true});
}

    /**
     * Deleting the SyncSave by MongooseOnjectID
     * @param id 
     * @returns SyncSave
     * @throws Error
     */
     static async deleteById(id) {
        if (!id) throw new Error("Expecting a valid id");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error(`Got an Invalid ObjectId "${id}"`);
        return await SyncSaveDAO.getMongooseModel().findByIdAndRemove(id);
    }

    static async findBy(fileterObj) {
        if (!fileterObj) return null;
        return await SyncSaveDAO.getMongooseModel().find(fileterObj);
    }

    static async findAllActiveSynchedData() {
        return await SyncSaveDAO.getMongooseModel().find({isActive: true});
    }

    static async findDataOnLatestVer(ver, id) {
        return await SyncSaveDAO.getMongooseModel().find({ version: ver, studyId: id, isActive: true });
    }

    static bulkCreate(syncSaveObj) {
        if (!syncSaveObj) throw new Error("Expecting Appropriate model");
        let syncSaves;
        let syncSave;
        let bulkinsertedData = [];
        syncSaveObj && syncSaveObj.map(objs => {
            syncSaves = SyncSaveDAO.getMongooseModel();
            syncSave = new syncSaves(objs);
            syncSave.save();
            bulkinsertedData.push(syncSave);
          });
        return bulkinsertedData;
    }
}

module.exports = SyncSaveDAO;