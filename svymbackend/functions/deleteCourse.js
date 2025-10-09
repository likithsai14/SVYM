const Course = require("./models/Course");
const { connectDB } = require("./utils/mongodb");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method Not Allowed" }),
      };
    }

    await connectDB();

    const { courseId } = JSON.parse(event.body);
    if (!courseId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing courseId in request body" }),
      };
    }

    const existingCourse = await Course.findOne({ courseId });
    if (!existingCourse) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Course not found" }),
      };
    }

    await Course.deleteOne({ courseId });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Course deleted successfully",
        deletedCourseId: courseId,
      }),
    };
  } catch (err) {
    console.error("Error in deleteCourse:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Internal Server Error: ${err.message}` }),
    };
  }
};
