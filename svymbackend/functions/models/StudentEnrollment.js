const mongoose = require("mongoose");

const studentEnrollmentSchema = new mongoose.Schema({
  enrollmentId: {
    type: String,  // unique ID for each enrollment
    required: true,
    unique: true,
  },
  studentId: {
    type: String,  // refers to users.userId
    required: true,
  },
  courseId: {
    type: String,  // refers to courses.courseId
    required: true,
  },
  courseName: {
    type: String,
    required: true,
  },
  // Original course price (not necessarily paid by student)
  coursePrice: {
    type: Number,
    default: 0,
    min: 0,
  },
  // Donor funded amount for the course
  fundedAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  // For clarity and enforcement at runtime; max number of installments allowed
  maxInstallments: {
    type: Number,
    default: 4,
    min: 1,
  },
  // Student amount to pay (coursePrice - fundedAmount); kept as totalPrice for backward compatibility
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0,
  },
  dueAmount: {
    type: Number,
    default: function() { return this.totalPrice - this.amountPaid; },
    min: 0,
  },
  enrolledBy: {
    type: String,  // "SELF" or field mobiliser's userId
    required: true,
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Ensure derived fields stay consistent before validation/save
studentEnrollmentSchema.pre("validate", function(next) {
  const cp = typeof this.coursePrice === "number" ? this.coursePrice : 0;
  const fa = typeof this.fundedAmount === "number" ? this.fundedAmount : 0;

  if (cp >= 0 && fa >= 0) {
    const studentAmount = Math.max(0, cp - fa);
    if (typeof this.totalPrice !== "number" || this.totalPrice !== studentAmount) {
      this.totalPrice = studentAmount;
    }
  }

  if (typeof this.amountPaid === "number" && typeof this.totalPrice === "number") {
    this.dueAmount = Math.max(0, this.totalPrice - this.amountPaid);
  }
  next();
});

const StudentEnrollment = mongoose.model("StudentEnrollment", studentEnrollmentSchema);
module.exports = StudentEnrollment;
