const mongoose = require('mongoose');
const Field = require("./field.model");
const Helper = require("../../utils/helper");
const Cryptic = require('../../utils/cryptic');

class FieldDAO { 
    /**
* Static method to get Mongoose Schema of FieldDAO
*/
static getMongooseSchema() {
    if (!Field.DAOSchema) {
        Field.DAOSchema = new mongoose.Schema({
            uuid: { type: String, required: true },
            study_id: { type: String, required: true },
            formOID: { type: String, required: false }, 
            fieldOID: { type: String, required: false }, 
            ordinal: { type: String, required: false }, 
            draftFieldName: { type: String, required: false }, 
            draftFieldActive: { type: String, required: false }, 
            variableOID: { type: String, required: false }, 
            dataFormat: { type: String, required: false }, 
            dataDictionaryName: { type: String, required: false }, 
            unitDictionaryName: { type: String, required: false }, 
            codingDictionary: { type: String, required: false }, 
            controlType: { type: String, required: false }, 
            preText: { type: String, required: false }, 
            fixedUnit: { type: String, required: false }, 
            sourceDocument: { type: String, required: false }, 
            isLog: { type: String, required: false }, 
            defaultValue: { type: String, required: false }, 
            sasLable: { type: String, required: false }, 
            isRequired: { type: String, required: false }, 
            queryFutureDate: { type: String, required: false }, 
            isVisible: { type: String, required: false }, 
            analyteName: { type: String, required: false }, 
            isClinicalSignificance: { type: String, required: false },
            queryNonConformance: { type: String, required: false }, 
            doesNotBreakSignature: { type: String, required: false }, 
            viewRstrictions: { type: String, required: false }, 
            entryRestrictions: { type: String, required: false }, 
            reviewGroups: { type: String, required: false },
            version: { type: String, required: false },
            isActive: { type: Boolean, default: true, required: false },
            created: { type: Date, required: true, default: new Date() },
            lastUpdated: { type: Date, required: true, default: new Date() }
        });
    }
    return Field.DAOSchema;
}

            /**
* Static method that return Mongoose Model, this is helpful in CRUD actions
*/
static getMongooseModel() {
    if (!Field.DAOModel) {
        Field.DAOModel = mongoose.model('Field', FieldDAO.getMongooseSchema());
    }
    return Field.DAOModel;
}

    /**
* To create a Field
* @param fieldObj Field 
* @throws Error
*/
static create(fieldObj) {
    if (!fieldObj || fieldObj instanceof Field === false) throw new Error("Expecting a Field model");

    const err = fieldObj.hasError();
    if (err) throw new Error(err);

    const fields = FieldDAO.getMongooseModel();
    const field = new fields(fieldObj);
    field.save();
    return field;
}

    /**
* Returns the list of all Fields
* @returns Fields[]
*/
static async selectAll() {
    return await FieldDAO.getMongooseModel().find();
}

    /**
* To Update an Object, identified by Id
* @param id String ObjectId 
* @param object any, Updateable properties
* @return Field
* @throws Error 
*/
static async update(id, object) {
    if (!id || !object) throw new Error("Expecting a valid Id and Updateable Object");
    if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

    const updateable = Field.getFieldFromRequestObj(object, true);
    if (!updateable) throw new Error("No Updateable properties matching Field object...");

    return await FieldDAO.getMongooseModel().findByIdAndUpdate(id, updateable, { new: true });
}

    /**
* Find Field by MongooseObjectId
* @param id
* @returns Field 
* @throws Error
*/
static async selectById(id) {
    if (!id) throw new Error("Expecting a valid id");
    if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

    return await FieldDAO.getMongooseModel().findOne({ _id: id });
}

static async fieldOnStudyId(id) {
    return await FieldDAO.getMongooseModel().find({ study_id: id });
}

static async fieldOnFormOId(oid, studyid) {
    return await FieldDAO.getMongooseModel().find({ formOID: oid, study_id: studyid });
}

static async fieldOnVersionFolderOIDandStudy(oid, studyid, ver) {
    return await FieldDAO.getMongooseModel().find({ formOID: oid, study_id: studyid, version: ver, isActive: true });
}  

static async findFieldOnLatestVer(ver, studyid) {
    return await FieldDAO.getMongooseModel().find({ version: ver, study_id:studyid, isActive: true });
}

    /**
     * Deleting the Field by MongooseOnjectID
     * @param id 
     * @returns Field
     * @throws Error
     */
     static async deleteById(id) {
        if (!id) throw new Error("Expecting a valid id");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error(`Got an Invalid ObjectId "${id}"`);

        return await FieldDAO.getMongooseModel().findByIdAndRemove(id);
    }

    static async findBy(fileterObj) {
        if (!fileterObj) return null;
        return await FieldDAO.getMongooseModel().find(fileterObj);
    }

    static async findAllActiveField() {
        return await FieldDAO.getMongooseModel().find({ isActive: true });
    }

    
    static bulkCreate(fieldObj) {
        if (!fieldObj) throw new Error("Expecting a Field model");
        let fields;
        let fieldData;
        let bulkinsertedData = [];
        fieldObj && fieldObj.map(objs => {
            objs.uuid = Cryptic.hash(objs.draftFieldName + objs.created + objs.study_id);
            fields = FieldDAO.getMongooseModel();
            fieldData = new fields(objs);
            fieldData.save();
            bulkinsertedData.push(fieldData);
          });
        return bulkinsertedData;
    }
}

module.exports = FieldDAO;