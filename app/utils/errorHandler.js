const logger = require("./logger");
const process = require("process");

/**
 * To manage all uncaught errors and un handled promises
 */
module.exports = function() {
    process.on("uncaughtException", exc => {
        logger.error("The Application terminates due to an UnCaughtException", exc);
        process.exit(1);
    });
    
    process.on("unhandledRejection", rej => {
        logger.error("Caught an Unhandled Rejection Exception", rej);
        throw new Error(rej);
    });
};
