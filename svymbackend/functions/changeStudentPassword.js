const { connectDB } = require('./utils/mongodb');
const User = require('./models/User');
const bcrypt = require('bcrypt');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    if (!event.body) return { statusCode: 400, body: JSON.stringify({ message: 'Request body required' }) };

    const { userId, currentPassword, newPassword } = JSON.parse(event.body);
    if (!userId || !newPassword) return { statusCode: 400, body: JSON.stringify({ message: 'userId and newPassword are required' }) };

    await connectDB();
    const user = await User.findOne({ userId });
    if (!user) return { statusCode: 404, body: JSON.stringify({ message: 'User not found' }) };

    // If currentPassword provided, verify it. If not provided, reject for security.
    if (!currentPassword) return { statusCode: 400, body: JSON.stringify({ message: 'Current password is required' }) };

    const match = await bcrypt.compare(currentPassword, user.password || '');
    if (!match) return { statusCode: 401, body: JSON.stringify({ message: 'Current password is incorrect' }) };

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.isFirstLogin = false;
    await user.save();

    return { statusCode: 200, body: JSON.stringify({ message: 'Password updated successfully' }) };
  } catch (err) {
    console.error('changeStudentPassword error:', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error', error: err.message }) };
  }
};
