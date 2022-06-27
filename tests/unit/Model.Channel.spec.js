const Channel = require("../../app/models/channel");

describe("Testing Model: 'Channel'", () => {

    describe("Channel()", () => {
        it("Should create an Object with no properties set", () => {
            const chnl = new Channel();
            expect(chnl).not.toBeNull();
            expect(chnl.name).toBeUndefined();
            expect(chnl.isActive).toBeTruthy();
            expect(chnl.hasError()).not.toBeNull();
        });
    });

    describe("Channel(name, url)", () => {
        it("Should create a Channel with basic properties", () => {
            const name = "AOL", url = "https://www.aol.com/rss";
            const chnl = new Channel(name, url);
            expect(chnl).not.toBeNull();
            expect(chnl.name).toMatch(name);
            expect(chnl.url).toMatch(url);
            expect(chnl.hasError()).toBeNull();
        });
    });

    describe("Channel(name, url, logo, isActive, added_date, updated_date, inActive_from)", () => {
        it("Should create a Channel with all the properties", () => {
            const chnl = new Channel('AOL', 'https://www.aol.com/rss', 'http://aol.com/', 'https://s.blogsmithmedia.com/www.aol.com/assets-haf54aba4f14d1a20a5ba8e9bc199ff79/images/nav/aol-logo-black.svg?h=c8ffe034a0bf85df974064577b2cde76');
            expect(chnl).not.toBeNull();
            expect(chnl.name).toMatch('AOL');
            expect(chnl.url).toMatch('https://www.aol.com/rss');
            expect(chnl.hasError()).toBeNull();
        });
    });

    describe("Channel's Utility functiona')", () => {
        let reqObj;
        beforeEach(() => {
            reqObj = {
                name: "Some Name",
                url: "http://someurl.com/feeds",
                domain: "http://someurl.com/",
                signup_date: new Date(),
                isActive: true,
                inActive_from: new Date(),
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
            const sch = Channel.getJOIValidationSchema();
            expect(sch).not.toBeNull();
            expect(sch.name).not.toBeNull();
            expect(sch.url).not.toBeNull();
        });

        it("Should fetch Channel object out of a complex object", () => {
            const chnl = Channel.getChannelFromRequestObj(reqObj);
            const chnl2 = Channel.getChannelFromRequestObj(null);
            expect(chnl2).toBeNull();
            
            expect(chnl).toBeInstanceOf(Channel);
            expect(chnl).not.toBeNull();
            expect(chnl.name).toMatch('Some Name');
        });

        it("Should fetch updateable Channel object out of a complex object", () => {
            const chnl = Channel.getChannelFromRequestObj(reqObj, true);
            expect(chnl).not.toBeNull();
            expect(chnl.name).toMatch('Some Name');
        });

    });

});
