const { connectDB } = require('./utils/mongodb');
const FieldMobiliser = require('./models/FieldMobiliser');

exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== 'PUT' && event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const { userId } = body;
    if (!userId) return { statusCode: 400, body: JSON.stringify({ message: 'userId is required' }) };

    await connectDB();

    const fm = await FieldMobiliser.findOne({ userId });
    if (!fm) return { statusCode: 404, body: JSON.stringify({ message: 'Field Mobiliser not found' }) };

    // If email provided and changed, ensure uniqueness (case-insensitive), exclude current user
    if (body.FieldMobiliserEmailID && body.FieldMobiliserEmailID !== fm.FieldMobiliserEmailID) {
      const emailToCheck = String(body.FieldMobiliserEmailID).trim();
      // case-insensitive search excluding current userId
      const conflict = await FieldMobiliser.findOne({
        FieldMobiliserEmailID: { $regex: `^${emailToCheck.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
        userId: { $ne: userId }
      });
      if (conflict) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Email already in use' }) };
      }
    }

    // Allowed fields to update
    const updates = {};
    const allowed = ['FieldMobiliserName','FieldMobiliserEmailID','FieldMobiliserMobileNo','FieldMobiliserRegion','FieldMobiliserSupportedProject'];
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key) && body[key] !== undefined) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return { statusCode: 400, body: JSON.stringify({ message: 'No updatable fields provided' }) };
    }

    let updated;
    try {
      updated = await FieldMobiliser.findOneAndUpdate({ userId }, { $set: updates }, { new: true }).lean();
    } catch (dbErr) {
      // handle duplicate key errors gracefully
      if (dbErr && dbErr.code === 11000) {
        const message = dbErr.message || '';
        if (message.includes('FieldMobiliserEmailID')) {
          return { statusCode: 400, body: JSON.stringify({ message: 'Duplicate entry: FieldMobiliserEmailID already exists.' }) };
        }
        return { statusCode: 400, body: JSON.stringify({ message: 'Duplicate key error' }) };
      }
      throw dbErr;
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'FieldMobiliser profile updated', fieldMobiliser: updated }) };
  } catch (error) {
    console.error('Error in editFieldMobiliserProfile:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Server error', error: error.message }) };
  }
};
