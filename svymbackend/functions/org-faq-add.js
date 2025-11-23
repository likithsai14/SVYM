
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
    const { qtn, answer } = JSON.parse(event.body);
    if (
      !qtn ||
      !answer ||
      typeof qtn !== 'string' ||
      typeof answer !== 'string' ||
      qtn.trim() === '' ||
      answer.trim() === ''
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Both qtn and answer are required and must be non-empty strings',
        }),
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

    const newFaq = {
      qtn: qtn.trim(),
      answer: answer.trim(),
    };

    org.help.push(newFaq);
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'FAQ added successfully' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
