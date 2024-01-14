const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("./files/"));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      req.user + "_" + file.originalname?.toString()?.replaceAll(" ", "")
    );
  },
});

const upload = multer({ storage });
module.exports = upload;