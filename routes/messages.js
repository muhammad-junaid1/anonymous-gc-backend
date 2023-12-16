const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");

router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req?.user);
    let messages = [];
    if (user?.role === 1) {
      messages = await Message.find()
        .populate("from")
        .populate("recipients")
        .exec();
    } else {
      messages = await Message.find({ from: user?._id })
        .populate("from")
        .populate("recipients")
        .exec();
      messages = await Message.find({
        $or: [{ from: user?._id }, { recipients: user?._id }],
      })
        .populate("from")
        .populate("recipients")
        .exec();
    }
    res.json({
      status: true,
      data: messages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
});

router.post("/:id", async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, {
      recipients: req.body?.recipients,
    });
    const updatedMessage = await Message.findById(req.params.id)
      ?.populate("recipients")
      .populate("from")
      .exec();
    res.json({
      status: true,
      data: updatedMessage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
});


module.exports = router;
