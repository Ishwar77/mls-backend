const mongoose = require('mongoose');
const SdtmMapping = require("./sdtm-mapping.model");
const Helper = require("../../utils/helper");
const Cryptic = require('../../utils/cryptic');

class SdtmMappingDAO { 
    /**
* Static method to get Mongoose Schema of SdtmMappingDAO
*/
static getMongooseSchema() {
    if (!SdtmMapping.DAOSchema) {
        SdtmMapping.DAOSchema = new mongoose.Schema({
            uuid: { type: String, required: true },
            study_id: { type: String, required: true },
            study_version: { type: String, required: false }, 
            entityType: { type: String, required: false }, 
            columnNames: { type: String, required: false }, 
            mapped_data: { type: String, required: false }, 
            creating_user_id: { type: String, required: false }, 
            status: { type: String, required: false }, 
            comment: { type: String, required: false }, 
            commenting_user_id: { type: String, required: false },
            version: { type: String, required: false },
            isActive: { type: Boolean, default: true, required: false },
            created: { type: Date, required: true, default: new Date() },
            lastUpdated: { type: Date, required: true, default: new Date() }
        });
    }
    return SdtmMapping.DAOSchema;
}

            /**
* Static method that return Mongoose Model, this is helpful in CRUD actions
*/
static getMongooseModel() {
    if (!SdtmMapping.DAOModel) {
        SdtmMapping.DAOModel = mongoose.model('SdtmMapping', SdtmMappingDAO.getMongooseSchema());
    }
    return SdtmMapping.DAOModel;
}

    /**
* To create a SdtmMapping
* @param sdtmmappingObj SdtmMapping 
* @throws Error
*/
static create(sdtmmappingObj) {
    if (!sdtmmappingObj || sdtmmappingObj instanceof SdtmMapping === false) throw new Error("Expecting a SDTM-Mapping model");

    const err = sdtmmappingObj.hasError();
    if (err) throw new Error(err);

    const sdtmmappings = SdtmMappingDAO.getMongooseModel();
    const sdtmmapping = new sdtmmappings(sdtmmappingObj);
    sdtmmapping.save();
    return sdtmmapping;
}

    /**
* Returns the list of all SdtmMappings
* @returns SdtmMappings[]
*/
static async selectAll() {
    return await SdtmMappingDAO.getMongooseModel().find();
}

    /**
* To Update an Object, identified by Id
* @param id String ObjectId 
* @param object any, Updateable properties
* @return SdtmMapping
* @throws Error 
*/
static async update(id, object) {
    if (!id || !object) throw new Error("Expecting a valid Id and Updateable Object");
    if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

    const updateable = SdtmMapping.getSDTMMappingFromRequestObj(object, true);
    if (!updateable) throw new Error("No Updateable properties matching SdtmMapping object...");

    return await SdtmMappingDAO.getMongooseModel().findByIdAndUpdate(id, updateable, { new: true });
}

    /**
* Find SdtmMapping by MongooseObjectId
* @param id
* @returns SdtmMapping 
* @throws Error
*/
static async selectById(id) {
    if (!id) throw new Error("Expecting a valid id");
    if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

    return await SdtmMappingDAO.getMongooseModel().findOne({ _id: id });
}

static async sdtmMappingDataOnStudyId(id) {
    return await SdtmMappingDAO.getMongooseModel().find({ study_id: id });
}

    /**
     * Deleting the SdtmMapping by MongooseOnjectID
     * @param id 
     * @returns SdtmMapping
     * @throws Error
     */
     static async deleteById(id) {
        if (!id) throw new Error("Expecting a valid id");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error(`Got an Invalid ObjectId "${id}"`);

        return await SdtmMappingDAO.getMongooseModel().findByIdAndRemove(id);
    }

    static async findBy(fileterObj) {
        if (!fileterObj) return null;
        return await SdtmMappingDAO.getMongooseModel().find(fileterObj);
    }

    static async findAllActiveSdtmMapping() {
        return await SdtmMappingDAO.getMongooseModel().find({ isActive: true });
    }

    
    static bulkCreate(sdtmmappingObj) {
        if (!sdtmmappingObj) throw new Error("Expecting a SDTM-Mapping model");
        let sdtmmappings;
        let sdtmmappingData;
        let bulkinsertedData = [];
        sdtmmappingObj && sdtmmappingObj.map(objs => {
            objs.uuid = Cryptic.hash(objs.entityType + objs.created + objs.study_id);
            sdtmmappings = SdtmMappingDAO.getMongooseModel();
            sdtmmappingData = new sdtmmappings(objs);
            sdtmmappingData.save();
            bulkinsertedData.push(sdtmmappingData);
          });
        return bulkinsertedData;
    }

    static async sdtmMappingDataOnEntityType(id) {
        return await SdtmMappingDAO.getMongooseModel().find({ entityType: id });
    }
}

module.exports = SdtmMappingDAO;