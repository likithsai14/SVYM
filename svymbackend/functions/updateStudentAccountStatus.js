const { connectDB } = require('./utils/mongodb');
const User = require('./models/User');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  try {
    const { userId, accountStatus } = JSON.parse(event.body);

    if (!userId || !accountStatus) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'userId and accountStatus are required' }),
      };
    }

    const allowedStatuses = ['active', 'followUp1', 'followUp2', 'droppedOut'];
    if (!allowedStatuses.includes(accountStatus)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid accountStatus value' }),
      };
    }

    await connectDB();
    const user = await User.findOne({ userId });
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not found' }),
      };
    }

    user.accountStatus = accountStatus;
    await user.save();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Account status updated successfully',
        userId: user.userId,
        accountStatus: user.accountStatus
      }),
    };
  } catch (err) {
    console.error('Error updating student account status:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error', error: err.message }),
    };
  }
};
