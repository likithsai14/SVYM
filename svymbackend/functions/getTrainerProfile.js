const { connectDB } = require('./utils/mongodb');
const Trainer = require('./models/Trainer');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    const userId = event.queryStringParameters?.userId;
    if (!userId) return { statusCode: 400, body: JSON.stringify({ message: 'userId is required' }) };

    await connectDB();
    const trainer = await Trainer.findOne({ trainerId: userId }).lean();
    if (!trainer) return { statusCode: 404, body: JSON.stringify({ message: 'Trainer not found' }) };

    // Do not expose password
    delete trainer.password;

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trainer }) };
  } catch (err) {
    console.error('getTrainerProfile error:', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error', error: err.message }) };
  }
};
