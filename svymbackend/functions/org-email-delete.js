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
    const { email } = JSON.parse(event.body);
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Email is required and must be a non-empty string',
        }),
      };
    }

    await connectDB();
    const org = await Organization.getSingleton();

    const index = org.contactus.emails.indexOf(email.trim().toLowerCase());
    if (index === -1) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Email not found' }),
      };
    }

    org.contactus.emails.splice(index, 1);
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email deleted successfully' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
