// netlify/functions/login.js
const { connectDB } = require('./utils/mongodb');
const User = require('./models/User');
const Admin = require('./models/Admin');
const bcrypt = require('bcrypt');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  try {
    await connectDB();

    const { userId, password } = JSON.parse(event.body);

    if (!userId || !password) {
      return { statusCode: 400, body: JSON.stringify({ message: 'User ID and password are required.' }) };
    }

    /** ---------- 1. CHECK ADMIN ---------- **/
    const adminDoc = await Admin.findOne({ username: userId });
    console.log(adminDoc);
    if (adminDoc) {
      const hash = await bcrypt.hash('password', 10);
      console.log(hash);
      const isMatching = await bcrypt.compare('password', adminDoc.password);
      console.log(isMatching);
      const isMatch = await bcrypt.compare(password, adminDoc.password);
      console.log(isMatch);
      if (!isMatch) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Invalid Admin ID or Password.' }) };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Admin login successful!',
          user: {
            userId: adminDoc.username,
            role: 'admin'
          }
        })
      };
    }

    /** ---------- 2. CHECK NORMAL USER ---------- **/
    const userDoc = await User.findOne({ userId });
    if (!userDoc) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Invalid User ID or Password.' }) };
    }

    if (userDoc.approvalStatus !== 'approved') {
      return { statusCode: 403, body: JSON.stringify({ message: `Cannot login. Current status: ${userDoc.approvalStatus}` }) };
    }

    const isMatch = await bcrypt.compare(password, userDoc.password);
    if (!isMatch) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Invalid User ID or Password.' }) };
    }

    userDoc.loginCount = (userDoc.loginCount || 0) + 1;
    userDoc.lastLoginAt = new Date();
    await userDoc.save();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Login successful!',
        user: {
          userId: userDoc.userId,
          email: userDoc.email,
          role: 'user' // normal users always "user"
        }
      })
    };

  } catch (err) {
    console.error('Login error:', err);
    return { statusCode: 500, body: JSON.stringify({ message: `Internal server error: ${err.message}` }) };
  }
};
