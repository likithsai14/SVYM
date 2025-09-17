// netlify/functions/models/FieldMobiliser.js
const mongoose = require("mongoose");

const fieldMobiliserSchema = new mongoose.Schema({
  userId: { type: String, unique: true }, // e.g., SVYMFM12345
  FieldMobiliserName: { type: String, required: true },
  FieldMobiliserEmailID: { type: String, required: true, unique: true },
  FieldMobiliserMobileNo: { type: String, required: true },
  FieldMobiliserRegion: { type: String, required: true },
  FieldMobiliserSupportedProject: { type: String, required: true },
  addedBy: { type: String, required: true },
  password: { type: String, required: true },
  isFirstLogin: { type: Boolean, default: true },
  accountStatus: {
    type: String,
    enum: ["active", "inActive"],
    default: "active",
  },
  loginCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// ✅ Prevent OverwriteModelError in Netlify hot reload
module.exports =
  mongoose.models.FieldMobiliser ||
  mongoose.model("FieldMobiliser", fieldMobiliserSchema);
