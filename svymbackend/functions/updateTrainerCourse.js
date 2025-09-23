// File: netlify/functions/updateTrainerCourse.js

const { connectDB } = require("./utils/mongodb");
const Course = require("./models/Course");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { 
        statusCode: 405, 
        body: JSON.stringify({ message: "Method Not Allowed" }) 
      };
    }

    // Connect to MongoDB
    await connectDB();

    const body = JSON.parse(event.body);
    const { courseId, startDate, endDate, description, moduleNames } = body;

    // Validation
    if (!courseId || !startDate || !endDate || !moduleNames || moduleNames.length === 0 || !description) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ message: "All fields are required" }) 
      };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (start < today) {
      return { statusCode: 400, body: JSON.stringify({ message: "Start date cannot be in the past" }) };
    }

    if (end < start) {
      return { statusCode: 400, body: JSON.stringify({ message: "End date must be after Start date" }) };
    }

    // Calculate duration in months
    const durationMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;

    // Find course
    const course = await Course.findOne({ courseId });
    if (!course) {
      return { statusCode: 404, body: JSON.stringify({ message: "Course not found" }) };
    }

    // Update fields
    course.startDate = start;
    course.endDate = end;
    course.durationMonths = durationMonths;
    course.description = description;
    course.moduleNames = moduleNames;
    course.updatedAt = new Date();

    await course.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Course updated successfully", course })
    };

  } catch (error) {
    console.error("Error updating course:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
