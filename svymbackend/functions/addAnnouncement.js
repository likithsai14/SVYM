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
    const { title, eventDate, description, addedBy } = body;

    // Validation
    if (!title || !eventDate || !description || !addedBy) {
      return { statusCode: 400, body: JSON.stringify({ message: "Title, eventDate, description, and addedBy are required" }) };
    }

    const newAnnouncement = new Announcement({
      title,
      eventDate,
      description,
      addedBy,
    });

    await newAnnouncement.save();

    // Log activity
    try {
      await fetch(process.env.NETLIFY_URL + '/.netlify/functions/addActivity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'announcement_added',
          description: `New announcement "<strong>${title}</strong>" was added.`,
          userId: addedBy
        })
      });
    } catch (activityError) {
      console.error('Error logging activity:', activityError);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Announcement added successfully", announcement: newAnnouncement }),
    };
  } catch (error) {
    console.error("Error adding announcement:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
