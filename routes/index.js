var express = require("express");
var router = express.Router();
const User = require("../models/User");
const upload = require("../utils/multerStorage");
const fs = require("fs"); 
const path = require("path");

class UserData {
  constructor(data) {
    this._id = data?._id,
    this.username = data?.username;
    this.role = data?.role;
    this.unreadCount = data?.unreadCount;
    this.profile_picture = data?.profile_picture;
    this.displayName = data?.displayName;
  }
}

router.get("/profile", async (req, res) => {
  const user = await User.findOne({ _id: req.user });

  const data = new UserData(user);
  res.json({
    status: true,
    data,
  });
});

router.post("/profile", async (req, res) => {
  await User.findOneAndUpdate({ _id: req.user }, req.body);

  const updated = await User.findOne({ _id: req.user });

  const data = new UserData(updated);
  res.json({
    status: true,
    message: "User updated successfuly",
    data,
  });
});

router.post("/upload-file", upload.single("file"), async (req, res) => {

  try {

    const uploadedFile = req.file;
    const fileName = uploadedFile.filename?.toString()?.replaceAll(" ", "");
    const fileURL = `${req.get("x-forwarded-proto") || req.protocol}://${
      req.get("x-forwarded-host") || req.get("host")
    }/assets/${fileName}`;
  
    const user = await User.findOneAndUpdate(
      { _id: req.user },
      {
        profile_picture: fileURL,
      }
    );
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
    res.json({
      status: true, 
      data: {...user, profile_picture: fileURL}
    });
  }
  catch(error) {
    console.log(error);
    res.status(500).json({
      status: false, 
      message: "Something went wrong"
    })
  }
});

module.exports = router;
