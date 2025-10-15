const { connectDB } = require('./utils/mongodb');
const Otp = require('./models/Otp');
const bcrypt = require('bcrypt');

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    await connectDB();

    const { userId, otp } = JSON.parse(event.body || '{}');
    if (!userId || !otp) {
      return { statusCode: 400, body: JSON.stringify({ message: 'userId and otp are required' }) };
    }

    // Find latest unused OTP for user
    const record = await Otp.findOne({ userId, used: false }).sort({ createdAt: -1 });
    if (!record) {
      return { statusCode: 404, body: JSON.stringify({ message: 'No OTP request found or already used/expired' }) };
    }

    if (new Date() > record.expiresAt) {
      return { statusCode: 410, body: JSON.stringify({ message: 'OTP expired' }) };
    }

    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Invalid OTP' }) };
    }

    // Mark as used
    record.used = true;
    await record.save();

    return { statusCode: 200, body: JSON.stringify({ message: 'OTP verified' }) };

  } catch (err) {
    console.error('verifyOtp error', err);
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};
