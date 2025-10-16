const { connectDB } = require('./utils/mongodb');
const User = require('./models/User');

// Allowed fields for profile update — grouped by sections is fine but here we accept all editable fields
const ALLOWED_FIELDS = [
  'candidateName','fatherHusbandName','villageName','talukName','districtName','dob','age',
  'familyMembers','qualification','caste','referralSource','staffName','gender','tribal','pwd',
  'aadharNumber','candidatePhone','parentPhone','supportedProject','email','fieldMobiliserId','fieldMobiliserName'
];

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'PUT') {
      return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    if (!event.body) return { statusCode: 400, body: JSON.stringify({ message: 'Request body required' }) };

    const payload = JSON.parse(event.body);
    const { userId } = payload;
    if (!userId) return { statusCode: 400, body: JSON.stringify({ message: 'userId is required' }) };

    await connectDB();
    const user = await User.findOne({ userId });
    if (!user) return { statusCode: 404, body: JSON.stringify({ message: 'User not found' }) };

    // Apply only allowed fields
    let updated = false;
    for (const key of ALLOWED_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        user[key] = payload[key];
        updated = true;
      }
    }

    if (!updated) return { statusCode: 400, body: JSON.stringify({ message: 'No updatable fields provided' }) };

    user.updatedAt = new Date();
    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    return { statusCode: 200, body: JSON.stringify({ message: 'Profile updated', user: safeUser }) };
  } catch (err) {
    console.error('updateStudentProfile error:', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error', error: err.message }) };
  }
};
