
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
    const { value } = JSON.parse(event.body);
    if (!value || typeof value !== 'string' || value.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Value is required and must be a non-empty string' }),
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

    const valuesArray = org.aboutus.values.split(', ');
    const index = valuesArray.indexOf(value.trim());
    if (index === -1) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Value not found' }),
      };
    }

    valuesArray.splice(index, 1);
    org.aboutus.values = valuesArray.join(', ');
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Value deleted successfully' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
