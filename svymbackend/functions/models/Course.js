const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{5}$/, // must be 5-digit
  },
  courseName: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  durationMonths: {
    type: Number,
    required: true,
    min: 1,
  },
  moduleNames: {
    type: [String],
    required: true,
    validate: {
      validator: function (arr) {
        return arr.length > 0;
      },
      message: "At least one module name is required",
    },
  },
  trainerId: {
    type: String,
    default: null,
  },
  trainerName:{
    type: String,
    default: null,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    trim: true,
    required: true,
  },
  addedBy: {
    type: String, // userId of admin
    required: true,
  },
  courseStatus: {
    type: String,
    enum: ["Upcoming", "Ongoing", "Completed"],
    default: "Upcoming",
  },
  studentsEnrolled: {
    type: Number,
    default: 0, // starts with 0 students enrolled
    min: 0,
  },
}, { timestamps: true });

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
