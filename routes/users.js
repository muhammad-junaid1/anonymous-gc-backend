const express = require("express");
const router = express.Router();
const upload = require("../utils/multerStorage");
const User = require("../models/User");
const fs = require("fs");
const Flow = require("../models/Flow");
const {getUsers} = require("../users");
const path = require("path");

router.get("/", async (req, res) => {
  try {
    let allUsers = [];

    if (req.query["without-flow"] === "1") {
      allUsers = await User.find({
        role: 2,
        flow: { $exists: false },
      }).sort({
        createdAt: -1,
      });
    } else if(req.query["online"] === "1"){
      allUsers = getUsers()?.filter((user) => user?.role !== 1); 
    } else {
      allUsers = await User.find({ role: 2 }).sort({ createdAt: -1 });
    }

    res.json({
      status: true,
      data: allUsers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Couldn't fetch the user",
    });
  }
});

router.post("/", upload.single("file"), async (req, res) => {
  const uploadedFile = req.file;
  let fileURL = "";

  if (uploadedFile) {
    const fileName = uploadedFile?.filename?.toString()?.replaceAll(" ", "");
    fileURL = `${req.get("x-forwarded-proto") || req.protocol}://${
      req.get("x-forwarded-host") || req.get("host")
    }/assets/${fileName}`;
  }

  const newUser = new User({
    displayName: req.body.displayName,
    username: req.body.username,
    role: 2,
    password: req.body.password,
    profile_picture: fileURL,
  });

  try {
    await newUser.save();
    res.json({
      status: true,
      message: "The employee is created successfuly",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
});

router.post("/:userID", upload.single("file"), async (req, res) => {
  const uploadedFile = req.file;
  let fileURL = "";

  if (uploadedFile) {
    const fileName = uploadedFile?.filename?.toString()?.replaceAll(" ", "");
    fileURL = `${req.get("x-forwarded-proto") || req.protocol}://${
      req.get("x-forwarded-host") || req.get("host")
    }/assets/${fileName}`;
  }

  const updatedUser = {
    displayName: req.body.displayName,
    username: req.body.username,
    password: req.body.password,
  };

  if (fileURL) {
    updatedUser["profile_picture"] = fileURL;
  }

  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params?.userID },
      updatedUser
    );
    if (fileURL) {
      fs.unlink(
        path.join(
          __dirname,
          "../files/" +
            user?.profile_picture?.slice(
              user?.profile_picture.indexOf("assets/") + 7
            )
        ),
        (error) => {
          console.log(error);
        }
      );
    }
    res.json({
      status: true,
      message: "The employee is updated successfuly",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
});

router.delete("/:userID", async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.userID });
    if (user?.profile_picture) {
      fs.unlink(
        path.join(
          __dirname,
          "../files/" +
            user?.profile_picture?.slice(
              user?.profile_picture.indexOf("files/") + 7
            )
        ),
        (error) => {
          console.log(error);
        }
      );
    }

    res.json({
      status: true,
      message: "The user has been deleted successfuly",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Couldn't delete the user",
    });
  }
});

module.exports = router;
