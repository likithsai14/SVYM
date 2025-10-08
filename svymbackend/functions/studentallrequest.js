const { connectDB } = require('./utils/mongodb'); // your mongoose connection helper
const User = require('./models/User'); // student model

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method Not Allowed' })
      };
    }

    // Connect to MongoDB
    await connectDB();

    // Fetch all users (students)
    const students = await User.find({approvalStatus: 'pending'}).lean();

    // Debug logs
    for (const student of students) {
      console.log(
        `Student ID: ${student.userId}, Name: ${student.candidateName}, Email: ${student.email}, FieldMobiliser: ${student.fieldMobiliserName}, Status: ${student.approvalStatus}`
      );
    }

    // Return as JSON
    return {
      statusCode: 200,
      body: JSON.stringify({ students })
    };

  } catch (error) {
    console.error('Error in handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: error.message
      })
    };
  }
};
