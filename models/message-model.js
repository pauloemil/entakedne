const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderID: {
    type: mongoose.ObjectId,
    required: true,
  },
  reciverID: {
    type: mongoose.ObjectId,
    required: true,
  },
  messageBody: {
    type: String,
    required: true,
  },
  Date: {
    type: Date,
    default: Date.now,
  },
  isFav: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Message", messageSchema, "message");
