const { connectDB } = require("./utils/mongodb");
const Announcement = require("./models/Announcement");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "GET") {
      return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    // Connect to DB
    await connectDB();

    // Fetch all announcements, sorted by creation date descending
    const announcements = await Announcement.find().sort({ createdAt: -1 });

    return {
      statusCode: 200,
      body: JSON.stringify({ announcements }),
    };
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
