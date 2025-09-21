const { connectDB } = require("./utils/mongodb");
const StudentEnrollment = require("./models/StudentEnrollment");
const Transaction = require("./models/Transaction");
const mongoose = require("mongoose");

// Helper: Generate custom enrollment ID
function generateEnrollmentId(studentId, courseId) {
  const last5Student = studentId.slice(-5);
  return `EID${last5Student}${courseId}`;
}

// Helper: Generate custom transaction ID
function generateTransactionId(studentId) {
  const last5Student = studentId.slice(-5);
  const randomAlphaNum = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 random chars
  const timeDigits = Date.now().toString().slice(-6); // last 6 digits of timestamp
  return `TR${last5Student}${randomAlphaNum}${timeDigits}`;
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    await connectDB();

    const { courseId, courseName, studentId, totalPrice, amountPaid, paymentMethod } = JSON.parse(event.body);

    if (!courseId || !courseName || !studentId || !amountPaid || !paymentMethod) {
      return { statusCode: 400, body: JSON.stringify({ message: "All fields are required" }) };
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1️⃣ Create enrollment
      const enrollmentId = generateEnrollmentId(studentId, courseId);
      const enrollment = await StudentEnrollment.create([{
        enrollmentId,
        studentId,
        courseId,
        courseName,
        totalPrice,
        amountPaid,
        dueAmount: totalPrice - amountPaid,
        enrolledBy: studentId,
        enrollmentDate: new Date(),
      }], { session });

      // 2️⃣ Create transaction
      const transactionId = generateTransactionId(studentId);
      await Transaction.create([{
        transactionId,
        enrollmentId,
        amountPaid,
        paidTo: "SVYM12345",
        paymentMethod,
      }], { session });

      await session.commitTransaction();
      session.endSession();

      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: "Course applied and payment successful!", 
          enrollment: enrollment[0],
          transactionId
        }),
      };

    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error("Transaction failed, rolled back:", err);
      throw err;
    }

  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
};
