// netlify/functions/getAllUsers.js
const { connectDB } = require('./utils/mongodb');
const User = require('./models/User');

exports.handler = async (event, context) => {
    try {
        if (event.httpMethod !== 'GET') {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Method Not Allowed' })
            };
        }

        await connectDB();

        // Fetch all users whose userId starts with 'SVYM'
        const students = await User.find({ userId: { $regex: /^SVYM/ } });

        //console.log(students);

        return {
            statusCode: 200,
            body: JSON.stringify({ students })
        };

    } catch (error) {
        console.error('Error fetching users:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: `Internal server error: ${error.message}` })
        };
    }
};
