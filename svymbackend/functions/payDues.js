const { connectDB } = require("./utils/mongodb");
const StudentEnrollment = require("./models/StudentEnrollment");
const Transaction = require("./models/Transaction");
const mongoose = require("mongoose");

// Helper: Generate custom transaction ID
function generateTransactionId(studentId) {
  const last5Student = (studentId || '').slice(-5);
  const randomAlphaNum = Math.random().toString(36).substring(2, 5).toUpperCase();
  const timeDigits = Date.now().toString().slice(-6);
  return `TR${last5Student}${randomAlphaNum}${timeDigits}`;
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    await connectDB();

    const { studentId, courseId, amount, paymentMethod } = JSON.parse(event.body);

    if (!studentId || !courseId || !amount || !paymentMethod) {
      return { statusCode: 400, body: JSON.stringify({ message: 'studentId, courseId, amount and paymentMethod are required' }) };
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find enrollment
      const enrollment = await StudentEnrollment.findOne({ studentId, courseId }).session(session);
      if (!enrollment) {
        await session.abortTransaction();
        session.endSession();
        return { statusCode: 404, body: JSON.stringify({ message: 'Enrollment not found for this student and course' }) };
      }

      // Update enrollment amounts
      const amt = Number(amount);
      enrollment.amountPaid = (enrollment.amountPaid || 0) + amt;
      enrollment.dueAmount = Math.max(0, (enrollment.totalPrice || 0) - enrollment.amountPaid);
      await enrollment.save({ session });

      // Create transaction
      const transactionId = generateTransactionId(studentId);
      await Transaction.create([{
        transactionId,
        enrollmentId: enrollment.enrollmentId,
        amountPaid: amt,
        paidTo: 'SVYM12345',
        paymentMethod: paymentMethod
      }], { session });

      await session.commitTransaction();
      session.endSession();

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Payment recorded successfully', transactionId, enrollmentId: enrollment.enrollmentId })
      };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error('Error in payDues transaction:', err);
      throw err;
    }

  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
};
