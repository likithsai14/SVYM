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
    const { values } = JSON.parse(event.body);
    if (!Array.isArray(values)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Values must be an array' })
      };
    }

    // Validate each value is a non-empty string
    for (const val of values) {
      if (typeof val !== 'string' || val.trim() === '') {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Each value must be a non-empty string' })
        };
      }
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const org = await Organization.findOne();
    if (!org) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Organization data not found' })
      };
    }

    // Trim and replace all values
    org.aboutus.values = values.map(v => v.trim());
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Values updated successfully' })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
