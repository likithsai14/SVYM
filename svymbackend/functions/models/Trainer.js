const mongoose = require('mongoose');

const TrainerSchema = new mongoose.Schema({
  trainerId: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true},
  isFirstLogin: { type: Boolean, default: true },
  loginCount: { type: Number, default: 0 },
  email: { type: String },
  mobile: { type: String },
  name: { type: String, required: true },
  securityQuestion: { type: String, required: true },
  securityAnswer: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  expertise: { type: String, required: true },
}, {
  timestamps: true
});

TrainerSchema.pre('validate', function (next) {
  if (!this.email && !this.mobile) {
    this.invalidate('email', 'Either email or mobile must be provided.');
    this.invalidate('mobile', 'Either mobile or email must be provided.');
  }
  next();
});

module.exports = mongoose.models.Trainer || mongoose.model('Trainer', TrainerSchema);
