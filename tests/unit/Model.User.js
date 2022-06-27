module.exports = async function () {
    const User = require("../../app/models/user");

    const usr1 = new User("H");
    const usr2 = new User("Swathi", new Date(), true, null, null);

    const reqObj = {
        name: "Some Name",
        signup_date: new Date(),
        isActive: true,
        inActive_from: new Date(),
        channels: [1, 2, 3, 4],
        dummyProp1: "dummyVal1",
        dummyProp2: "dummyVal2",
        dummyProp3: "dummyVal3",

    };

    // console.log('Usr1 = ', usr1);
    // console.log('Usr1 has Errors = ', usr1.hasError());
    // console.log('Usr2 = ', usr2);
    // console.log('Usr2 has Errors = ', usr2.hasError());
    // console.log("User from Obj = ", User.getUserFromRequestObj(reqObj));

    delete reqObj.channels;
    // console.log("updateable User from Obj = ", User.getUserFromRequestObj(reqObj, true));

  /*   
    // DB Operations Test w.r.t. UserDAO
    // console.log('DB Operations Test w.r.t. UserDAO');
    // const Helper = require("../../app/utils/helper");
    // const db = ['mongodb', 'mongodb-mlab'];
    // Helper.connectToDb(db[0]);

    // const UserDAO = require("../../app/daos/user");
    // console.log(usr1 instanceof User);

    // 1. Create
    // let createdUser = null;
    // try {
    //     createdUser = UserDAO.create(usr2);
    // } catch (e) {
    //     console.log('Failed to create the User');
    //     console.log(e);
    // }
    // console.log('createdUser = ', createdUser); 


    // 2. SelectById
    // const id = `5d6a65f3dbd2da30244a36ce`;
    // const matchingUser = await UserDAO.selectById(id);
    // console.log('Matching user from DB = ');
    // console.log( matchingUser );


    // 3. DeleteById
    // const id = `5d6a65f3dbd2da30244a36ce`;
    // const deletedUser = await UserDAO.deleteById(id);
    // console.log( deletedUser ? `Deleted ${deletedUser}` : 'No User found..!');

    // 4. Update
    // const id = '5d6a63e94cd93b03ccb3a72f';
    // const matchingUser = await UserDAO.selectById(id);
    // matchingUser['name'] = 'Sriharsha C R';
    // matchingUser['signup_date'] = new Date();
    // console.log('To update = ', matchingUser);
    // const updated = await UserDAO.update(id, matchingUser);

    // 5. SelectAll
    // const allUsers = await UserDAO.selectAll();
    // console.log('Users from DB = ');
    // console.log( allUsers );

 */
};