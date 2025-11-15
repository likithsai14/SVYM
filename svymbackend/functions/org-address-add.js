const mongoose = require('mongoose');
const Organization = require('./models/Organization');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const { address } = JSON.parse(event.body);
    if (!address || typeof address !== 'string' || address.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Address is required and must be a non-empty string' })
      };
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const org = await Organization.findOne();
    if (!org) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Organization data not found' })
      };
    }

    if (org.contactus.addresses.includes(address.trim())) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Address already exists' })
      };
    }

    org.contactus.addresses.push(address.trim());
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Address added successfully' })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
