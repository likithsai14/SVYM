const { connectDB } = require('./utils/mongodb'); // MongoDB connection helper
const User = require('./models/User'); // Student model

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method Not Allowed' })
      };
    }

    // Get the student ID from query params
    const studentId = event.queryStringParameters?.id;

    if (!studentId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Student ID is required.' })
      };
    }

    // Connect to MongoDB
    await connectDB();

    // Fetch single student by _id
    const student = await User.findById(studentId).lean();

    if (!student) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Student not found.' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
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
