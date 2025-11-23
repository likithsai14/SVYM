
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
    const { index } = JSON.parse(event.body);
    if (index === undefined || index === null || typeof index !== 'number' || index < 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'index is required and must be a non-negative number' }),
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

    if (index >= org.help.length) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'FAQ not found' }),
      };
    }

    org.help.splice(index, 1);
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'FAQ deleted successfully' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
