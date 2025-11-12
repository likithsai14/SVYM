const { connectDB } = require("./utils/mongodb");
const Announcement = require("./models/Announcement");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    // Connect to DB
    await connectDB();

    const body = JSON.parse(event.body);
    const { text, addedBy } = body;

    // Validation
    if (!text || !addedBy) {
      return { statusCode: 400, body: JSON.stringify({ message: "Text and addedBy are required" }) };
    }

    const newAnnouncement = new Announcement({
      text,
      addedBy,
    });

    await newAnnouncement.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Announcement added successfully", announcement: newAnnouncement }),
    };
  } catch (error) {
    console.error("Error adding announcement:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
