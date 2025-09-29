const { connectDB } = require("./utils/mongodb");
const User = require("./models/User");
const Trainer = require("./models/Trainer");
const FieldMobiliser = require("./models/FieldMobiliser");
const bcrypt = require("bcrypt");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    await connectDB();
    const { userId, oldPin, newPin } = JSON.parse(event.body);

    if (!userId || !newPin) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "User ID and new PIN are required." }),
      };
    }

    let doc;
    let role;

    // ---------------- Trainer ----------------
    if (userId.startsWith("SVYMT")) {
      doc = await Trainer.findOne({ trainerId: userId });
      role = "trainer";
      if (!doc) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Trainer not found." }),
        };
      }
    }

    // ---------------- Field Mobiliser ----------------
    else if (userId.startsWith("SVYMFM")) {
      doc = await FieldMobiliser.findOne({ userId });
      role = "fieldMobiliser";
      if (!doc) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Field Mobiliser not found." }),
        };
      }
    }

    // ---------------- Normal User ----------------
    else if (userId.startsWith("SVYM")) {
      doc = await User.findOne({ userId });
      role = "user";
      if (!doc) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "User not found." }),
        };
      }
    }

    // ---------------- No match ----------------
    else {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid User ID format." }),
      };
    }

    // Verify old PIN if provided

    // Hash and update new PIN
    const hashedNewPin = await bcrypt.hash(newPin, 10);
    doc.password = hashedNewPin;
    doc.isFirstLogin = false;
    await doc.save();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "PIN updated successfully!",
        user: {
          userId: doc.userId || doc.trainerId || doc.fmId,
          role,
          email: doc.email,
        },
      }),
    };
  } catch (err) {
    console.error("Update PIN error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Internal server error: ${err.message}`,
      }),
    };
  }
};
