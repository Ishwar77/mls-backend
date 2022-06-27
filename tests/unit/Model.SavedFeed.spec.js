const SavedFeed = require("../../app/models/savedFeed");
const Feed = require("../../app/models/feed");

describe("Testing Model: 'SavedFeed'", () => {
    describe("SavedFeed()", () => {
        it("Should create an Object with no properties set", () => {
            const sav = new SavedFeed();
            expect(sav).not.toBeNull();
            expect(sav.userId).toBeUndefined();
            expect(sav.isActive).toBeTruthy();
            expect(sav.hasError()).not.toBeNull();
        });
    });

    describe("SavedFeed(userId, channelId, feed)", () => {
        it("Should create a SavedFeed with basic properties", () => {
            const userId = "5d6786002346abc86e692ba6", channelId = "5d678618b639106e06e06bd3";
            const feed = new Feed('FeedTitle', 'http://feed-link.com', 'This is desc', new Date());
            const sav = new SavedFeed(userId, channelId, feed) ;

            expect(sav).not.toBeNull();
            expect(sav.userId).toMatch(userId);
            expect(sav.channelId).toMatch(channelId);
            expect(sav.feed).not.toBeNull();
            expect(sav.feed).toMatchObject(feed);

            expect(sav.hasError()).toBeNull();
        });
    });

    describe("SavedFeed's Utility functiona')", () => {
        let reqObj;
        beforeEach(() => {
            reqObj = {
                userId: "5d6786002346abc86e692ba6",
                channelId:"5d678618b639106e06e06bd3",
                feed: new Feed('FeedTitle', 'http://feed-link.com', 'This is desc', new Date()),
                created: new Date(),
                isActive: true,
                inActive_from: null,
                channels: [1, 2, 3, 4],
                dummyProp1: "dummyVal1",
                dummyProp2: "dummyVal2",
                dummyProp3: "dummyVal3",
            };
        });
        afterEach( () => {
            reqObj = null;
        });
        it("Should have a validator Schema", () => {
            const sch = SavedFeed.getJOIValidationSchema();
            expect(sch).not.toBeNull();
            expect(sch.userId).not.toBeNull();
            expect(sch.feed).not.toBeNull();
        });

        it("Should fetch Channel object out of a complex object", () => {
            const sav = SavedFeed.getSavedFeedFromRequestObj(reqObj);
            const sav2 = SavedFeed.getSavedFeedFromRequestObj();
            expect(sav2).toBeNull();
            expect(sav).toBeInstanceOf(SavedFeed);
            expect(sav).not.toBeNull();
            expect(sav.feed).toMatchObject(reqObj.feed);
        });

        it("Should fetch updateable Channel object out of a complex object", () => {
            const chnl = SavedFeed.getSavedFeedFromRequestObj(reqObj, true);
            expect(chnl).not.toBeNull();
            expect(chnl.feed).toMatchObject(reqObj.feed);
        });

    });

});