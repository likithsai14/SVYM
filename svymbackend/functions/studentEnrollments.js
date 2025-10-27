const { connectDB } = require("./utils/mongodb");
const StudentEnrollment = require("./models/StudentEnrollment");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "GET") {
      return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    const { studentId } = event.queryStringParameters || {};
    if (!studentId) {
      return { statusCode: 400, body: JSON.stringify({ message: "Missing studentId parameter" }) };
    }

    // Connect to DB
    await connectDB();

    // Fetch all enrollments for the student
    const enrollments = await StudentEnrollment.find({ studentId }).select("-_id -__v");

    // Get unique courseIds from enrollments
    const courseIds = [...new Set(enrollments.map(e => e.courseId))];

    // Update course statuses if needed
    if (courseIds.length > 0) {
      const Course = require('./models/Course');
      const courses = await Course.find({ courseId: { $in: courseIds } });
      const { updateCoursesStatus } = require('./utils/updateCourseStatus');
      await updateCoursesStatus(courses);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(enrollments),
    };
  } catch (err) {
    console.error("Error fetching student enrollments:", err);
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};
