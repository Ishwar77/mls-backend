const mongoose = require('mongoose');
const Folder = require("./folder.model");
const Helper = require("../../utils/helper");
const Cryptic = require('../../utils/cryptic');

class FolderDAO {

    /**
 * Static method to get Mongoose Schema of FolderDAO
 */
    static getMongooseSchema() {
        if (!Folder.DAOSchema) {
            Folder.DAOSchema = new mongoose.Schema({
                uuid: { type: String, required: true },
                study_id: { type: String, required: true },
                oid: { type: String, required: false },
                ordinal: { type: String, required: false },
                folderName: { type: String, required: false },
                parentFolderOID: { type: String, required: false },
                isReusable: { type: String, required: false },
                version: { type: String, required: false },
                isActive: { type: Boolean, default: true, required: false },
                created: { type: Date, required: true, default: new Date() },
                lastUpdated: { type: Date, required: true, default: new Date() }
            });
        }
        return Folder.DAOSchema;
    }

    /**
* Static method that return Mongoose Model, this is helpful in CRUD actions
*/
    static getMongooseModel() {
        if (!Folder.DAOModel) {
            Folder.DAOModel = mongoose.model('Folder', FolderDAO.getMongooseSchema());
        }
        return Folder.DAOModel;
    }

    /**
* To create a Folder
* @param folderObj Folder 
* @throws Error
*/
    static create(folderObj) {
        if (!folderObj || folderObj instanceof Folder === false) throw new Error("Expecting a Folder model");

        const err = folderObj.hasError();
        if (err) throw new Error(err);

        const folders = FolderDAO.getMongooseModel();
        const folder = new folders(folderObj);
        folder.save();
        return folder;
    }


    /**
* Returns the list of all Folders
* @returns Folders[]
*/
    static async selectAll() {
        return await FolderDAO.getMongooseModel().find();
    }

    /**
* To Update an Object, identified by Id
* @param id String ObjectId 
* @param object any, Updateable properties
* @return Folder
* @throws Error 
*/
    static async update(id, object) {
        if (!id || !object) throw new Error("Expecting a valid Id and Updateable Object");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

        const updateable = Folder.getFolderFromRequestObj(object, true);
        if (!updateable) throw new Error("No Updateable properties matching Folder object...");

        return await FolderDAO.getMongooseModel().findByIdAndUpdate(id, updateable, { new: true });
    }

    /**
* Find Folder by MongooseObjectId
* @param id
* @returns Folder 
* @throws Error
*/
    static async selectById(id) {
        if (!id) throw new Error("Expecting a valid id");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

        return await FolderDAO.getMongooseModel().findOne({ _id: id });
    }

    static async folderOnStudyId(id) {
        return await FolderDAO.getMongooseModel().find({ study_id: id });
    }

    static async findFolderOnLatestVer(ver, id) {
        return await FolderDAO.getMongooseModel().find({ version: ver, study_id: id, isActive: true });
    }

    /**
     * Deleting the Folder by MongooseOnjectID
     * @param id 
     * @returns Folder
     * @throws Error
     */
    static async deleteById(id) {
        if (!id) throw new Error("Expecting a valid id");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error(`Got an Invalid ObjectId "${id}"`);

        return await FolderDAO.getMongooseModel().findByIdAndRemove(id);
    }

    static async findBy(fileterObj) {
        if (!fileterObj) return null;
        return await FolderDAO.getMongooseModel().find(fileterObj);
    }

    static async findAllActiveFolder() {
        return await FolderDAO.getMongooseModel().find({ isActive: true });
    }

    
    static bulkCreate(folderObj) {
        if (!folderObj) throw new Error("Expecting a Folder model");
        let folders;
        let folderData;
        let bulkinsertedData = [];
        folderObj && folderObj.map(objs => {
            objs.uuid = Cryptic.hash(objs.oid + objs.created + objs.study_id);
            folders = FolderDAO.getMongooseModel();
            folderData = new folders(objs);
            folderData.save();
            bulkinsertedData.push(folderData);
          });
        return bulkinsertedData;
    }
}


module.exports = FolderDAO;