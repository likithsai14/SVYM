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
    const { platform } = JSON.parse(event.body);
    if (!platform || typeof platform !== 'string' || platform.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Platform is required and must be a non-empty string' }),
      };
    }

    await connectDB();
    const org = await Organization.findOne();
    if (!org) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Organization data not found' }),
      };
    }

    org.contactus.socialMedia.delete(platform.trim().toLowerCase());
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `${platform} deleted successfully` }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
