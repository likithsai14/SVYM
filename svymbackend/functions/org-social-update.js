
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
    const { platform, url } = JSON.parse(event.body);
    if (!platform || typeof platform !== 'string' || platform.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Platform is required and must be a non-empty string',
        }),
      };
    }

    if (url !== undefined && typeof url !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'URL must be a string or omitted' }),
      };
    }

    await connectDB();

    const org = await Organization.getSingleton();
    if (!org) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Organization data not found' }),
      };
    }

    console.log(platform, url);

    org.contactus.socialMedia.set(platform.trim().toLowerCase(), url
      ? url.trim()
      : '');
    console.log(org.contactus.socialMedia);
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `${platform} updated successfully` }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
