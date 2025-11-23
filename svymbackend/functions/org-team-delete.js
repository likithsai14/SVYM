const { connectDB } = require('./utils/mongodb');
const mongoose = require('mongoose');
const Organization = require('./models/Organization');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    const { index } = JSON.parse(event.body);
    if (index === undefined || typeof index !== 'number' || index < 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Valid index is required' })
      };
    }

    await connectDB();
    const org = await Organization.findOne();
    if (!org) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Organization data not found' })
      };
    }

    if (index >= org.team.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid team member index' })
      };
    }

    org.team.splice(index, 1);
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Team member deleted successfully' })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
