// netlify/functions/getAllFieldMobilisers.js
const { connectDB } = require("./utils/mongodb");
const FieldMobiliser = require("./models/FieldMobiliser");

exports.handler = async function (event, context) {
  try {
    // Only allow GET requests
    if (event.httpMethod !== "GET") {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method Not Allowed" }),
      };
    }

    // Connect to DB
    await connectDB();

    // Fetch all field mobilisers, only select userId and FieldMobiliserName
    const fieldMobilisers = await FieldMobiliser.find({}, { userId: 1, FieldMobiliserName: 1, _id: 0 });

    return {
      statusCode: 200,
      body: JSON.stringify({ fieldMobilisers }),
    };
  } catch (error) {
    console.error("❌ Error fetching field mobilisers:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server Error", error: error.message }),
    };
  }
};
