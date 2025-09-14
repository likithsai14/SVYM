// netlify/functions/userUpdate.js
const { connectDB } = require('./utils/mongodb');
const User = require('./models/User'); // Mongoose model for users

exports.handler = async (event, context) => {
    try {
        if (event.httpMethod !== 'PUT') {
            return {
                statusCode: 405,
                headers: { 'Allow': 'PUT' },
                body: JSON.stringify({ message: 'Method Not Allowed' })
            };
        }

        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Request body is required.' })
            };
        }

        await connectDB();

        // Parse the updated user data
        const { _id, approvalStatus, ...otherFields } = JSON.parse(event.body);

        if (!_id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'User ID (_id) is required for update.' })
            };
        }

        if (approvalStatus === undefined) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'approvalStatus field is required for update.' })
            };
        }

        // Update the user document
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            { approvalStatus, ...otherFields },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found.' })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User approval status updated successfully.', user: updatedUser })
        };

    } catch (error) {
        console.error('Error updating user:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message })
        };
    }
};
