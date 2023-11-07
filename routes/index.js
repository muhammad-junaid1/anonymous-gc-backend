var express = require('express');
var router = express.Router();
const User = require("../models/User");

router.get("/profile", async (req, res) => {
  const user = await User.findOne({_id: req.user});
  res.json({
    status: true, 
    data: user 
  })
})


module.exports = router;
