const { connectDB } = require('./utils/mongodb');
const Trainer = require('./models/Trainer');

exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== 'PUT' && event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const { trainerId } = body;
    if (!trainerId) return { statusCode: 400, body: JSON.stringify({ message: 'trainerId is required' }) };

    await connectDB();

    const trainer = await Trainer.findOne({ trainerId });
    if (!trainer) return { statusCode: 404, body: JSON.stringify({ message: 'Trainer not found' }) };

    // If email provided and changed, ensure uniqueness (case-insensitive), exclude current trainerId
    if (body.email && body.email !== trainer.email) {
      const emailToCheck = String(body.email).trim();
      // case-insensitive search excluding current trainerId
      const conflict = await Trainer.findOne({
        email: { $regex: `^${emailToCheck.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
        trainerId: { $ne: trainerId }
      });
      if (conflict) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Email already in use' }) };
      }
    }

    // If mobile provided and changed, ensure uniqueness, exclude current trainerId
    if (body.mobile && body.mobile !== trainer.mobile) {
      const mobileToCheck = String(body.mobile).trim();
      const conflict = await Trainer.findOne({
        mobile: mobileToCheck,
        trainerId: { $ne: trainerId }
      });
      if (conflict) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Mobile already in use' }) };
      }
    }

    // Allowed fields to update
    const updates = {};
    const allowed = ['name', 'email', 'mobile', 'expertise', 'status'];
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key) && body[key] !== undefined) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return { statusCode: 400, body: JSON.stringify({ message: 'No updatable fields provided' }) };
    }

    let updated;
    try {
      updated = await Trainer.findOneAndUpdate({ trainerId }, { $set: updates }, { new: true }).lean();
    } catch (dbErr) {
      // handle duplicate key errors gracefully
      if (dbErr && dbErr.code === 11000) {
        const message = dbErr.message || '';
        if (message.includes('email')) {
          return { statusCode: 400, body: JSON.stringify({ message: 'Duplicate entry: email already exists.' }) };
        }
        if (message.includes('mobile')) {
          return { statusCode: 400, body: JSON.stringify({ message: 'Duplicate entry: mobile already exists.' }) };
        }
        return { statusCode: 400, body: JSON.stringify({ message: 'Duplicate key error' }) };
      }
      throw dbErr;
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'Trainer updated', trainer: updated }) };
  } catch (error) {
    console.error('Error in editTrainer:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Server error', error: error.message }) };
  }
};
