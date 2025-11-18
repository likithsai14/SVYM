const connectToDatabase = require('./utils/mongodb');
const Activity = require('./models/Activity');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        await connectToDatabase();

        const { type, description, userId, details } = JSON.parse(event.body);

        const newActivity = new Activity({
            type,
            description,
            userId,
            details
        });

        await newActivity.save();

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Activity logged successfully', activity: newActivity }),
        };
    } catch (error) {
        console.error('Error logging activity:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
