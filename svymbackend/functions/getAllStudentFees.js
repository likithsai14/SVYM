// netlify/functions/getAllStudentFees.js

const { connectDB } = require("./utils/mongodb");
const StudentEnrollment = require("./models/StudentEnrollment");
const Transaction = require("./models/Transaction");
const User = require("./models/User");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "GET") {
      return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    await connectDB();

    // Fetch all enrollments
    const enrollments = await StudentEnrollment.find();

    // Map to store students
    const studentsMap = {};

    for (const enrollment of enrollments) {
      const studentId = enrollment.studentId;
      const courseId = enrollment.courseId;
      const courseName = enrollment.courseName;

      // Fetch student info once
      let studentName = "-";
      if (!studentsMap[studentId]) {
        const student = await User.findOne({ userId: studentId });
        studentName = student ? student.candidateName : "-";
      }

      // Fetch transactions for this enrollment
      const transactions = await Transaction.find({ enrollmentId: enrollment.enrollmentId });
      const payments = transactions.map(tx => ({
        transactionId: tx.transactionId,
        amount: tx.amountPaid,
        paymentMedium: tx.paymentMethod,
        paidTo: tx.paidTo,
        transactionDate: tx.paymentDate || tx._id.getTimestamp()
      }));

      // Initialize student if not exists
      if (!studentsMap[studentId]) {
        studentsMap[studentId] = {
          studentId,
          studentName,
          enrollmentsCount: 0,
          totalAmount: 0,
          totalPaid: 0,
          totalDues: 0,
          courses: []
        };
      }

      // Add course info
      const paid = payments.reduce((sum, p) => sum + p.amount, 0);
      const courseObj = {
        courseId,
        courseName,
        totalAmount: enrollment.totalPrice,
        paid,
        dues: enrollment.totalPrice - paid,
        transactions: payments
      };

      studentsMap[studentId].courses.push(courseObj);

      // Update student totals
      studentsMap[studentId].enrollmentsCount += 1;
      studentsMap[studentId].totalAmount += enrollment.totalPrice;
      studentsMap[studentId].totalPaid += paid;
      studentsMap[studentId].totalDues += enrollment.totalPrice - paid;
    }

    return {
      statusCode: 200,
      body: JSON.stringify(Object.values(studentsMap))
    };

  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
};
