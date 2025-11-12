const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  addedBy: {
    type: String, // userId of admin
    required: true,
  },
}, { timestamps: true });

const Announcement = mongoose.model("Announcement", announcementSchema);

module.exports = Announcement;
