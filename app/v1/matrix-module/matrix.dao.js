const mongoose = require('mongoose');
const Matrix = require("./matrix.model");
const Helper = require("../../utils/helper");
const Cryptic = require('../../utils/cryptic');

class MatrixDAO {

    /**
* Static method to get Mongoose Schema of MatrixDAO
*/
    static getMongooseSchema() {
        if (!Matrix.DAOSchema) {
            Matrix.DAOSchema = new mongoose.Schema({
                uuid: { type: String, required: true },
                study_id: { type: String, required: true },
                matrixName: { type: String, required: false },
                oid: { type: String, required: false },
                addable: { type: String, required: false },
                maximum: { type: String, required: false },
                version: { type: String, required: false },
                isActive: { type: Boolean, default: true, required: false },
                created: { type: Date, required: true, default: new Date() },
                lastUpdated: { type: Date, required: true, default: new Date() }
            });
        }
        return Matrix.DAOSchema;
    }

            /**
* Static method that return Mongoose Model, this is helpful in CRUD actions
*/
static getMongooseModel() {
    if (!Matrix.DAOModel) {
        Matrix.DAOModel = mongoose.model('Matrix', MatrixDAO.getMongooseSchema());
    }
    return Matrix.DAOModel;
}


    /**
* To create a Matrix
* @param matrixObj Matrix 
* @throws Error
*/
static create(matrixObj) {
    if (!matrixObj || matrixObj instanceof Matrix === false) throw new Error("Expecting a Matrix model");

    const err = matrixObj.hasError();
    if (err) throw new Error(err);

    const matrixs = MatrixDAO.getMongooseModel();
    const matrix = new matrixs(matrixObj);
    matrix.save();
    return matrix;
}

    /**
* Returns the list of all Matrixs
* @returns Matrixs[]
*/
static async selectAll() {
    return await MatrixDAO.getMongooseModel().find();
}

    /**
* To Update an Object, identified by Id
* @param id String ObjectId 
* @param object any, Updateable properties
* @return Matrix
* @throws Error 
*/
static async update(id, object) {
    if (!id || !object) throw new Error("Expecting a valid Id and Updateable Object");
    if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

    const updateable = Matrix.getMatrixFromRequestObj(object, true);
    if (!updateable) throw new Error("No Updateable properties matching Matrix object...");

    return await MatrixDAO.getMongooseModel().findByIdAndUpdate(id, updateable, { new: true });
}

    /**
* Find Matrix by MongooseObjectId
* @param id
* @returns Matrix 
* @throws Error
*/
static async selectById(id) {
    if (!id) throw new Error("Expecting a valid id");
    if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

    return await MatrixDAO.getMongooseModel().findOne({ _id: id });
}

static async matrixOnStudyId(id) {
    return await MatrixDAO.getMongooseModel().find({ study_id: id });
}


    /**
     * Deleting the Matrix by MongooseOnjectID
     * @param id 
     * @returns Matrix
     * @throws Error
     */
     static async deleteById(id) {
        if (!id) throw new Error("Expecting a valid id");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error(`Got an Invalid ObjectId "${id}"`);

        return await MatrixDAO.getMongooseModel().findByIdAndRemove(id);
    }

    static async findBy(fileterObj) {
        if (!fileterObj) return null;
        return await MatrixDAO.getMongooseModel().find(fileterObj);
    }

    static async findAllActiveMatrix() {
        return await MatrixDAO.getMongooseModel().find({ isActive: true });
    }

    static async findMatrixOnLatestVer(ver, id) {
        return await MatrixDAO.getMongooseModel().find({ version: ver, study_id: id, isActive: true });
    }

    static bulkCreate(matrixObj) {
        if (!matrixObj) throw new Error("Expecting a Matrix model");
        let matrixs;
        let matrixData;
        let bulkinsertedData = [];
        matrixObj && matrixObj.map(objs => {
            objs.uuid = Cryptic.hash(objs.matrixName + objs.created + objs.study_id);
            matrixs = MatrixDAO.getMongooseModel();
            matrixData = new matrixs(objs);
            matrixData.save();
            bulkinsertedData.push(matrixData);
          });
        return bulkinsertedData;
    }
}

module.exports = MatrixDAO;