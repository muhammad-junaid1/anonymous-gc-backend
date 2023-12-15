const mongoose = require("mongoose"); 

const schema = new mongoose.Schema({
     type: {
        type: String, 
        required: true
     },
      content: {
        type: String, 
      },
      from: {
        type: mongoose.Schema.ObjectId, 
        ref: "User", 
        required: true,
      },
      recipients: {
        type: [mongoose.Schema.ObjectId], 
        ref: "User", 
        required: true
      },
      image: {
        type: String, 
      }
}, {timestamps: true});

const model = mongoose.model("Message", schema);
module.exports = model;