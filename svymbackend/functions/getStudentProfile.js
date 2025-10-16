const { connectDB } = require('./utils/mongodb');
const User = require('./models/User');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    const userId = event.queryStringParameters?.userId;
    if (!userId) return { statusCode: 400, body: JSON.stringify({ message: 'userId is required' }) };

    await connectDB();
    const user = await User.findOne({ userId }).lean();
    if (!user) return { statusCode: 404, body: JSON.stringify({ message: 'User not found' }) };

    // Do not expose password
    delete user.password;

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user }) };
  } catch (err) {
    console.error('getStudentProfile error:', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error', error: err.message }) };
  }
};
