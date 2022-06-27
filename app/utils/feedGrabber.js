const Channel = require("../models/channel");
const logger = require("./logger");
const request = require("request");
const parser = require('xml-js');
const Feed = require('../models/feed');
/**
 * Intented to Get feeds from a given channel, append processed feeds into those channels
 * 
 * 1. Initial Settings
 *  1.1. How often to get updates from each channels
 *  1.2. Channel limit
 */
class FeedGrabber {
    /**
     * To create an instance
     * @param channels Channel[], List of channels from where feeds need to fetched
     * @param channelLimit Number DEFAULT 10, represents the max number of channels supported
     * @param updateFrequence Number DEFAULT 30 (every 30seconds), represented in seconds, how often to get auto updates (if set to 0, no auto update)
     */
    constructor(channels, channelLimit = 10, updateFrequence = 30) {
        if (!channels || !channels.length) throw new Error();

        this.channels = channels;
        this.channelLimit = channelLimit;
        this.updateFrequence = updateFrequence;
    }

    /**
     * To process the given channel, gathers feeds and returns it.
     * @param channel Channel, The source from where feed data to be fetched
     * @return Channel, an updated channel with feed property
     */
    async processChannel(channel = null) {
        if (!channel || !this.channels || !this.channels.length) throw new Error("No valid Channel found...!");

        const src = channel ? channel : this.channels[0];

        if (!src || !src.url) throw new Error(`RSS feed path not configured for Channel ${src.name}`);
        const start = new Date().getTime();
        const data = await this.getFeedFrom(src.url);

        if (!data || !data.length) throw new Error("No Feeds found in Channel ", src.name);

        const parsed = this.xmlToJson(data);
        // console.log('Data = ',   parsed);
        const channelRaw = parsed.rss.channel;

       // delete channelRaw.item; // delete huge list of feeds for now

     //   console.log('channel Raw = ', channelRaw);
     //   console.log('channel Props = ', Object.getOwnPropertyNames(channelRaw));
        const channelObj = this.fetchChannelInfo(channelRaw, src.url);

        if (!channelObj) throw new Error("Unable to get Channel information for ", src.name);
        channelObj['feeds'] = this.fetchFeeds(channelRaw.item, Channel.getEmbeddableInfo(channelObj)) || [];

        if (!channelObj['feeds'] || !channelObj['feeds'].length) throw new Error("No new feeds in the Channel ", src.name, " at this time");

     //   console.log('Channel Obj = ', channelObj);

       // logger.info("Processed Feed data = ", channelObj);

        // get feeds from the body  
        const end = new Date().getTime();
        console.log('Time took = ', end - start, 'mili sec');
        return channelObj;
    }

    /**
     * Accepts Raw feeds array and returns Feed[]
     * @param rawFeeds any[]
     * @param channelEmbedObj Channel OPTIONAL any embeddable info
     * @returns Feed[]
     */
    fetchFeeds(rawFeeds, channelEmbedObj = null) {
        if(!rawFeeds || !rawFeeds.length) return null;
        const feeds = [];

        try {
            rawFeeds.forEach(rawFeed => {
               // console.log(`Raw Feed ${i++} = `, rawFeed);
                const title = rawFeed.title._text ? rawFeed.title._text : rawFeed.title._cdata ? rawFeed.title._cdata : '';
                const pubDate = rawFeed.pubDate._text.trim() || new Date().getTime();
                const description = rawFeed.description._text ? rawFeed.description._text : rawFeed.description._cdata ? rawFeed.description._cdata : '';
                
                const image = 
                    rawFeed['media:thumbnail'] ? 
                        rawFeed['media:thumbnail']['_attributes'] ? 
                            rawFeed['media:thumbnail']['_attributes']['url'].trim() : 
                        null : 
                    rawFeed['media:content'] ? 
                        rawFeed['media:content']['_attributes'] ?
                            rawFeed['media:content']['_attributes']['url'] :
                            null :
                        null
                    ;
                const feed = new Feed( title.trim(), rawFeed.link._text.trim(), description.trim(), image  , new Date(pubDate), channelEmbedObj );
                feeds.push(feed);
            });
        } catch(e) {
            logger.error("Failed to process RawFeedObject", e);
        }

        return feeds;
    }



    /**
     * To fetch channel info from Raw object
     * @param rawChannelData any
     * @return Channel 
     */
    fetchChannelInfo(rawChannelData, feedUrl = null) {
        if (!rawChannelData) return null;

        let raw = null;
        try {
            const buildDate = rawChannelData.pubDate ? rawChannelData.pubDate._text :
            rawChannelData.lastBuildDate ? rawChannelData.lastBuildDate._text : '' ;

            raw = {
                name: rawChannelData.title._text.trim(),
                domain: rawChannelData.link.length ? rawChannelData.link[0]._text.trim() : rawChannelData.link._text.trim(),
                url: feedUrl,
                logo: rawChannelData.image.url._text.trim(),
                added_date: buildDate && buildDate.length ?  new Date(buildDate.trim()) : new Date(),
            };
        } catch (e) {
            logger.error("Fetching Channel properties from Raw data failed", e);
        }

        return raw ? Channel.getChannelFromRequestObj(raw) : null;
    }

    /** To convert Xml data to Javascript object */
    xmlToJson(xmlData) {
        if (!xmlData) return null;

        const docObj = parser.xml2js(xmlData, { compact: true, spaces: 4 });

        // requires further processing, before returning

        return docObj;
    }

    /**
     * Async function to make a request to given Feed source and returns the body 
     * @param url String
     * @return Promise 
     */
    async getFeedFrom(url) {
        if (!url) throw new Error("RSS Feed URL not found...!");
       // console.log('Fetching feeds from ', url);

        return new Promise((resolve, reject) => {
            request(url, (err, res, body) => {
                if (err) {
                    reject(`Failed to fetch feeds for Channel @ ${url}`);
                    return false;
                }
                resolve(body || res);
            });
        });
    }

}

module.exports = FeedGrabber;