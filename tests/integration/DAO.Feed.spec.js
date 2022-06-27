const FeedDAO = require("../../app/daos/feed");
const SavedFeed = require("../../app/models/savedFeed");
const Feed = require("../../app/models/feed");

describe("DAO: FeedDAO", () => {
    describe("Must have utility methods", () => {
        // 1. Must have static methods to get Schema and Mongoose Model
     
        it('Should have Mongoose Schema Definition', () => {
            const schema = FeedDAO.getMongooseSchema();
            expect(schema).not.toBeNull();
        });

        it('Should have Mongoose Model Definition', () => {
            const model = FeedDAO.getMongooseModel();
            expect(model).not.toBeNull();
        });
    });

    describe("FeedDAO.create(feed)", () => {
        const FeedModel = FeedDAO.getMongooseModel();
        let feed, feedObj;
        beforeEach( () => {
            feedObj = new SavedFeed(
                '5d6a63e94cd93b03ccb3a72f', 
                '5d6a8dfe0062f223ac2300b2', 
                new Feed(
                    "High school student, 15, and postal worker among five dead, 21 injured in Odessa, Texas shooting",
                    "https://www.dailymail.co.uk/news/article-7416261/High-school-student-15-postal-worker-five-dead-21-injured-Odessa-Texas-shooting.html?ns_mchannel=rss&ito=1490&ns_campaign=1490", 
                    "Loved ones confirmed that Leila Hernandez was killed in Saturday's shooting in the neighboring cities of Midland and Odessa in West Texas. Leila's brother Nathan was also wounded in the rampage.",
                    "https://i.dailymail.co.uk/1s/2019/09/01/03/17926296-0-image-a-62_1567306241678.jpg",null, 
                    {  name:"Articles | Mail Online",url:"https://www.dailymail.co.uk/articles.rss",
                        domain:"https://www.dailymail.co.uk?ns_mchannel=rss&ito=1490&ns_campaign=1490",
                        logo:"https://i.dailymail.co.uk/i/furniture/mastHead_1_rss.png"
                    }
                )
             );
        });
        afterEach( () => {
            user = null;
           // new UserModel( {} );
        });

        it(`Should return a valid Feed Object`, async () => {
            feed = await FeedDAO.create( feedObj );
         //   console.log('Feed = ', feed);
            expect(feed._id).not.toBeUndefined();
        });

        // it(`Should throw error due to invalid property`, (function() {
        //     try {
        //         user = new UserModel( null );
        //         expect(user._id).not.toBeUndefined();
        //     } catch(e) {
        //         console.log(e);
        //     }
        // }));

    });

    describe(`FeedDAO.selectAll()`,  () => {
        it('Should get list of Users', () => {
             FeedDAO.selectAll().then(fds => {
                 console.log('Feeds = ', feds);
                 expect(fds).not.toBeNull();
            }).catch(e => {
                console.log("error = ", e);
            });
        });
    });


});