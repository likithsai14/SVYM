// netlify/functions/getStudentFees.js

const { connectDB } = require("./utils/mongodb");
const StudentEnrollment = require("./models/StudentEnrollment");
const Transaction = require("./models/Transaction");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    await connectDB();

    const { studentId } = JSON.parse(event.body);

    if (!studentId) {
      return { statusCode: 400, body: JSON.stringify({ message: "studentId is required" }) };
    }

    // Fetch all enrollments of the student
    const enrollments = await StudentEnrollment.find({ studentId });

    // Prepare fee records with transaction data
    const feeRecords = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Fetch all transactions for this enrollment
        const transactions = await Transaction.find({ enrollmentId: enrollment.enrollmentId });

        const payments = transactions.map(tx => ({
          date: tx.createdAt || tx._id.getTimestamp(), // fallback if no explicit date
          amount: tx.amountPaid,
          method: tx.paymentMethod,
          transactionId: tx.transactionId, // key for frontend operations
        }));

        return {
          id: enrollment.enrollmentId,
          courseId: enrollment.courseId,
          courseName: enrollment.courseName, // assuming this field exists in StudentEnrollment
          totalAmount: enrollment.totalPrice,
          payments,
          amountPaid: payments.reduce((sum, p) => sum + p.amount, 0),
          dueAmount: enrollment.totalPrice - payments.reduce((sum, p) => sum + p.amount, 0)
        };
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify(feeRecords),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
};
