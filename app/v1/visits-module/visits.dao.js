const mongoose = require('mongoose');
const Visit = require("./visits.model");
const Helper = require("../../utils/helper");
const Cryptic = require('../../utils/cryptic');

class VisitDAO { 
    /**
* Static method to get Mongoose Schema of VisitDAO
*/
static getMongooseSchema() {
    if (!Visit.DAOSchema) {
        Visit.DAOSchema = new mongoose.Schema({
            uuid: { type: String, required: true },
            study_id: { type: String, required: true },
            matrix_id: { type: String, required: false },
            subject: { type: String, required: false },
            scrn: { type: String, required: false },
            visit1: { type: String, required: false },
            cm: { type: String, required: false },
            ae: { type: String, required: false },
            version: { type: String, required: false },
            isActive: { type: Boolean, default: true, required: false },
            created: { type: Date, required: true, default: new Date() },
            lastUpdated: { type: Date, required: true, default: new Date() }
        });
    }
    return Visit.DAOSchema;
}

            /**
* Static method that return Mongoose Model, this is helpful in CRUD actions
*/
static getMongooseModel() {
    if (!Visit.DAOModel) {
        Visit.DAOModel = mongoose.model('Visit', VisitDAO.getMongooseSchema());
    }
    return Visit.DAOModel;
}


    /**
* To create a Visit
* @param visitObj Visit 
* @throws Error
*/
static create(visitObj) {
    if (!visitObj || visitObj instanceof Visit === false) throw new Error("Expecting a Visit model");

    const err = visitObj.hasError();
    if (err) throw new Error(err);

    const visits = VisitDAO.getMongooseModel();
    const visit = new visits(visitObj);
    visit.save();
    return visit;
}

    /**
* Returns the list of all Visits
* @returns Visits[]
*/
static async selectAll() {
    return await VisitDAO.getMongooseModel().find();
}


    /**
* To Update an Object, identified by Id
* @param id String ObjectId 
* @param object any, Updateable properties
* @return Visit
* @throws Error 
*/
static async update(id, object) {
    if (!id || !object) throw new Error("Expecting a valid Id and Updateable Object");
    if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

    const updateable = Visit.getVisitFromRequestObj(object, true);
    if (!updateable) throw new Error("No Updateable properties matching Visit object...");

    return await VisitDAO.getMongooseModel().findByIdAndUpdate(id, updateable, { new: true });
}

    /**
* Find Visit by MongooseObjectId
* @param id
* @returns Visit 
* @throws Error
*/
static async selectById(id) {
    if (!id) throw new Error("Expecting a valid id");
    if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

    return await VisitDAO.getMongooseModel().findOne({ _id: id });
}

static async visitOnStudyId(id) {
    return await VisitDAO.getMongooseModel().find({ study_id: id });
}


    /**
     * Deleting the Visit by MongooseOnjectID
     * @param id 
     * @returns Visit
     * @throws Error
     */
     static async deleteById(id) {
        if (!id) throw new Error("Expecting a valid id");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error(`Got an Invalid ObjectId "${id}"`);

        return await VisitDAO.getMongooseModel().findByIdAndRemove(id);
    }

    static async findBy(fileterObj) {
        if (!fileterObj) return null;
        return await VisitDAO.getMongooseModel().find(fileterObj);
    }

    static async findAllActiveVisit() {
        return await VisitDAO.getMongooseModel().find({ isActive: true });
    }

    static async findVisitsOnLatestVer(ver, id) {
        return await VisitDAO.getMongooseModel().find({ version: ver, study_id: id, isActive: true });
    }

    static bulkCreate(visitObj) {
        if (!visitObj) throw new Error("Expecting a Visit model");
        let visits;
        let visitData;
        let bulkinsertedData = [];
        visitObj && visitObj.map(objs => {
            objs.uuid = Cryptic.hash(objs.subject + objs.created + objs.study_id);
            visits = VisitDAO.getMongooseModel();
            visitData = new visits(objs);
            visitData.save();
            bulkinsertedData.push(visitData);
          });
        return bulkinsertedData;
    }
}

module.exports = VisitDAO;