const { connectDB } = require('./utils/mongodb');
const FieldMobiliser = require('./models/FieldMobiliser');
const bcrypt = require('bcrypt');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    if (!event.body) return { statusCode: 400, body: JSON.stringify({ message: 'Request body required' }) };

    const { userId, currentPassword, newPassword } = JSON.parse(event.body);
    if (!userId || !newPassword) return { statusCode: 400, body: JSON.stringify({ message: 'userId and newPassword are required' }) };

    await connectDB();
    const fm = await FieldMobiliser.findOne({ userId });
    if (!fm) return { statusCode: 404, body: JSON.stringify({ message: 'Field Mobiliser not found' }) };

    // If currentPassword provided, verify it. If not provided, reject for security.
    if (!currentPassword) return { statusCode: 400, body: JSON.stringify({ message: 'Current password is required' }) };

    const match = await bcrypt.compare(currentPassword, fm.password || '');
    if (!match) return { statusCode: 401, body: JSON.stringify({ message: 'Current password is incorrect' }) };

    const hashed = await bcrypt.hash(newPassword, 10);
    fm.password = hashed;
    fm.isFirstLogin = false;
    await fm.save();

    return { statusCode: 200, body: JSON.stringify({ message: 'Password updated successfully' }) };
  } catch (err) {
    console.error('changeFieldMobiliserPassword error:', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error', error: err.message }) };
  }
};
