const connectToDatabase = require('./utils/mongodb');
const Activity = require('./models/Activity');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        await connectToDatabase();

        const activities = await Activity.find({})
            .sort({ timestamp: -1 })
            .limit(10)
            .exec();

        return {
            statusCode: 200,
            body: JSON.stringify({ activities }),
        };
    } catch (error) {
        console.error('Error fetching recent activities:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
