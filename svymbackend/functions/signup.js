// netlify/functions/signup.js
const { connectDB } = require('./utils/mongodb');
const User = require('./models/User');
const bcrypt = require('bcrypt');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  try {
    await connectDB();
    const data = JSON.parse(event.body);

    // --- Map frontend mobiliser fields to backend fields ---
    if (data.mobiliserName) {
      data.fieldMobiliserId = data.mobiliserName; // value of dropdown
      // If your frontend also sends selected text, you can map it, otherwise fetch it from dropdown text
      data.fieldMobiliserName = data.mobiliserNameText || 'Unknown Mobiliser';
    }

    // --- Validation ---
    const requiredFields = [
      'candidateName', 'email', 'dob', 'age', 'familyMembers', 'qualification',
      'caste', 'referralSource', 'gender', 'tribal', 'pwd', 'aadharNumber',
      'candidatePhone', 'parentPhone', 'fieldMobiliserName', 'fieldMobiliserId', 'supportedProject'
    ];

    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        return { statusCode: 400, body: JSON.stringify({ message: `Missing required field: ${field}` }) };
      }
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Invalid email address.' }) };
    }
    if (!/^\d{12}$/.test(data.aadharNumber.trim())) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Aadhar Number must be 12 digits.' }) };
    }
    if (!/^\d{10}$/.test(data.candidatePhone.trim()) || !/^\d{10}$/.test(data.parentPhone.trim())) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Phone numbers must be 10 digits.' }) };
    }
    if (isNaN(data.age) || data.age < 0) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Age must be a valid non-negative number.' }) };
    }
    if (isNaN(data.familyMembers) || data.familyMembers < 1) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Family members must be at least 1.' }) };
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return { statusCode: 409, body: JSON.stringify({ message: 'Email already registered.' }) };
    }

    // Generate unique 5-digit suffix for userId
    const uniqueSuffix = Math.floor(10000 + Math.random() * 90000).toString();
    const userId = `SVYM${uniqueSuffix}`;

    // Hash initial PIN (same as userId suffix)
    const hashedPassword = await bcrypt.hash(uniqueSuffix, 10);

    const newUser = new User({
      userId,
      ...data,
      password: hashedPassword,
      isFirstLogin: true,
      loginCount: 0,
      approvalStatus: 'pending',
      createdAt: new Date()
    });

    await newUser.save();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Sign up successful! Waiting for admin approval.',
        userId,
        firstLoginPin: uniqueSuffix
      })
    };

  } catch (err) {
    console.error('Signup error:', err);
    return { statusCode: 500, body: JSON.stringify({ message: `Internal server error: ${err.message}` }) };
  }
};
