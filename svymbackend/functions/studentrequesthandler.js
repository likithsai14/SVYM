const { connectDB } = require('./utils/mongodb'); 
const User = require('./models/User'); // Student model

exports.handler = async (event, context) => {

  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method Not Allowed' })
      };
    }

    const { id, status } = JSON.parse(event.body);

    console.log(id, status);
    if (!id || !status) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'studentId and approvalStatus are required.' })
      };
    }

    // Connect to MongoDB
    await connectDB();

    // Update only the approvalStatus field
    const updatedStudent = await User.findOneAndUpdate(
      { userId: id },  // ✅ search by your custom field
      { approvalStatus: status },
      { new: true }
    ).lean();


    if (!updatedStudent) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Student ID not found.' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Student approval status for ${id} updated successfully.`,
        student: updatedStudent
      })
    };

  } catch (error) {
    console.error('Netlify Function error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Internal server error: ${error.message}` })
    };
  }
};
