const { connectDB } = require("./utils/mongodb");
const Placement = require("./models/Placement");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    // Connect to DB
    await connectDB();

    const body = JSON.parse(event.body);
    const { id } = body;

    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ message: "Placement ID is required" }) };
    }

    const deletedPlacement = await Placement.findByIdAndDelete(id);

    if (!deletedPlacement) {
      return { statusCode: 404, body: JSON.stringify({ message: "Placement not found" }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Placement deleted successfully" }),
    };
  } catch (error) {
    console.error("Error deleting placement:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
