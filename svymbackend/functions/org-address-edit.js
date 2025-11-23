
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
    const { oldAddress, newAddress } = JSON.parse(event.body);
    if (
      !oldAddress ||
      !newAddress ||
      typeof oldAddress !== 'string' ||
      typeof newAddress !== 'string' ||
      oldAddress.trim() === '' ||
      newAddress.trim() === ''
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Both oldAddress and newAddress are required and must be non-empty strings',
        }),
      };
    }

    await connectDB();
    const org = await Organization.getSingleton();

    const index = org.contactus.addresses.indexOf(oldAddress.trim());
    if (index === -1) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Old address not found' }),
      };
    }

    if (
      org.contactus.addresses.includes(newAddress.trim()) &&
      newAddress.trim() !== oldAddress.trim()
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'New address already exists' }),
      };
    }

    org.contactus.addresses[index] = newAddress.trim();
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Address updated successfully' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
