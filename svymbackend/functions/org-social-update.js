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
    const { platform, url } = JSON.parse(event.body);
    if (!platform || typeof platform !== 'string' || platform.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Platform is required and must be a non-empty string' })
      };
    }

    const validPlatforms = ['facebook', 'instagram', 'youtube', 'twitter'];
    if (!validPlatforms.includes(platform.trim().toLowerCase())) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid platform. Must be one of: facebook, instagram, youtube, twitter' })
      };
    }

    if (url !== undefined && typeof url !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'URL must be a string or omitted' })
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

    org.contactus.socialMedia[platform.trim().toLowerCase()] = url ? url.trim() : '';
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `${platform} updated successfully` })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
