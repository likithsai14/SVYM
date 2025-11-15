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
    const { email } = JSON.parse(event.body);
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Email is required and must be a non-empty string' })
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid email format' })
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

    if (org.contactus.emails.includes(email.trim().toLowerCase())) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Email already exists' })
      };
    }

    org.contactus.emails.push(email.trim().toLowerCase());
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email added successfully' })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
