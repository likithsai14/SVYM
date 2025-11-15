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
    const { oldEmail, newEmail } = JSON.parse(event.body);
    if (!oldEmail || !newEmail || typeof oldEmail !== 'string' || typeof newEmail !== 'string' || oldEmail.trim() === '' || newEmail.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Both oldEmail and newEmail are required and must be non-empty strings' })
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid new email format' })
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

    const index = org.contactus.emails.indexOf(oldEmail.trim().toLowerCase());
    if (index === -1) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Old email not found' })
      };
    }

    if (org.contactus.emails.includes(newEmail.trim().toLowerCase()) && newEmail.trim().toLowerCase() !== oldEmail.trim().toLowerCase()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'New email already exists' })
      };
    }

    org.contactus.emails[index] = newEmail.trim().toLowerCase();
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email updated successfully' })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
