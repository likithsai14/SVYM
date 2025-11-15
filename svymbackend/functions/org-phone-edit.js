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
    const { oldPhone, newPhone } = JSON.parse(event.body);
    if (!oldPhone || !newPhone || typeof oldPhone !== 'string' || typeof newPhone !== 'string' || oldPhone.trim() === '' || newPhone.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Both oldPhone and newPhone are required and must be non-empty strings' })
      };
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(newPhone.trim())) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'New phone must be exactly 10 digits' })
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

    const index = org.contactus.phones.indexOf(oldPhone.trim());
    if (index === -1) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Old phone not found' })
      };
    }

    if (org.contactus.phones.includes(newPhone.trim()) && newPhone.trim() !== oldPhone.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'New phone already exists' })
      };
    }

    org.contactus.phones[index] = newPhone.trim();
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Phone updated successfully' })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
