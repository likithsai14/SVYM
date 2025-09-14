const { connectDB } = require('./utils/mongodb');
const FieldMobiliser = require('./models/FieldMobiliser');

// Helper: generate a unique 5-digit suffix (random + check if exists)
async function generateUniqueFiveDigitSuffix() {
  let suffix, exists;
  do {
    suffix = Math.floor(10000 + Math.random() * 90000); // random 5-digit number
    const userId = `SVYMFM${suffix}`;
    exists = await FieldMobiliser.exists({ _id: userId });
  } while (exists);
  return suffix;
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    await connectDB();

    const data = JSON.parse(event.body);

    // Required fields
    const requiredFields = [
      'FieldMobiliserName',
      'FieldMobiliserEmailID',
      'FieldMobiliserMobileNo',
      'FieldMobiliserRegion',
      'FieldMobiliserSupportedProject'
    ];

    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === '') {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: `Missing required field: ${field}` }),
        };
      }
    }

    // Generate unique userId
    const uniqueSuffix = await generateUniqueFiveDigitSuffix();
    const userId = `SVYMFM${uniqueSuffix}`;

    const newUser = new FieldMobiliser({
      _id: userId,
      FieldMobiliserName: data.FieldMobiliserName,
      FieldMobiliserEmailID: data.FieldMobiliserEmailID,
      FieldMobiliserMobileNo: data.FieldMobiliserMobileNo,
      FieldMobiliserRegion: data.FieldMobiliserRegion,
      FieldMobiliserSupportedProject: data.FieldMobiliserSupportedProject,
      createdAt: new Date()
    });

    await newUser.save();

    console.log(`✅ New mobiliser signed up: ${data.FieldMobiliserName} with User ID: ${userId}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Sign up successful! Your User ID has been generated.',
        userId: userId
      })
    };

  } catch (error) {
    console.error('Error processing signup request:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'An unexpected error occurred. Please try again later.',
        error: error.message
      }),
    };
  }
};
