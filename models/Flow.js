const mongoose = require("mongoose"); 

const schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true, 
    },
    recipients: {
        type: [mongoose.Schema.ObjectId], 
        ref: "User",
        default: undefined
    }
}, {timestamps: true});

const model = mongoose.model("Flow", schema);
module.exports = model;