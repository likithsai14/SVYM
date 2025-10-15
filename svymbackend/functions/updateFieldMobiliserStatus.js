const { connectDB } = require('./utils/mongodb');
const FieldMobiliser = require('./models/FieldMobiliser');

exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== 'PUT' && event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const { userId, status } = body;
    if (!userId || !status) {
      return { statusCode: 400, body: JSON.stringify({ message: 'userId and status are required' }) };
    }

    await connectDB();

    const allowed = ['active', 'inActive', 'Active', 'Inactive', 'inactive'];
    if (!allowed.includes(status)) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Invalid status value' }) };
    }

    // Normalize
    const normalized = status.toLowerCase() === 'active' || status === 'Active' ? 'active' : 'inActive';

    const updated = await FieldMobiliser.findOneAndUpdate(
      { userId },
      { accountStatus: normalized },
      { new: true }
    ).lean();

    if (!updated) {
      return { statusCode: 404, body: JSON.stringify({ message: 'Field Mobiliser not found' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'Status updated', userId: updated.userId, status: updated.accountStatus }) };
  } catch (error) {
    console.error('Error updating field mobiliser status', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Server error', error: error.message }) };
  }
};
