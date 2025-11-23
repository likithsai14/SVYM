
const { connectDB } = require('./utils/mongodb');
const Organization = require('./models/Organization');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  try {
    const { vision } = JSON.parse(event.body);
    if (!vision || typeof vision !== 'string' || vision.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Vision is required and must be a non-empty string' }),
      };
    }

    await connectDB();
    const org = await Organization.getSingleton();
    if (!org) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Organization data not found' }),
      };
    }

    org.aboutus.vision = vision.trim();
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Vision updated successfully' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
