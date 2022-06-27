const mongoose = require('mongoose');
const Study = require("./study.model");
const Helper = require("../../utils/helper");
const controller = require("../../controllers/file-upload");

class StudyDAO {

    /**
     * Static method to get Mongoose Schema of StudyDAO
     */
     static getMongooseSchema() {
        if (!Study.DAOSchema) {
            Study.DAOSchema = new mongoose.Schema({
                uuid: { type: String, required: true }, 
                sponsor_id: { type: String, required: true }, 
                title: { type: String, required: true, maxlength: 50, minlength: 3 }, 
                description: { type: String, required: false }, 
                version: { type: String, required: false }, 
                docPath: { type: String, required: true }, 
                signature: { type: String, required: false },
                studyStatus: { type: String, required: false },
                rawData: { type: String, required: false },
                sampleFilePath: { type: String, required: false },
                isActive: { type: Boolean, default: true, required: false },
                created: { type: Date, required: true, default: new Date() }, 
                lastUpdated: { type: Date, required: true, default: new Date() }
            });
        }
        return Study.DAOSchema;
    }


        /**
 * Static method that return Mongoose Model, this is helpful in CRUD actions
 */
         static getMongooseModel() {
            if (!Study.DAOModel) {
                Study.DAOModel = mongoose.model('Study', StudyDAO.getMongooseSchema());
            }
            return Study.DAOModel;
        }

        
            /**
* To create a Study
* @param studyObj Study 
* @throws Error
*/
    static create(studyObj) {
        if (!studyObj || studyObj instanceof Study === false) throw new Error("Expecting a Study model");

        const err = studyObj.hasError();
        if (err) throw new Error(err);

        const studys = StudyDAO.getMongooseModel();
        const study = new studys(studyObj);
        study.save();
        return study;
    }


        /**
 * Returns the list of all Studys
 * @returns Studys[]
 */
         static async selectAll() {
            return await StudyDAO.getMongooseModel().find();
        }


            /**
* To Update an Object, identified by Id
* @param id String ObjectId 
* @param object any, Updateable properties
* @return Study
* @throws Error 
*/
    static async update(id, object) {
        if (!id || !object) throw new Error("Expecting a valid Id and Updateable Object");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

        const updateable = Study.getStudyFromRequestObj(object, true);
        if (!updateable) throw new Error("No Updateable properties matching Study object...");

        return await StudyDAO.getMongooseModel().findByIdAndUpdate(id, updateable, { new: true });
    }


        /**
* Find Study by MongooseObjectId
* @param id
* @returns Study 
* @throws Error
*/
static async selectById(id) {
    if (!id) throw new Error("Expecting a valid id");
    if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

    return await StudyDAO.getMongooseModel().findOne({ _id: id });
}


static async studyOnSponsorId(id) {
    return await StudyDAO.getMongooseModel().find({sponsor_id: id});
}

    /**
     * Deleting the Study by MongooseOnjectID
     * @param id 
     * @returns Study
     * @throws Error
     */
     static async deleteById(id) {
        if (!id) throw new Error("Expecting a valid id");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error(`Got an Invalid ObjectId "${id}"`);

        return await StudyDAO.getMongooseModel().findByIdAndRemove(id);
    }


    static async findBy(fileterObj) {
        if (!fileterObj) return null;
        return await StudyDAO.getMongooseModel().find(fileterObj);
    }

    static async findAllActiveSponser() {
        return await StudyDAO.getMongooseModel().find({isActive: true});
    }
}

module.exports = StudyDAO;