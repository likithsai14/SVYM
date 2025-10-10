// netlify/functions/getAllCourseFees.js

const { connectDB } = require("./utils/mongodb");
const StudentEnrollment = require("./models/StudentEnrollment");
const Transaction = require("./models/Transaction");
const Course = require("./models/Course");
const User = require("./models/User");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "GET") {
      return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    await connectDB();

    // Fetch all courses
    const courses = await Course.find();

    const courseData = [];

    for (const course of courses) {
      // Fetch all enrollments for this course
      const enrollments = await StudentEnrollment.find({ courseId: course.courseId });
      let totalAmount = 0, totalPaid = 0, totalDues = 0;
      const transactions = [];

      for (const enrollment of enrollments) {
        const student = await User.findOne({ userId: enrollment.studentId });
        const studentName = student ? student.candidateName : "-";

        const tList = await Transaction.find({ enrollmentId: enrollment.enrollmentId });
        const paymentSum = tList.reduce((sum, t) => sum + t.amountPaid, 0);

        totalAmount += enrollment.totalPrice;
        totalPaid += paymentSum;
        totalDues += enrollment.totalPrice - paymentSum;

        tList.forEach(t => {
          transactions.push({
            transactionId: t.transactionId,
            studentId: enrollment.studentId,
            studentName,
            amount: t.amountPaid,
            paymentMedium: t.paymentMethod,
            paidTo: t.paidTo,
            transactionDate: t.paymentDate || t._id.getTimestamp()
          });
        });
      }

      courseData.push({
        courseId: course.courseId,
        courseName: course.courseName,
        trainerName: course.trainerName || "-",
        enrollmentsCount: enrollments.length,
        price: course.price,
        totalAmount,
        totalPaid,
        totalDues,
        transactions
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify(courseData)
    };

  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
};
