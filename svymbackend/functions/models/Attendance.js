const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  courseId: { type: String, required: true },          // links to Course.courseId
  trainerId: { type: String, required: true },         // trainer taking the session
  attendanceDate: { type: Date, required: true },      // date of the class/session
  students: [
    {
      studentId: { type: String, required: true },     // links to users.userId
      studentName: { type: String, required: true },   // store name for quick reporting
      present: { type: Boolean, default: false },
      remarks: { type: String, trim: true, default: "" },
    }
  ],
}, { timestamps: true });

// Indexes for common queries and uniqueness to avoid duplicate session rows
attendanceSchema.index({ trainerId: 1, courseId: 1, attendanceDate: 1 }, { unique: true });
attendanceSchema.index({ 'students.studentId': 1 });

module.exports = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
