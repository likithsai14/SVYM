const { connectDB } = require('./utils/mongodb');
const User = require('./models/User');
const Trainer = require('./models/Trainer');
const FieldMobiliser = require('./models/FieldMobiliser');
const Otp = require('./models/Otp');
const bcrypt = require('bcrypt');

// helper to find email by userId pattern
async function findEmailForUser(userId) {
  if (userId.startsWith('SVYMT')) {
    const trainer = await Trainer.findOne({ trainerId: userId }).lean();
    return trainer ? trainer.email : null;
  }
  if (userId.startsWith('SVYMFM')) {
    const fm = await FieldMobiliser.findOne({ userId }).lean();
    return fm ? fm.email : null;
  }
  if (userId.startsWith('SVYM')) {
    const user = await User.findOne({ userId }).lean();
    return user ? user.email : null;
  }
  return null;
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    await connectDB();

    const { userId } = JSON.parse(event.body || '{}');
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ message: 'userId is required' }) };
    }

    const email = await findEmailForUser(userId);
    if (!email) {
      return { statusCode: 404, body: JSON.stringify({ message: 'User or email not found' }) };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 90 * 1000); // 90 seconds

    // Hash OTP before storing
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    // Save to DB
    await Otp.create({ userId, otpHash, expiresAt });

    // Use the existing sendEmail Netlify function handler so we reuse the same code
    try {
      const sendEmailFn = require('./sendEmail');
      if (sendEmailFn && typeof sendEmailFn.handler === 'function') {
        const message = `Your one-time OTP for SVYM password reset is ${otp}. It will expire in 90 seconds.`;
        // Call the sendEmail handler with a faux event containing the email payload
        const ev = { body: JSON.stringify({ to: email, subject: 'Your SVYM OTP', message }) };
        // handler may return an object with statusCode and body
        await sendEmailFn.handler(ev);
      } else {
        console.warn('sendEmail handler not available; skipping email send');
      }
    } catch (sendErr) {
      console.error('Failed sending OTP via sendEmail handler:', sendErr);
    }

    // Mask email for response (local-part show first 3 and last 3 if present)
    const [local, domain] = email.split('@');
    let maskedLocal = local;
    if (local.length > 6) maskedLocal = local.slice(0,3) + '*'.repeat(local.length-6) + local.slice(-3);
    else if (local.length > 2) maskedLocal = local[0] + '*'.repeat(local.length-2) + local.slice(-1);
    else maskedLocal = local[0] + '*';

    return { statusCode: 200, body: JSON.stringify({ message: 'OTP sent', maskedEmail: `${maskedLocal}@${domain}` }) };

  } catch (err) {
    console.error('requestOtp error', err);
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};
