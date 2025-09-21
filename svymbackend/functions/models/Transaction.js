const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  enrollmentId: {
    type: String,  // links to studentEnrollment.enrollmentId
    required: true,
  },
  amountPaid: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  paidTo: {
    type: String,  // usually the admin, trainer, or field mobiliser who collected
    required: true,
  },
  paymentMethod: {              // NEW FIELD
    type: String,
    enum: ["Net Banking", "UPI", "Cash", "Card"],
    required: true,
  },
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
