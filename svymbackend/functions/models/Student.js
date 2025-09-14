// models/Admin.js
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  isSuper: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
