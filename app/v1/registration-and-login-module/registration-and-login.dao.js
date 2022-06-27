const mongoose = require('mongoose');
const RegistrationAndLogin = require("./registration-and-login.model");
const Helper = require("../../utils/helper");
const Cryptic = require('../../utils/cryptic');

class RegistrationAndLoginDAO {
    /**
* Static method to get Mongoose Schema of RegistrationAndLoginDAO
*/
    static getMongooseSchema() {
        if (!RegistrationAndLogin.DAOSchema) {
            RegistrationAndLogin.DAOSchema = new mongoose.Schema({
                userRole: { type: String, required: true },
                userName: { type: String, required: true },
                emailId: { type: String, required: false },
                mobileNumber: { type: String, required: false },
                password: { type: String, required: true },
                isActive: { type: Boolean, default: true, required: false },
                created: { type: Date, required: true, default: new Date() },
                lastUpdated: { type: Date, required: true, default: new Date() }
            });
        }
        return RegistrationAndLogin.DAOSchema;
    }

    /**
* Static method that return Mongoose Model, this is helpful in CRUD actions
*/
    static getMongooseModel() {
        if (!RegistrationAndLogin.DAOModel) {
            RegistrationAndLogin.DAOModel = mongoose.model('RegistrationAndLogin', RegistrationAndLoginDAO.getMongooseSchema());
        }
        return RegistrationAndLogin.DAOModel;
    }

    /**
* To create a RegistrationAndLogin
* @param registrationandloginObj RegistrationAndLogin 
* @throws Error
*/
    static create(registrationandloginObj) {
        if (!registrationandloginObj || registrationandloginObj instanceof RegistrationAndLogin === false) throw new Error("Expecting a Regitration/Login model");

        const err = registrationandloginObj.hasError();
        if (err) throw new Error(err);

        const registrationandlogins = RegistrationAndLoginDAO.getMongooseModel();
        const registrationandlogin = new registrationandlogins(registrationandloginObj);
        registrationandlogin.save();
        return registrationandlogin;
    }

    /**
* Returns the list of all RegistrationAndLogins
* @returns RegistrationAndLogins[]
*/
    static async selectAll() {
        return await RegistrationAndLoginDAO.getMongooseModel().find();
    }

    static async findAllActiveUsers() {
        return await RegistrationAndLoginDAO.getMongooseModel().find({ isActive: true });
    }


    /**
* Find RegistrationAndLogin by MongooseObjectId
* @param id
* @returns RegistrationAndLogin 
* @throws Error
*/
    static async selectById(id) {
        if (!id) throw new Error("Expecting a valid id");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);
        return await RegistrationAndLoginDAO.getMongooseModel().findOne({ _id: id });
    }

    /**
* To Update an Object, identified by Id
* @param id String ObjectId 
* @param object any, Updateable properties
* @return RegistrationAndLogin
* @throws Error 
*/
    static async update(id, object) {
        if (!id || !object) throw new Error("Expecting a valid Id and Updateable Object");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

        const updateable = RegistrationAndLogin.getRegistrationAndLoginFromRequestObj(object, true);
        if (!updateable) throw new Error("No Updateable properties matching RegistrationAndLogin object...");

        return await RegistrationAndLoginDAO.getMongooseModel().findByIdAndUpdate(id, updateable, { new: true });
    }

    /**
     * Deleting the RegistrationAndLogin by MongooseOnjectID
     * @param id 
     * @returns RegistrationAndLogin
     * @throws Error
     */
    static async deleteById(id) {
        if (!id) throw new Error("Expecting a valid id");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error(`Got an Invalid ObjectId "${id}"`);

        return await RegistrationAndLoginDAO.getMongooseModel().findByIdAndRemove(id);
    }
}

module.exports = RegistrationAndLoginDAO;