const Trainer = require("./models/Trainer"); // assuming you define the schema in models/FieldMobiliser.js
const { connectDB } = require("./utils/mongodb");
const bcrypt = require("bcrypt");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "GET") {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method Not Allowed" }),
      };
    }
    await connectDB();

    const trainers = await Trainer.find();

    if (trainers.length !== 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Trainer with given email or mobile already exists.",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ trainers }),
    };
  } catch (error) {
    console.error("Netlify Function error:", error);

    if (
      error.message.includes("authorization") ||
      error.message.includes("authentication")
    ) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message:
            "Backend Authentication Error: Function not authorized to connect to MongoDB. Check environment variables.",
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Internal server error: ${error.message}`,
      }),
    };
  }
};
