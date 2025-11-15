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
    const { faqId } = JSON.parse(event.body);
    if (!faqId || typeof faqId !== 'string' || faqId.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'faqId is required and must be a non-empty string' })
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

    const faq = org.help.id(faqId);
    if (!faq) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'FAQ not found' })
      };
    }

    org.help.pull(faqId);
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'FAQ deleted successfully' })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
