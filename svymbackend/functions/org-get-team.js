
const { connectDB } = require('./utils/mongodb');
const Organization = require('./models/Organization');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  try {
    await connectDB();
    const org = await Organization.getSingleton();
    if (!org) {
      return {
        statusCode: 200,
        body: JSON.stringify([]),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(org.team),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
