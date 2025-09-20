// netlify/functions/fieldmobilisersignup.js
const { connectDB } = require("./utils/mongodb");
const FieldMobiliser = require("./models/FieldMobiliser");
const bcrypt = require("bcrypt");

// Helper: generate unique 5-digit suffix (random + check if exists)
async function generateUniqueFiveDigitSuffix() {
  let suffix, exists;
  do {
    suffix = Math.floor(10000 + Math.random() * 90000); // random 5-digit number
    const userId = `SVYMFM${suffix}`;
    exists = await FieldMobiliser.exists({ userId });
  } while (exists);
  return suffix;
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    // ✅ Ensure DB connection
    await connectDB();

    const data = JSON.parse(event.body);
    console.log(data);
    // Required fields
    const requiredFields = [
      "FieldMobiliserName",
      "FieldMobiliserEmailID",
      "FieldMobiliserMobileNo",
      "FieldMobiliserRegion",
      "FieldMobiliserSupportedProject",
    ];

    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === "") {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: `Missing required field: ${field}` }),
        };
      }
    }

    // ✅ addedBy from frontend
    if (!data.addedBy) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing admin identifier (addedBy)",
        }),
      };
    }

    // Generate unique userId
    const uniqueSuffix = await generateUniqueFiveDigitSuffix();
    const userId = `SVYMFM${uniqueSuffix}`;

    // First password = last 5 digits of userId (hashed)
    const plainPassword = String(uniqueSuffix);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Create new mobiliser
    const newUser = new FieldMobiliser({
      userId,
      FieldMobiliserName: data.FieldMobiliserName,
      FieldMobiliserEmailID: data.FieldMobiliserEmailID,
      FieldMobiliserMobileNo: data.FieldMobiliserMobileNo,
      FieldMobiliserRegion: data.FieldMobiliserRegion,
      FieldMobiliserSupportedProject: data.FieldMobiliserSupportedProject,
      addedBy: data.addedBy,
      password: hashedPassword,
      createdAt: new Date(),
    });

    try {
      await newUser.save();
      console.log(`✅ New mobiliser added: ${data.FieldMobiliserName} (User ID: ${userId})`);
    } catch (saveError) {
      if (saveError.code === 11000) {
        console.error("❌ Duplicate key error:", saveError.keyValue);
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: `Duplicate entry: ${Object.keys(saveError.keyValue)[0]} already exists.`,
          }),
        };
      }
      console.error("❌ Error saving user:", saveError);
      throw saveError;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Sign up successful! User created successfully.",
        userId: userId,
        initialPassword: plainPassword, // ⚠️ Only for admin reference
      }),
    };
  } catch (error) {
    console.error("❌ Error processing signup request:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "An unexpected error occurred. Please try again later.",
        error: error.message,
      }),
    };
  }
};
