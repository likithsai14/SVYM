const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  candidateName: String,
  fatherHusbandName: String,
  villageName: String,
  talukName: String,
  districtName: String,
  dob: String,
  age: Number,
  familyMembers: Number,
  qualification: String,
  caste: String,
  referralSource: String,
  staffName: String,
  gender: String,
  tribal: String,
  pwd: String,
  aadharNumber: String,
  candidatePhone: String,
  parentPhone: String,
  mobiliserName: String,
  supportedProject: String,
  email: { type: String, unique: true },
  password: String,
  isFirstLogin: { type: Boolean, default: true },
  loginCount: { type: Number, default: 0 },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
    },
accountStatus: {
    type: String,
    enum: ['active', 'inActive'],
    default: 'active'
    },
  createdAt: { type: Date, default: Date.now }
});

// Reuse the model if already compiled (prevents errors on Netlify/Lambda cold starts)
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
