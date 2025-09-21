const { connectDB } = require("./utils/mongodb");
const Course = require("./models/Course");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    // Connect to DB
    await connectDB();

    const body = JSON.parse(event.body);
    const { courseName, price, startDate, endDate, duration, moduleNames, location, description, addedBy } = body;

    // Validation
    if (!courseName || !price || !startDate || !endDate || !moduleNames || moduleNames.length === 0 ||
        !location || !description || !addedBy || !duration) {
      return { statusCode: 400, body: JSON.stringify({ message: "All fields are required" }) };
    }

    // Check if startDate is not in the past
    const today = new Date();
    const start = new Date(startDate);
    if (start < today.setHours(0,0,0,0)) {
      return { statusCode: 400, body: JSON.stringify({ message: "Start date cannot be in the past" }) };
    }

    // Generate unique 5-digit courseId
    let courseId;
    let existing;
    do {
      courseId = Math.floor(10000 + Math.random() * 90000).toString();
      existing = await Course.findOne({ courseId });
    } while (existing);

    // Determine courseStatus
    let courseStatus = "Upcoming";
    const end = new Date(endDate);
    if (today >= start && today <= end) {
      courseStatus = "Ongoing";
    } else if (today > end) {
      courseStatus = "Completed";
    }

    const newCourse = new Course({
      courseId,
      courseName,
      price,
      startDate,
      endDate,
      durationMonths: duration,
      moduleNames,
      location,
      description,
      addedBy,
      courseStatus,
      trainerId: null,  
      trainerName: null,       // initially unassigned
      studentsEnrolled: 0,     // initially 0
    });

    await newCourse.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Course added successfully", course: newCourse }),
    };
  } catch (error) {
    console.error("Error adding course:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
