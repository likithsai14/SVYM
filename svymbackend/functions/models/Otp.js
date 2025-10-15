const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Otp || mongoose.model('Otp', otpSchema);
