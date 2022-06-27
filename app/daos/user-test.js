const mongoose = require('mongoose');
const User = require("../models/user-test");
const Helper = require("../utils/helper");

class UserDAO {

    /**
     * Static method to get Mongoose Schema of UserDAO
     */
    static getMongooseSchema() {
        if(!User.DAOSchema) {
            User.DAOSchema = new mongoose.Schema({
                name: {type: String, required: true, maxlength: 50, minlength: 3},
                signup_date: {type: Date, required: true, default: new Date()},
                isActive: {type: Boolean, default: true, required: false},
                inActive_from: {type: Date, default: null, required: false},
                channels: {type: Array, default: null, required: false}
            }); 
        }
        return User.DAOSchema;
    }

    /**
     * Static method that return Mongoose Model, this is helpful in CRUD actions
     */
    static getMongooseModel() {
        if(!User.DAOModel) {
            User.DAOModel = mongoose.model('User', UserDAO.getMongooseSchema());
        }
        return User.DAOModel; 
    }

    /**
     * To create a User
     * @param userObj User 
     * @throws Error
     */
    static create(userObj) {
        if(!userObj || userObj instanceof User === false) throw new Error("Expecting a User model");

        const err = userObj.hasError();
        if(err) throw new Error( err );

        const UsrDAO = UserDAO.getMongooseModel();
        const user = new UsrDAO(userObj);
        user.save();
        return user; 
    }
   
    /**
     * Returns the list of all Users
     * @returns User[]
     */
    static async selectAll() { 
        return await UserDAO.getMongooseModel().find();
    }

    /**
     * To Update an Object, identified by Id
     * @param id String ObjectId 
     * @param object any, Updateable properties
     * @return User
     * @throws Error 
     */
    static async update(id, object) { 
        if(!id || !object) throw new Error("Expecting a valid Id and Updateable Object");
        if(! Helper.isValidMongooseObjectId(id) ) throw new Error("Got an Invalid ObjectId " + id);

        const updateable = User.getUserFromRequestObj(object, true);
        if(!updateable) throw new Error("No Updateable properties matching User object...");

        return await UserDAO.getMongooseModel().findByIdAndUpdate(id, updateable, { new: true });
     }
 

    /**
     * Find User by MongooseObjectId
     * @param id
     * @returns User 
     * @throws Error
     */
    static async selectById(id) { 
        if(!id) throw new Error("Expecting a valid id");
        if(! Helper.isValidMongooseObjectId(id) ) throw new Error("Got an Invalid ObjectId " + id);

        return await UserDAO.getMongooseModel().findOne({_id: id});
     }


    static async deleteById(id) { 
        if(!id) throw new Error("Expecting a valid id");
        if(! Helper.isValidMongooseObjectId(id) ) throw new Error(`Got an Invalid ObjectId "${id}"`);

        return await UserDAO.getMongooseModel().findByIdAndRemove(id);     
     }

     static async findBy(fileterObj) {
        if(!fileterObj) return null;

        return await UserDAO.getMongooseModel().find(fileterObj);
    }

}

module.exports = UserDAO;