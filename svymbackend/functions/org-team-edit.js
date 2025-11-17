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
    const { index, name, role } = JSON.parse(event.body);
    if (index === undefined || !name || !role || typeof name !== 'string' || typeof role !== 'string' || name.trim() === '' || role.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Index, name, and role are required and must be valid' })
      };
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const org = await Organization.findOne();
    if (!org) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Organization data not found' })
      };
    }

    if (index < 0 || index >= org.team.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid team member index' })
      };
    }

    org.team[index].name = name.trim();
    org.team[index].role = role.trim();
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Team member updated successfully' })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
