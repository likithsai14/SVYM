const { connectDB } = require('./mongodb');
const Course = require('../models/Course');

async function updateCourseStatus(course) {
  try {
    const today = new Date();
    const start = new Date(course.startDate);
    const end = new Date(course.endDate);

    // Handle invalid dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn(`Invalid dates for course ${course.courseId}: start=${course.startDate}, end=${course.endDate}`);
      return false;
    }

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
  } catch (error) {
    console.error(`Error updating status for course ${course.courseId}:`, error);
    return false;
  }
}

async function updateCoursesStatus(courses) {
  if (!courses || courses.length === 0) return;

  // Connect once
  await connectDB();

  // Process in batches to avoid overwhelming the DB
  const batchSize = 10;
  for (let i = 0; i < courses.length; i += batchSize) {
    const batch = courses.slice(i, i + batchSize);
    const updatePromises = batch.map(course => updateCourseStatus(course));
    await Promise.all(updatePromises);
  }
}

module.exports = { updateCourseStatus, updateCoursesStatus };
