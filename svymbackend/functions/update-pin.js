const { connectDB } = require('./utils/mongodb');
const User = require('./models/User');
const bcrypt = require('bcrypt');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  try {
    await connectDB();
    const { userId, oldPin, newPin } = JSON.parse(event.body);

    if (!userId || !newPin) {
      return { statusCode: 400, body: JSON.stringify({ message: 'User ID and new PIN are required.' }) };
    }

    const userDoc = await User.findOne({ userId });
    if (!userDoc) return { statusCode: 404, body: JSON.stringify({ message: 'User not found.' }) };
    if (userDoc.approvalStatus !== 'approved') return { statusCode: 403, body: JSON.stringify({ message: `Cannot update PIN. Current status: ${userDoc.approvalStatus}` }) };

    // Only verify old PIN if provided (not first login)
    if (oldPin) {
      const isMatch = await bcrypt.compare(oldPin, userDoc.password);
      if (!isMatch) return { statusCode: 401, body: JSON.stringify({ message: 'Old PIN is incorrect.' }) };
    }

    const hashedNewPin = await bcrypt.hash(newPin, 10);
    userDoc.password = hashedNewPin;
    userDoc.isFirstLogin = false;
    await userDoc.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'PIN updated successfully!', user: { userId: userDoc.userId, role: 'user', email: userDoc.email } })
    };

  } catch (err) {
    console.error('Update PIN error:', err);
    return { statusCode: 500, body: JSON.stringify({ message: `Internal server error: ${err.message}` }) };
  }
};
