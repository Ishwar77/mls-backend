const upload = require("../middlewares/upload");

const multipleUpload = async (req, res) => {
  try {
    await upload(req, res);
    console.log(req.files);

    if (req.files.length <= 0) {
      return res.send(`You must select at least 1 file.`);
    }

    res.status(200).send({
      status: "Success",
      message: "Uploaded the file successfully: ",
      metadata: req.files
    });
  } catch (error) {
    console.log(error);

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.send("Too many files to upload.");
    }
    return res.send(`Error when trying upload many files: ${error}`);
  }
};

const download = (req, res) => {
  const fileName = req.params.name;
  console.log("fileName ", fileName);
  const directoryPath = __basedir + "/resources/uploads/";
  console.log("directoryPath ", directoryPath);
  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};

module.exports = {
  multipleUpload: multipleUpload,
  download: download
};