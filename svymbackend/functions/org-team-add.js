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
    const { name, role } = JSON.parse(event.body);
    if (!name || !role || typeof name !== 'string' || typeof role !== 'string' || name.trim() === '' || role.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Both name and role are required and must be non-empty strings' })
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

    const newMember = {
      name: name.trim(),
      role: role.trim()
    };

    org.team.push(newMember);
    await org.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Team member added successfully' })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
