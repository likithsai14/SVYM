const { connectDB } = require("./utils/mongodb");
const Placement = require("./models/Placement");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "GET") {
      return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    // Connect to DB
    await connectDB();

    const placements = await Placement.find({ alumniName: { $exists: true } }).sort({ createdAt: -1 });

    return {
      statusCode: 200,
      body: JSON.stringify({ placements }),
    };
  } catch (error) {
    console.error("Error fetching placements:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
