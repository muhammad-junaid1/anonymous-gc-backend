const express = require("express");
const router = express.Router();
const Flow = require("../models/Flow");
const User = require("../models/User");

router.get("/", async (req, res) => {
  try {
    const flows = await Flow.find().populate("user").exec();
    console.log(flows);
    res.json({
      status: true,
      data: flows,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { user, recipients } = req.body;

    const newFlow = new Flow({
      user,
      recipients,
    });
    const flow = await newFlow.save();
    await User.findByIdAndUpdate(user, {
      flow: flow?._id
    }) 
    res.json({
      status: true,
      message: "The flow is created successfully",
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
