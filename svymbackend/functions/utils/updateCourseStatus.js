const { connectDB } = require('./mongodb');
const Course = require('../models/Course');

async function updateCourseStatus(course) {
  await connectDB();
  const today = new Date();
  const start = new Date(course.startDate);
  const end = new Date(course.endDate);

  let newStatus = "Upcoming";
  if (today >= start && today <= end) {
    newStatus = "Ongoing";
  } else if (today > end) {
    newStatus = "Completed";
  }

  if (course.courseStatus !== newStatus) {
    course.courseStatus = newStatus;
    await course.save();
    return true; // status was updated
  }
  return false; // no change
}

async function updateCoursesStatus(courses) {
  await connectDB();
  const updatePromises = courses.map(course => updateCourseStatus(course));
  await Promise.all(updatePromises);
}

module.exports = { updateCourseStatus, updateCoursesStatus };
