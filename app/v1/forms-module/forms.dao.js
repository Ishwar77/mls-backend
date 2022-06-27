const mongoose = require('mongoose');
const Form = require("./forms.model");
const Helper = require("../../utils/helper");
const Cryptic = require('../../utils/cryptic');

class FormDAO { 
        /**
* Static method to get Mongoose Schema of FormDAO
*/
static getMongooseSchema() {
    if (!Form.DAOSchema) {
        Form.DAOSchema = new mongoose.Schema({
            uuid: { type: String, required: true },
            study_id: { type: String, required: true },
            oid: { type: String, required: false }, 
            ordinal: { type: String, required: false }, 
            draftFormName: { type: String, required: false }, 
            draftFormActive: { type: String, required: false }, 
            isTemplate: { type: String, required: false }, 
            isSignatureRequired: { type: String, required: false }, 
            viewRestrictions: { type: String, required: false },
            entryRestrictions: { type: String, required: false },
            logDirection: { type: String, required: false },
            version: { type: String, required: false },
            isActive: { type: Boolean, default: true, required: false },
            created: { type: Date, required: true, default: new Date() },
            lastUpdated: { type: Date, required: true, default: new Date() },
            matrixdata: { type: String, required: false }

        });
    }
    return Form.DAOSchema;
}

            /**
* Static method that return Mongoose Model, this is helpful in CRUD actions
*/
static getMongooseModel() {
    if (!Form.DAOModel) {
        Form.DAOModel = mongoose.model('Form', FormDAO.getMongooseSchema());
    }
    return Form.DAOModel;
}

    /**
* To create a Form
* @param formObj Form 
* @throws Error
*/
static create(formObj) {
    if (!formObj || formObj instanceof Form === false) throw new Error("Expecting a Form model");

    const err = formObj.hasError();
    if (err) throw new Error(err);

    const forms = FormDAO.getMongooseModel();
    const form = new forms(formObj);
    form.save();
    return form;
}

    /**
* Returns the list of all Forms
* @returns Forms[]
*/
static async selectAll() {
    return await FormDAO.getMongooseModel().find();
}


    /**
* To Update an Object, identified by Id
* @param id String ObjectId 
* @param object any, Updateable properties
* @return Form
* @throws Error 
*/
static async update(id, object) {
    if (!id || !object) throw new Error("Expecting a valid Id and Updateable Object");
    if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

    const updateable = Form.getFormFromRequestObj(object, true);
    if (!updateable) throw new Error("No Updateable properties matching Form object...");

    return await FormDAO.getMongooseModel().findByIdAndUpdate(id, updateable, { new: true });
}


    /**
* Find Form by MongooseObjectId
* @param id
* @returns Form 
* @throws Error
*/
static async selectById(id) {
    if (!id) throw new Error("Expecting a valid id");
    if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

    return await FormDAO.getMongooseModel().findOne({ _id: id });
}

static async formOnStudyId(id) {
    return await FormDAO.getMongooseModel().find({ study_id: id });
}


    /**
     * Deleting the Form by MongooseOnjectID
     * @param id 
     * @returns Form
     * @throws Error
     */
     static async deleteById(id) {
        if (!id) throw new Error("Expecting a valid id");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error(`Got an Invalid ObjectId "${id}"`);

        return await FormDAO.getMongooseModel().findByIdAndRemove(id);
    }

    static async findBy(fileterObj) {
        if (!fileterObj) return null;
        return await FormDAO.getMongooseModel().find(fileterObj);
    }

    static async findAllActiveForm() {
        return await FormDAO.getMongooseModel().find({ isActive: true });
    }

    static async formOnFolderOID(oid, studyid) {
        return await FormDAO.getMongooseModel().find({ oid: oid, study_id: studyid });
    }   

    static async formOnVersionFolderOIDandStudy(oid, studyid, ver) {
        return await FormDAO.getMongooseModel().find({ oid: oid, study_id: studyid, version: ver, isActive: true });
    }  
    
    static async findFormsOnLatestVer(ver, studyid) {
        return await FormDAO.getMongooseModel().find({ version: ver, study_id: studyid, isActive: true });
    }
    
    static bulkCreate(formObj) {
        if (!formObj) throw new Error("Expecting a Forms model");
        let forms;
        let formsData;
        let bulkinsertedData = [];
        formObj && formObj.map(objs => {
            objs.uuid = Cryptic.hash(objs.oid + objs.created + objs.study_id);
            forms = FormDAO.getMongooseModel();
            formsData = new forms(objs);
            formsData.save();
            bulkinsertedData.push(formsData);
          });
        return bulkinsertedData;
    }
}

module.exports = FormDAO;