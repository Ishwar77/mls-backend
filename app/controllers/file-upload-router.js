const express = require("express");
const router = express.Router();
// const homeController = require("./home");
const uploadController = require("./file-upload");

let routes = app => {
  // router.get("/", homeController.getHome);

  router.post("/multiple-upload", uploadController.multipleUpload);

  router.get("/files/:name", uploadController.download);

  return app.use("/", router);
};

module.exports = routes;