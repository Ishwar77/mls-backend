const User = require("../../app/models/user");

describe("Testing Model: 'User'", () => {
    let reqObj = null;

    afterEach(() => {
        reqObj = null;
    });

    describe("User()", () => {
        it("Should create an Object with no properties set", () => {
            const usr = new User();
            expect(usr).not.toBeNull();
            expect(usr.name).toBeUndefined();
            expect(usr).not.toBeUndefined();
            expect(usr.hasError()).not.toBeNull();
        });
    });

    describe("User(name)", () => {
        const name = 'Harsha';
        it(`Should create an Object with name = "${name}", and rest of the properties to be null`, () => {
            const usr = new User(name);
            // console.log('User = ', usr);
            expect(usr).not.toBeNull();
            expect(usr.name).toMatch(name);
            expect(usr.isActive).toBeTruthy();

        });
    });

    describe("User(name, signup_date, isActive, inActive_from, channels)", () => {
        const usr = new User('Harsha', new Date(), true, null, [1, 2, 3, 4]);
        it(`Should create complete User Object with all states, other than "inactive_from"`, () => {
            // console.log('User = ', usr);
            expect(usr).not.toBeNull();
            expect(usr.name).toMatch('Harsha');
            expect(usr.isActive).toBeTruthy();
            expect(usr.inActive_from).toBeNull();
        });
    });

    describe("User Utilities", () => {
        beforeEach(() => {
            reqObj = {
                name: "Some Name",
                signup_date: new Date(),
                isActive: true,
                inActive_from: new Date(),
                channels: [1, 2, 3, 4],
                dummyProp1: "dummyVal1",
                dummyProp2: "dummyVal2",
                dummyProp3: "dummyVal3",
            };
        });

        afterEach(() => {
            reqObj = null;
        });

        it(`Should have a Validation Schema defined"`, () => {
            const vs = User.getJOIValidationSchema();
            expect(vs).not.toBeNull();
            expect(vs.name).not.toBeNull();
        });
        it(`Should be able to get User data from complex object"`, () => {
            const usr = User.getUserFromRequestObj(reqObj);
            expect(usr).not.toBeNull();
            expect(usr).toBeInstanceOf(User);
            delete reqObj.dummyProp1;
            delete reqObj.dummyProp2;
            delete reqObj.dummyProp3;
            expect(usr).toMatchObject(reqObj);

            const usr2 = User.getUserFromRequestObj(null);
            expect(usr2).toBeNull();

        });
        it(`Should be able to get updateable data from complex object"`, () => {
            const usr = User.getUserFromRequestObj(reqObj, true);
            expect(usr).not.toBeNull();
            delete reqObj.dummyProp1;
            delete reqObj.dummyProp2;
            delete reqObj.dummyProp3;
            expect(usr).toMatchObject(reqObj);
        });
    });



});