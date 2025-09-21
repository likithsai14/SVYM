// assignTrainer.js
const { connectDB } = require('./utils/mongodb');
const Course = require('./models/Course'); // Make sure your Course model is correct

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method Not Allowed' })
      };
    }

    await connectDB();

    const { courseId, trainerId, trainerName } = JSON.parse(event.body);

    if (!courseId || !trainerId || !trainerName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'courseId and trainerId are required' })
      };
    }

    // Update the course with the trainerId
    const updatedCourse = await Course.findOneAndUpdate(
      { courseId },                              // filter
      { $set: { trainerId, trainerName } },      // update
      { new: true }                              // options
    );


    if (!updatedCourse) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Course not found' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Trainer assigned successfully',
        course: updatedCourse
      })
    };

  } catch (error) {
    console.error('Error assigning trainer:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Internal server error: ${error.message}` })
    };
  }
};
