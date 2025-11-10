const mongoose = require('mongoose');

const TrainerSchema = new mongoose.Schema({
  trainerId: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true},
  isFirstLogin: { type: Boolean, default: true },
  loginCount: { type: Number, default: 0 },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  expertise: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  age: { type: Number, required: true },
  qualification: { type: String, required: true },
  address: { type: String, required: true },
  aadhaarNumber: { type: String, required: true, unique: true, trim: true },
  bankDetails: {
    accNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    bankName: { type: String, required: true },
    fullName: { type: String, required: true },
    branch: { type: String, required: true }
  },
  joiningDate: { type: Date },
  activeDate: { type: Date, default: Date.now },
  deactivateDate: { type: Date },
}, {
  timestamps: true
});

module.exports = mongoose.models.Trainer || mongoose.model('Trainer', TrainerSchema);
