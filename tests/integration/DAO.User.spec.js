const User = require("../../app/models/user");
const UserDAO = require("../../app/daos/user");

describe("DAOUser()", () => {
    describe("Must have utility methods", () => {
        // 1. Must have static methods to get Schema and Mongoose Model
        const user1 = new User("Harsha");

        it('Should have Mongoose Schema Definition', () => {
            const schema = UserDAO.getMongooseSchema();
            expect(schema).not.toBeNull();
        });

        it('Should have Mongoose Model Definition', () => {
            const model = UserDAO.getMongooseModel();
            expect(model).not.toBeNull();
        });
    });

    describe("Create User", () => {
        const UserModel = UserDAO.getMongooseModel();
        let usrObj;
        let user;
        beforeEach( () => {
            const usrObj = new User("Harsha", new Date() );
        });
        afterEach( () => {
            user = null;
            new UserModel( {} );
        });

        it(`Should create a user, with valid ObjectId`, () => {
            user = new UserModel( usrObj );
            expect(user._id).not.toBeUndefined();
        });

        it(`Should throw error due to invalid property`, (function() {
            try {
                user = new UserModel( null );
                expect(user._id).not.toBeUndefined();
            } catch(e) {
                console.log(e);
            }
        }));

    });

    describe(`GET User`, () => {
        it('Should get list of Users', () => {
            UserDAO.selectAll().then(usr => {
                console.log('Users = ', usr);
                expect(usr).not.toBeNull();
            });
        });
    });


});