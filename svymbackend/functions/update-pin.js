const { connectDB } = require("./utils/mongodb");
const User = require("./models/User");
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
    let doc;
    if (!userId || !newPin) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "User ID and new PIN are required." }),
      };
    }

    if (userId.startsWith("SVYMT")) {
      doc = await require("./models/Trainer").findOne({ trainerId : userId });
      if (!doc)
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Trainer not found." }),
        };
    } else if (userId.startsWith("SVYMS")) {
      doc = await User.findOne({ userId });
      if (!doc)
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "User not found." }),
        };
      if (doc.approvalStatus !== "approved")
        return {
          statusCode: 403,
          body: JSON.stringify({
            message: `Cannot update PIN. Current status: ${doc.approvalStatus}`,
          }),
        };
    } else if (userId.startsWith("SVYMFS")) {
      doc = await require("./models/FieldMobiliser").findOne({ userId });
      if (!doc)
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Field Mobiliser not found." }),
        };
      if (doc.approvalStatus !== "approved")
        return {
          statusCode: 403,
          body: JSON.stringify({
            message: `Cannot update PIN. Current status: ${doc.approvalStatus}`,
          }),
        };
    }

    // Only verify old PIN if provided (not first login)
    if (oldPin) {
      const isMatch = await bcrypt.compare(oldPin, doc.password);
      if (!isMatch)
        return {
          statusCode: 401,
          body: JSON.stringify({ message: "Old PIN is incorrect." }),
        };
    }

    const hashedNewPin = await bcrypt.hash(newPin, 10);

    doc.password = hashedNewPin;
    doc.isFirstLogin = false;
    await doc.save();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "PIN updated successfully!",
        user: { userId: doc.userId, role: "user", email: doc.email },
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
