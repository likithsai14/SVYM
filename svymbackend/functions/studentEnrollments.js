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

    return {
      statusCode: 200,
      body: JSON.stringify(enrollments),
    };
  } catch (err) {
    console.error("Error fetching student enrollments:", err);
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};
