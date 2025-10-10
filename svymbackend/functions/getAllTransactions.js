const { connectDB } = require("./utils/mongodb");
const Transaction = require("./models/Transaction");
const StudentEnrollment = require("./models/StudentEnrollment");
const Course = require("./models/Course");
const User = require("./models/User");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "GET") {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method Not Allowed" }),
      };
    }

    await connectDB();

    const transactions = await Transaction.find();

    // Cache enrollments, courses, and users to avoid multiple DB hits
    const enrollmentsMap = {};
    const coursesMap = {};
    const usersMap = {};

    const transactionDetails = await Promise.all(
      transactions.map(async (t) => {
        let enrollment = enrollmentsMap[t.enrollmentId];
        if (!enrollment) {
          enrollment = await StudentEnrollment.findOne({ enrollmentId: t.enrollmentId });
          enrollmentsMap[t.enrollmentId] = enrollment;
        }

        let course = null;
        if (enrollment) {
          if (!coursesMap[enrollment.courseId]) {
            coursesMap[enrollment.courseId] = await Course.findOne({ courseId: enrollment.courseId });
          }
          course = coursesMap[enrollment.courseId];
        }

        let studentName = "-";
        if (enrollment) {
          if (!usersMap[enrollment.studentId]) {
            const user = await User.findOne({ userId: enrollment.studentId });
            usersMap[enrollment.studentId] = user;
          }
          studentName = usersMap[enrollment.studentId]?.candidateName || "-";
        }

        return {
          transactionId: t.transactionId,
          studentId: enrollment ? enrollment.studentId : "Unknown",
          studentName,
          courseId: enrollment ? enrollment.courseId : "Unknown",
          courseName: course ? course.courseName : "Unknown",
          amount: t.amountPaid,
          paymentMedium: t.paymentMethod,
          paidTo: t.paidTo,
          transactionDate: t.paymentDate || t._id.getTimestamp(),
        };
      })
    );

    const totalTransactions = transactionDetails.length;
    const totalAmount = transactionDetails.reduce((sum, tx) => sum + tx.amount, 0);

    return {
      statusCode: 200,
      body: JSON.stringify({
        totalTransactions,
        totalAmount,
        transactions: transactionDetails,
      }),
    };
  } catch (error) {
    console.error("❌ Error in getAllTransactions:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
