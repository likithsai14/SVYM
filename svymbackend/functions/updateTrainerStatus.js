const { connectDB } = require("./utils/mongodb");
const Trainer = require("./models/Trainer");

exports.handler = async (event) => {
  if (event.httpMethod !== "PUT") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  }

  try {
    const { trainerId, status } = JSON.parse(event.body);

    if (!trainerId || !["Active", "Inactive"].includes(status)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid input" }),
      };
    }

    await connectDB();
    const updatedTrainer = await Trainer.findOneAndUpdate(
      { trainerId },
      { status },
      { new: true }
    );

    if (!updatedTrainer) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Trainer not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Trainer ${trainerId} updated successfully`,
        trainer: updatedTrainer,
      }),
    };
  } catch (err) {
    console.error("Error updating trainer status:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error", error: err.message }),
    };
  }
};
