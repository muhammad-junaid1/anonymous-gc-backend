var express = require("express");
var router = express.Router();
const User = require("../models/User");
const multer = require("multer");
const path = require("path");

class UserData {
  constructor(data){
    this.username = data?.username; 
    this.role = data?.role; 
    this.profile_picture = data?.profile_picture;
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "files/");
  },
  filename: (req, file, cb) => {
    cb(null, req.user + "_" + file.originalname?.toString()?.replaceAll(" ", ""));
  },
});

const upload = multer({ storage });

router.get("/profile", async (req, res) => {
  const user = await User.findOne({ _id: req.user });

  const data = new UserData(user);
  res.json({
    status: true,
    data,
  });
});

router.post("/profile", async (req, res) => {
  await User.findOneAndUpdate({_id: req.user}, {
    username: req.body.username
  });

  const updated = await User.findOne({_id: req.user});

  const data = new UserData(updated);
  res.json({
    status: true, 
    message: "User updated successfuly", 
    data
  });
})

router.post("/upload-file", upload.single("file"), async (req, res) => {
  const uploadedFile = req.file; 
  const fileName = uploadedFile.filename?.toString()?.replaceAll(" ", ""); 
  const fileURL = `${req.get('x-forwarded-proto') || req.protocol}://${req.get('x-forwarded-host') || req.get('host')}/images/${fileName}`;

  await User.findOneAndUpdate({_id: req.user}, {
    profile_picture: fileURL
  });
  res.json();
});

module.exports = router;
