module.exports = async function () {
    const Channel = require("../../app/models/channel");

    const ch1 = new Channel("VH1", "http://vh1.com");
    const ch2 = new Channel("TOI", "https://timesofindia.indiatimes.com/rssfeeds/2039512487.cms", "https://timesofindia.indiatimes.com/");

    const reqObj = {
        name: "Some Name",
        url: "http://someurl/",
        domain: "http://domain/",
        logo: "http://somelogo/",
        isActive: true,
        added_date: new Date(),
        updated_date: new Date(),
        inActive_from: null,
        dummyProp1: "dummyVal1",
        dummyProp2: "dummyVal2",
        dummyProp3: "dummyVal3",
    };

    // console.log("Channel 1 = ", ch1);
    // console.log("Channel 1 hasError() = ", ch1.hasError());

    // console.log("Channel 2 = ", ch2);
    // console.log("Channel 2 hasError() = ", ch2.hasError());

    // console.log('Getting Channel Obj = ', Channel.getChannelFromRequestObj(reqObj));

    delete reqObj.domain;
    // console.log('Getting updateable Channel Obj = ', Channel.getChannelFromRequestObj(reqObj, true));

    // DB Operations Test w.r.t. UserDAO
    console.log('DB Operations Test w.r.t. ChannelDAO');
    const Helper = require("../../app/utils/helper");
    const db = ['mongodb', 'mongodb-mlab'];
    Helper.connectToDb(db[0]);

    const ChannelDAO = require("../../app/daos/channel");
    console.log(ch1 instanceof Channel);

    // 1. Create
    // const newChnl = ChannelDAO.create(ch2);
    // console.log("newChnl = ", newChnl);

    // 2. SelectAll
    const channels = await ChannelDAO.selectAll();
    console.log('Channels = ', channels);

    // // SelectById()
    // const id = "5d6a8e7662a9371c94e65e14";
    // const match = await ChannelDAO.selectById(id);
    // console.log('Matching Channels = ', match);

    // // UpdateById()
    // const id = "5d6a8e7662a9371c94e65e14";
    // ch1.name = "AOL", ch1.url = "https://www.aol.com/rss/", ch1.domain = "https://www.aol.com/", ch1.logo="https://s.blogsmithmedia.com/www.aol.com/assets-h7c67bd2d5994c7ee4182421f5f2a65ab/images/nav/aol-logo-black.svg?h=c8ffe034a0bf85df974064577b2cde76";
    // const updated = await ChannelDAO.update(id, ch1);
    // console.log('Matching Channels = ', updated);

    // Delete()
    const id = "5d6a8e4e9a652219303fd0db";
    const deleted = await ChannelDAO.deleteById(id);
    console.log( deleted ? `Deleted = , ${deleted}` : 'No matching Channel...!');







};