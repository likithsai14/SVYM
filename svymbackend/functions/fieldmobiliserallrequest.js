const connectDB = require('./utils/mongodb'); // new connection utility
const FieldMobiliser = require('./models/FieldMobiliser'); // schema model

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method Not Allowed' })
      };
    }

    // ensure db connection
    await connectDB();

    // Fetch all student documents
    const all = await FieldMobiliser.find().lean();

    // Debug logging (not sent to client)
    for (const fm of all) {
      console.log(
        `Field Mobiliser ID: ${fm._id}, Name: ${fm.FieldMobiliserName}, Email: ${fm.FieldMobiliserEmailID}, Region: ${fm.FieldMobiliserRegion}, Supported Project: ${fm.FieldMobiliserSupportedProject}, Status: ${fm.isAppRejPen}`
      );
    }

    // Return response
    return {
      statusCode: 200,
      body: JSON.stringify({ fieldmobilisers: all })
    };
  } catch (error) {
    console.error('Error in handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: error.message
      })
    };
  }
};
