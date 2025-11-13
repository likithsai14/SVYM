const Announcement = require("./models/Announcement");
const { connectDB } = require("./utils/mongodb");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method Not Allowed" }),
      };
    }

    await connectDB();

    const { id } = JSON.parse(event.body);
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing announcement id in request body" }),
      };
    }

    const existingAnnouncement = await Announcement.findById(id);
    if (!existingAnnouncement) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Announcement not found" }),
      };
    }

    await Announcement.findByIdAndDelete(id);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Announcement deleted successfully",
        deletedAnnouncementId: id,
      }),
    };
  } catch (err) {
    console.error("Error in deleteAnnouncement:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Internal Server Error: ${err.message}` }),
    };
  }
};
