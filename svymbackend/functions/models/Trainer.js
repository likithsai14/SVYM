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
}, {
  timestamps: true
});

module.exports = mongoose.models.Trainer || mongoose.model('Trainer', TrainerSchema);
