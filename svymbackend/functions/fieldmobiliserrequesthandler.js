const { connectDB } = require('./utils/mongodb');
const FieldMobiliser = require('./models/FieldMobiliser');

exports.handler = async (event, context) => {
  console.log("hello");

  try {
    if (event.httpMethod !== 'POST') {
      return { 
        statusCode: 405, 
        body: JSON.stringify({ message: 'Method Not Allowed' }) 
      };
    }

    await connectDB();

    const { fieldmobiliserId, isAppRejPen } = JSON.parse(event.body);

    if (!fieldmobiliserId || !isAppRejPen) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'fieldmobiliserId and isAppRejPen are required.' })
      };
    }

    // Update the document in MongoDB
    const updated = await FieldMobiliser.findByIdAndUpdate(
      fieldmobiliserId,
      { isAppRejPen },
      { new: true } // return updated doc
    ).lean();

    if (!updated) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'FieldMobiliser not found.' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: `FieldMobiliser status for ${fieldmobiliserId} updated successfully.`,
        updated
      })
    };
  } catch (error) {
    console.error('Netlify Function error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Internal server error: ${error.message}` })
    };
  }
};
