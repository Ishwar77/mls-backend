const mongoose = require('mongoose');
const Draft = require("./draft.model");
const Helper = require("../../utils/helper");
const Cryptic = require('../../utils/cryptic');

class DraftDAO {

    /**
     * Static method to get Mongoose Schema of DraftDAO
     */
    static getMongooseSchema() {
        if (!Draft.DAOSchema) {
            Draft.DAOSchema = new mongoose.Schema({
                uuid: { type: String, required: true },
                study_id: { type: String, required: true },
                draftName: { type: String, required: false },
                description: { type: String, required: false },
                deleteExisting: { type: String, required: false },
                projectName: { type: String, required: false },
                projectType: { type: String, required: false },
                primaryFormOID: { type: String, required: false },
                DefaultMatrixOID: { type: String, required: false },
                confirmMessage: { type: String, required: false },
                version: { type: String, required: false },
                isActive: { type: Boolean, default: true, required: false },
                created: { type: Date, required: true, default: new Date() },
                lastUpdated: { type: Date, required: true, default: new Date() }
            });
        }
        return Draft.DAOSchema;
    }


    /**
* Static method that return Mongoose Model, this is helpful in CRUD actions
*/
    static getMongooseModel() {
        if (!Draft.DAOModel) {
            Draft.DAOModel = mongoose.model('Draft', DraftDAO.getMongooseSchema());
        }
        return Draft.DAOModel;
    }


    /**
* To create a Draft
* @param draftObj Draft 
* @throws Error
*/
    static create(draftObj) {
        if (!draftObj || draftObj instanceof Draft === false) throw new Error("Expecting a Draft model");

        const err = draftObj.hasError();
        if (err) throw new Error(err);

        const drafts = DraftDAO.getMongooseModel();
        const draft = new drafts(draftObj);
        draft.save();
        return draft;
    }


    /**
* Returns the list of all Drafts
* @returns Drafts[]
*/
    static async selectAll() {
        return await DraftDAO.getMongooseModel().find();
    }


    /**
* To Update an Object, identified by Id
* @param id String ObjectId 
* @param object any, Updateable properties
* @return Draft
* @throws Error 
*/
    static async update(id, object) {
        if (!id || !object) throw new Error("Expecting a valid Id and Updateable Object");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

        const updateable = Draft.getDraftFromRequestObj(object, true);
        if (!updateable) throw new Error("No Updateable properties matching Draft object...");

        return await DraftDAO.getMongooseModel().findByIdAndUpdate(id, updateable, { new: true });
    }


    /**
* Find Draft by MongooseObjectId
* @param id
* @returns Draft 
* @throws Error
*/
    static async selectById(id) {
        if (!id) throw new Error("Expecting a valid id");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

        return await DraftDAO.getMongooseModel().findOne({ _id: id });
    }


    static async draftOnStudyId(id) {
        return await DraftDAO.getMongooseModel().find({ study_id: id });
    }

    /**
     * Deleting the Draft by MongooseOnjectID
     * @param id 
     * @returns Draft
     * @throws Error
     */
    static async deleteById(id) {
        if (!id) throw new Error("Expecting a valid id");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error(`Got an Invalid ObjectId "${id}"`);

        return await DraftDAO.getMongooseModel().findByIdAndRemove(id);
    }


    static async findBy(fileterObj) {
        if (!fileterObj) return null;
        return await DraftDAO.getMongooseModel().find(fileterObj);
    }

    static async findAllActiveDraft() {
        return await DraftDAO.getMongooseModel().find({ isActive: true });
    }

    static async findDraftOnLatestVer(ver) {
        return await DraftDAO.getMongooseModel().find({ version: ver, isActive: true });
    }

    static bulkCreate(draftObj) {
        if (!draftObj) throw new Error("Expecting a Draft model");
        let drafts;
        let draftsData;
        let bulkinsertedData = [];
        draftObj && draftObj.map(objs => {
            objs.uuid = Cryptic.hash(objs.draftName + objs.created + objs.study_id);
            drafts = DraftDAO.getMongooseModel();
            draftsData = new drafts(objs);
            draftsData.save();
            bulkinsertedData.push(draftsData);
          });
        return bulkinsertedData;
    }
}

module.exports = DraftDAO;