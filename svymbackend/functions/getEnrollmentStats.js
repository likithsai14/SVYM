const { connectDB } = require('./utils/mongodb');
const Course = require('./models/Course');

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    await connectDB();

    // Aggregate from Course, lookup enrollments
    const stats = await Course.aggregate([
      {
        $lookup: {
          from: 'studentenrollments', // collection name
          localField: 'courseName',
          foreignField: 'courseName',
          as: 'enrollments'
        }
      },
      {
        $project: {
          courseName: 1,
          enrollments: { $size: '$enrollments' }
        }
      },
      {
        $sort: { enrollments: -1 } // Sort by enrollments descending
      }
    ]);

    return {
      statusCode: 200,
      body: JSON.stringify({ stats })
    };
  } catch (error) {
    console.error('Error fetching enrollment stats:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Internal server error: ${error.message}` })
    };
  }
};
