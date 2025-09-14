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
    const students = await User.find().lean();

    // Debug logs
    for (const student of students) {
      console.log(
        `Student ID: ${student._id}, Name: ${student.candidateName}, Email: ${student.email}, Course: ${student.supportedProject}, Status: ${student.isAppRejPen}`
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
