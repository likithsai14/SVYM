const { connectDB } = require('./utils/mongodb');
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
    const { phone } = JSON.parse(event.body);
    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Phone is required and must be a non-empty string' })
      };
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Phone must be exactly 10 digits' })
      };
    }

    await connectDB();
    const org = await Organization.getSingleton();

    if (org.contactus.phones.includes(phone.trim())) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Phone already exists' })
      };
    }

    org.contactus.phones.push(phone.trim());
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Phone added successfully' })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
