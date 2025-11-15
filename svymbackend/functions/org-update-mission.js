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
    const { mission } = JSON.parse(event.body);
    if (!mission || typeof mission !== 'string' || mission.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Mission is required and must be a non-empty string' })
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

    org.aboutus.mission = mission.trim();
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Mission updated successfully' })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
