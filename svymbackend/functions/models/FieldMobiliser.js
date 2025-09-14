// netlify/functions/models/FieldMobiliser.js
const mongoose = require("mongoose");

const fieldMobiliserSchema = new mongoose.Schema({
  userId: { type: String, unique: true }, // e.g., SVYMFM12345
  FieldMobiliserName: { type: String, required: true },
  FieldMobiliserEmailID: { type: String, required: true, unique: true },
  FieldMobiliserMobileNo: { type: String, required: true },
  FieldMobiliserRegion: { type: String, required: true },
  FieldMobiliserSupportedProject: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const FieldMobiliser = mongoose.model("FieldMobiliser", fieldMobiliserSchema);

module.exports = FieldMobiliser;
