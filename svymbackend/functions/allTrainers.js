// netlify/functions/getAllTrainers.js
const { connectDB } = require("./utils/mongodb");
const Trainer = require("./models/Trainer");

exports.handler = async function (event, context) {
  try {
    // Only allow GET
    if (event.httpMethod !== "GET") {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method Not Allowed" }),
      };
    }

    // Connect to DB
    await connectDB();

    // Fetch all trainers
    const trainers = await Trainer.find();

    return {
      statusCode: 200,
      body: JSON.stringify({ trainers }),
    };
  } catch (error) {
    console.error("❌ Error fetching trainers:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server Error", error: error.message }),
    };
  }
};
