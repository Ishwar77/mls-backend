module.exports = function () {
    const SavedFeed = require("../../app/models/savedFeed");
    const Feed = require("../../app/models/feed");

    const fed1 = new Feed('FeedTitle', 'http://feed-link.com', 'This is desc', new Date());

    const sav1 = new SavedFeed('101', '1020',fed1);

    const reqObj = {
        userId: "Some UserId",
        channelId: "Some ChannelId",
        feed: fed1,
        logo: "http://somelogo/",
        isActive: true,
        created: new Date(),
        updated_date: new Date(),
        inActive_from: null,
        dummyProp1: "dummyVal1",
        dummyProp2: "dummyVal2",
        dummyProp3: "dummyVal3",
    };

    console.log('SavedFeed1 = ', sav1);
    console.log('SavedFeed1 has Error = ', sav1.hasError());
    console.log('SavedFeed1 from ReqObj = ',  SavedFeed.getSavedFeedFromRequestObj(reqObj) );
    delete reqObj.feed;
    console.log('Updateable from ReqObj = ',  SavedFeed.getSavedFeedFromRequestObj(reqObj, true) );
}; 