const { connectDB } = require("./utils/mongodb");
const mongoose = require("mongoose");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    // Connect to DB
    await connectDB();

    // Drop the announcements collection
    try {
      await mongoose.connection.db.dropCollection("announcements");
      console.log("Announcements collection dropped successfully");
    } catch (error) {
      // If collection doesn't exist, that's fine
      if (error.message.includes("ns not found")) {
        console.log("Announcements collection doesn't exist, nothing to drop");
      } else {
        throw error;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: "Announcements collection reset successfully. You can now add announcements with the new schema." 
      }),
    };
  } catch (error) {
    console.error("Error resetting announcements collection:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
