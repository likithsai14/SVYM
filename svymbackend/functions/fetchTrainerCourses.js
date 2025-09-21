const { connectDB } = require("./utils/mongodb");
const Course = require("./models/Course");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method Not Allowed" }),
      };
    }

    // Connect to MongoDB
    await connectDB();

    // Parse request body
    const body = JSON.parse(event.body);
    const { trainerId } = body;

    if (!trainerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "trainerId is required" }),
      };
    }

    // Fetch all courses assigned to this trainer
    const courses = await Course.find({ trainerId });

    if (!courses || courses.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "No courses found for this trainer" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(courses),
    };
  } catch (error) {
    console.error("Error fetching trainer courses:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
