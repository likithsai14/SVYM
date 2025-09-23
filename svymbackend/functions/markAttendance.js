const { connectDB } = require("./utils/mongodb");
const Attendance = require("./models/Attendance");

module.exports.handler = async (event) => {
  try {
    if (event.httpMethod === "POST") {
      // Save or update attendance
      const { trainerId, courseId, attendanceDate, students } = JSON.parse(event.body);

      if (!trainerId || !courseId || !attendanceDate || !Array.isArray(students)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "trainerId, courseId, attendanceDate and students[] are required" }),
        };
      }

      await connectDB();

      // Save or update (upsert)
      const record = await Attendance.findOneAndUpdate(
        { trainerId, courseId, attendanceDate },
        { trainerId, courseId, attendanceDate, students },
        { upsert: true, new: true }
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Attendance saved successfully", record }),
      };
    }

    if (event.httpMethod === "GET") {
      // Fetch existing attendance
      const { trainerId, courseId, attendanceDate } = event.queryStringParameters;

      if (!trainerId || !courseId || !attendanceDate) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "trainerId, courseId, and attendanceDate are required" }),
        };
      }

      await connectDB();

      const record = await Attendance.findOne({ trainerId, courseId, attendanceDate });
      // console.log("record for : ", courseId, attendanceDate, record);
      return {
        statusCode: 200,
        body: JSON.stringify({ exists: !!record, record }),
      };
    }

    return { statusCode: 405, body: "Method Not Allowed" };
  } catch (error) {
    console.error("Error in markAttendance:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error", error: error.message }),
    };
  }
};
