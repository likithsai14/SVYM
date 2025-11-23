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
    const { address } = JSON.parse(event.body);
    if (!address || typeof address !== 'string' || address.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Address is required and must be a non-empty string',
        }),
      };
    }

    await connectDB();
    const org = await Organization.getSingleton();
    if (!org) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Organization not found' }),
      };
    }

    const index = org.contactus.addresses.indexOf(address.trim());
    if (index === -1) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Address not found' }),
      };
    }

    org.contactus.addresses.splice(index, 1);
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Address deleted successfully' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
