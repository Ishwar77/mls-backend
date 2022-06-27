const mongoose = require('mongoose');
const Sponsor = require("./sponsor.models");
const Helper = require("../../utils/helper");

class SponsorDAO {
    /**
     * Static method to get Mongoose Schema of SponsorDAO
     */
    static getMongooseSchema() {
        if (!Sponsor.DAOSchema) {
            Sponsor.DAOSchema = new mongoose.Schema({
                uuid: { type: String, required: true },
                name: { type: String, required: true, maxlength: 50, minlength: 3 },
                description: { type: String, default: null, required: false },
                isActive: { type: Boolean, default: true, required: false },
                created: { type: Date, required: true, default: new Date() },
                lastUpdated: { type: Date, required: true, default: new Date() },
            });
        }
        return Sponsor.DAOSchema;
    }

    /**
 * Static method that return Mongoose Model, this is helpful in CRUD actions
 */
    static getMongooseModel() {
        if (!Sponsor.DAOModel) {
            Sponsor.DAOModel = mongoose.model('Sponsor', SponsorDAO.getMongooseSchema());
        }
        return Sponsor.DAOModel;
    }

    /**
* To create a Sponsor
* @param sponsorObj Sponsor 
* @throws Error
*/
    static create(sponsorObj) {
        // console.log("SPOnsor MODEL ", sponsorObj);
        // sponsorObj.uuid = Cryptic.hash(sponsorObj.name);
        // console.log("SPOnsor MODEL ", sponsorObj);
        if (!sponsorObj || sponsorObj instanceof Sponsor === false) throw new Error("Expecting a Sponsor model");

        const err = sponsorObj.hasError();
        if (err) throw new Error(err);

        const sponsors = SponsorDAO.getMongooseModel();
        const sponsor = new sponsors(sponsorObj);
        sponsor.save();
        return sponsor;
    }

    /**
 * Returns the list of all Sponsors
 * @returns Sponsors[]
 */
    static async selectAll() {
        return await SponsorDAO.getMongooseModel().find();
    }

    /**
* To Update an Object, identified by Id
* @param id String ObjectId 
* @param object any, Updateable properties
* @return Sponsor
* @throws Error 
*/
    static async update(id, object) {
        if (!id || !object) throw new Error("Expecting a valid Id and Updateable Object");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

        const updateable = Sponsor.getSponsorFromRequestObj(object, true);
        if (!updateable) throw new Error("No Updateable properties matching Sponsor object...");

        return await SponsorDAO.getMongooseModel().findByIdAndUpdate(id, updateable, { new: true });
    }

    /**
* Find Sponsor by MongooseObjectId
* @param id
* @returns Sponsor 
* @throws Error
*/
    static async selectById(id) {
        if (!id) throw new Error("Expecting a valid id");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error("Got an Invalid ObjectId " + id);

        return await SponsorDAO.getMongooseModel().findOne({ _id: id });
    }

    /**
     * Deleting the Sponsor by MongooseOnjectID
     * @param id 
     * @returns Sponsor
     * @throws Error
     */
    static async deleteById(id) {
        if (!id) throw new Error("Expecting a valid id");
        if (!Helper.isValidMongooseObjectId(id)) throw new Error(`Got an Invalid ObjectId "${id}"`);

        return await SponsorDAO.getMongooseModel().findByIdAndRemove(id);
    }


    static async findBy(fileterObj) {
        if (!fileterObj) return null;
        return await SponsorDAO.getMongooseModel().find(fileterObj);
    }

    static async findAllActiveSponser() {
        return await SponsorDAO.getMongooseModel().find({isActive: true});
    }
}

module.exports = SponsorDAO;