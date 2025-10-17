const { connectDB } = require('./utils/mongodb');
const User = require('./models/User');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    await connectDB();

    const { mobiliserId } = JSON.parse(event.body);

    if (!mobiliserId) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Mobiliser ID is required' }) };
    }

    // Fetch students associated with the field mobiliser
    const students = await User.find({
      fieldMobiliserId: mobiliserId
    });

    // Calculate stats
    const total = students.length;
    const active = students.filter(s => s.accountStatus === 'active').length;
    const followup1 = students.filter(s => s.accountStatus === 'followUp1').length;
    const followup2 = students.filter(s => s.accountStatus === 'followUp2').length;
    const inactive = students.filter(s => s.accountStatus === 'droppedOut').length;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        total,
        active,
        followup1,
        followup2,
        inactive
      })
    };
  } catch (error) {
    console.error('Error fetching field mobiliser students stats:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
