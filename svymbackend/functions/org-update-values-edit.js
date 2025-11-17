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
    const { oldValue, newValue } = JSON.parse(event.body);
    if (!oldValue || !newValue || typeof oldValue !== 'string' || typeof newValue !== 'string' || oldValue.trim() === '' || newValue.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Both oldValue and newValue are required and must be non-empty strings' })
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

    const valuesArray = org.aboutus.values;
    const index = valuesArray.indexOf(oldValue.trim());
    if (index === -1) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Value not found' })
      };
    }

    valuesArray[index] = newValue.trim();
    org.aboutus.values = valuesArray;
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Value updated successfully' })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
