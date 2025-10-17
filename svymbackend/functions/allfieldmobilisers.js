const { connectDB } = require('./utils/mongodb');
const FieldMobiliser = require('./models/FieldMobiliser');

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    await connectDB();

    const { userId } = event.queryStringParameters || {};

    if (userId) {
      // Fetch single field mobiliser by userId
      const fieldMobiliser = await FieldMobiliser.findOne({ userId }).lean();
      if (!fieldMobiliser) {
        return { statusCode: 404, body: JSON.stringify({ message: 'Field Mobiliser not found' }) };
      }
      return {
        statusCode: 200,
        body: JSON.stringify({ fieldMobiliser })
      };
    } else {
      // Fetch all field mobilisers
      const fieldmobilisers = await FieldMobiliser.find({
        userId: { $regex: /^SVYMFM/ }
      }).lean();

      return {
        statusCode: 200,
        body: JSON.stringify({ fieldmobilisers })
      };
    }
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
