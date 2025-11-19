const mongoose = require("mongoose");

const placementSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true,
  },
  alumniName: {
    type: String,
    required: true,
    trim: true,
  },
  parentSpouseName: {
    type: String,
    required: true,
    trim: true,
  },
  trainingName: {
    type: String,
    required: true,
    trim: true,
  },
  completionDate: {
    type: Date,
    required: true,
  },
  isPlaced: {
    type: Boolean,
    required: true,
  },
  jobPlace: {
    type: String,
    required: function() { return this.isPlaced; },
    trim: true,
  },
  earningPerMonth: {
    type: String, // Changed to String to allow "nil" or ranges
    required: function() { return this.isPlaced; },
  },
  employmentType: {
    type: String,
    required: function() { return this.isPlaced; },
  },
  followUpBy: {
    type: String,
    required: true,
    trim: true,
  },
  addedBy: {
    type: String, // userId of admin
    required: true,
  },
}, { timestamps: true });

const Placement = mongoose.model("Placement", placementSchema);

module.exports = Placement;
