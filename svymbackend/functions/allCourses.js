// netlify/functions/allCourses.js
const { connectDB } = require('./utils/mongodb');
const Course = require('./models/Course'); // <-- make sure you have this model

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method Not Allowed' })
      };
    }

    // Connect DB
    await connectDB();

    // Fetch all courses
    const courses = await Course.find();

    return {
      statusCode: 200,
      body: JSON.stringify(courses)
    };
  } catch (error) {
    console.error('Error fetching courses:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Internal server error: ${error.message}` })
    };
  }
};
