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

      // Normalize attendanceDate to UTC date-only (midnight) to avoid duplicates
      const parsedDate = new Date(attendanceDate);
      parsedDate.setUTCHours(0, 0, 0, 0);

      // Save or update (upsert) using normalized date
      const record = await Attendance.findOneAndUpdate(
        { trainerId, courseId, attendanceDate: parsedDate },
        { trainerId, courseId, attendanceDate: parsedDate, students },
        { upsert: true, new: true }
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Attendance saved successfully", record }),
      };
    }

    if (event.httpMethod === "GET") {
      // Fetch existing attendance or all attendance for admin reports
      const { trainerId, courseId, attendanceDate, courseId: courseFilter, month, year } = event.queryStringParameters || {};

      if (trainerId && courseId && attendanceDate) {
        // Original: Fetch specific attendance for trainer
        await connectDB();

        // Normalize query attendanceDate
        const parsedDate = new Date(attendanceDate);
        parsedDate.setUTCHours(0, 0, 0, 0);

        const record = await Attendance.findOne({ trainerId, courseId, attendanceDate: parsedDate });
        // console.log("record for : ", courseId, attendanceDate, record);
        return {
          statusCode: 200,
          body: JSON.stringify({ exists: !!record, record }),
        };
      } else if (courseFilter && month && year) {
        // New: Fetch all attendance for a course in a month/year for admin reports
        await connectDB();

        const start = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setUTCMonth(end.getUTCMonth() + 1);

        const records = await Attendance.find({
          courseId: courseFilter,
          attendanceDate: { $gte: start, $lt: end }
        }).lean();

        return {
          statusCode: 200,
          body: JSON.stringify({ attendance: records }),
        };
      } else {
        // No params: Return all attendance for counts
        await connectDB();

        const records = await Attendance.find({}).lean();
        return {
          statusCode: 200,
          body: JSON.stringify({ attendance: records }),
        };
      }
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
