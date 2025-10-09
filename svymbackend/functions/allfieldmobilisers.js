const mongoose = require('mongoose');
const FieldMobiliser = require('./models/FieldMobiliser'); // assuming you define the schema in models/FieldMobiliser.js

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    // Query for docs where _id starts with 'SVYMFM'
    const fieldmobilisers = await FieldMobiliser.find({
      userId : { $regex: /^SVYMFM/ }
    }).lean();

    // console.log(fieldmobilisers);

    return {
      statusCode: 200,
      body: JSON.stringify({ fieldmobilisers })
    };
  } catch (error) {
    console.error('Netlify Function error:', error);

    if (error.message.includes('authorization') || error.message.includes('authentication')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Backend Authentication Error: Function not authorized to connect to MongoDB. Check environment variables.' })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Internal server error: ${error.message}` })
    };
  }
};
