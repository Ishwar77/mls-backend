const express = require("express");
const router = express.Router();
// const VisitDAO = require("./visits.dao");
// const Visit = require("./visits.model");
const logger = require("../utils/logger");
const Helper = require("../utils/helper");
const APIResponse = require("../models/apiResponse");
const AuthorizeMiddleware = require("../middlewares/authorize");

console.log("Router Loaded...!");

