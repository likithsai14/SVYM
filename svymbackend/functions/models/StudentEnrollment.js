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

const StudentEnrollment = mongoose.model("StudentEnrollment", studentEnrollmentSchema);
module.exports = StudentEnrollment;
