// netlify/functions/update-pin.js
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

    if (!userId || !oldPin || !newPin) {
      return { statusCode: 400, body: JSON.stringify({ message: 'User ID, old PIN, and new PIN are required.' }) };
    }

    const userDoc = await User.findOne({ userId });
    if (!userDoc) {
      return { statusCode: 404, body: JSON.stringify({ message: 'User not found.' }) };
    }

    // Only approved users can update PIN
    if (userDoc.approvalStatus !== 'approved') {
      return { statusCode: 403, body: JSON.stringify({ message: `Cannot update PIN. Current status: ${userDoc.approvalStatus}` }) };
    }

    // Verify old PIN against stored password
    const isMatch = await bcrypt.compare(oldPin, userDoc.password);
    if (!isMatch) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Old PIN is incorrect.' }) };
    }

    // Hash and update new PIN
    const hashedNewPin = await bcrypt.hash(newPin, 10);
    userDoc.password = hashedNewPin;
    userDoc.isFirstLogin = false; // Mark first login as complete
    await userDoc.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'PIN updated successfully!' })
    };

  } catch (err) {
    console.error('Update PIN error:', err);
    return { statusCode: 500, body: JSON.stringify({ message: `Internal server error: ${err.message}` }) };
  }
};
