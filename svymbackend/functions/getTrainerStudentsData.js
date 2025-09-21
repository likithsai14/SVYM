const { connectDB } = require("./utils/mongodb");
const Course = require("./models/Course");
const StudentEnrollment = require("./models/StudentEnrollment");
const User = require("./models/User");

module.exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { trainerId } = JSON.parse(event.body);
    if (!trainerId) {
      return { statusCode: 400, body: "TrainerId is required" };
    }

    // Connect to DB
    await connectDB();

    // Fetch all courses for the trainer
    const courses = await Course.find({ trainerId }).select("courseId courseName");
    const courseIds = courses.map(c => c.courseId);

    // Fetch all enrollments for these courses
    const enrollmentsData = await StudentEnrollment.find({ courseId: { $in: courseIds } });

    // Map courseId to studentIds
    const enrollments = courses.map(course => {
      const studentsForCourse = enrollmentsData
        .filter(e => e.courseId === course.courseId)
        .map(e => e.studentId);
      return { courseId: course.courseId, studentIds: studentsForCourse };
    });

    // Get unique studentIds from all enrollments
    const studentIds = [...new Set(enrollmentsData.map(e => e.studentId))];

    // Fetch actual student details with all required fields
const students = await User.find({ userId: { $in: studentIds } }).select(
  "userId candidateName email course accountStatus approvalStatus fatherHusbandName villageName talukName districtName dob age gender tribal pwd aadharNumber candidatePhone parentPhone familyMembers qualification caste mobiliserName referralSource staffName supportedProject"
);


    return {
      statusCode: 200,
      body: JSON.stringify({
        courses,
        students,
        enrollments,
      }),
    };
  } catch (error) {
    console.error("Error in getTrainerData:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error", error: error.message }),
    };
  }
};
