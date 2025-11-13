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
    const { id, title, eventDate, description } = body;

    // Validation
    if (!id || !title || !eventDate || !description) {
      return { statusCode: 400, body: JSON.stringify({ message: "ID, title, eventDate, and description are required" }) };
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return { statusCode: 404, body: JSON.stringify({ message: "Announcement not found" }) };
    }

    announcement.title = title;
    announcement.eventDate = eventDate;
    announcement.description = description;
    await announcement.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Announcement updated successfully", announcement }),
    };
  } catch (error) {
    console.error("Error updating announcement:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
