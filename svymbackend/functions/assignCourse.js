const { connectDB } = require("./utils/mongodb");
const StudentEnrollment = require("./models/StudentEnrollment");

// Helper: Generate custom enrollment ID
function generateEnrollmentId(studentId, courseId) {
  const last5Student = studentId.slice(-5);
  return `EID${last5Student}${courseId}`;
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    await connectDB();

    const { courseId, courseName, studentId, totalPrice, fundedAmount } = JSON.parse(event.body);

    if (!courseId || !courseName || !studentId || totalPrice === undefined || fundedAmount === undefined) {
      return { statusCode: 400, body: JSON.stringify({ message: "All fields are required" }) };
    }

    // Check if student is already enrolled in any course
    const existingEnrollments = await StudentEnrollment.find({ studentId });
    if (existingEnrollments.length > 0) {
      return { statusCode: 400, body: JSON.stringify({ message: "Student is already enrolled in a course." }) };
    }

    // Validate inputs
    const coursePrice = Number(totalPrice);
    const funded = Number(fundedAmount);
    if (coursePrice < 0 || funded < 0 || funded > coursePrice) {
      return { statusCode: 400, body: JSON.stringify({ message: "Invalid course price or funded amount" }) };
    }

    // Calculate the amount to be paid by student: course price minus funded amount
    const amountToPay = coursePrice - funded;

    // Create enrollment
    const enrollmentId = generateEnrollmentId(studentId, courseId);
    await StudentEnrollment.create({
      enrollmentId,
      studentId,
      courseId,
      courseName,
      coursePrice,
      fundedAmount: funded,
      totalPrice: amountToPay, // amount to be paid by student
      amountPaid: 0,
      dueAmount: amountToPay,
      enrolledBy: "ADMIN",
      enrollmentDate: new Date(),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Course assigned successfully!", success: true }),
    };

  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
};
