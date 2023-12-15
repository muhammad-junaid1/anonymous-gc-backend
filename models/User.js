const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      required: true,
    },
    profile_picture: {
      type: String,
      required: false,
    },
    flow: {
      type: mongoose.Schema.ObjectId,
      ref: "Flow",
    },
    unreadCount: {
      type: Number, 
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

const model = mongoose.model("User", schema);

module.exports = model;
