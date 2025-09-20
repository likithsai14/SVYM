const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{5}$/ // must be 5-digit
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  moduleNames: {
    type: [String],
    required: true,
    validate: {
      validator: function (arr) {
        return arr.length > 0;
      },
      message: "At least one module name is required"
    }
  },
  trainerId: {
    type: String,
    default: null
  },
  addedBy: {
    type: String, // userId of admin
    required: true
  },
  courseStatus: {
    type: String,
    enum: ["Upcoming", "Ongoing", "Completed"],
    required: true
    }

}, { timestamps: true });

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
