const JOI = require("joi");
JOI.objectId = require("joi-objectid")(JOI);
/** This JOI instance also supports ObjectId validation  */
module.exports = JOI;