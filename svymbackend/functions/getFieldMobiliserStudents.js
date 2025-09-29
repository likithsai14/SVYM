// netlify/functions/getFieldMobiliserStudents.js
const { connectDB } = require("./utils/mongodb");
const User = require("./models/User");

exports.handler = async function (event, context) {
  try {
    // ✅ Allow only POST
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method Not Allowed" }),
      };
    }

    // ✅ Parse request body
    const { fieldMobiliserId } = JSON.parse(event.body || "{}");
    if (!fieldMobiliserId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "fieldMobiliserId is required" }),
      };
    }

    // ✅ Connect to DB
    await connectDB();

    // ✅ Fetch all students for this mobiliser
    console.log(fieldMobiliserId);
    const students = await User.find({ fieldMobiliserId });
    console.log("field mobile students data: ", students);
    return {
      statusCode: 200,
      body: JSON.stringify({ students }),
    };
  } catch (error) {
    console.error("❌ Error fetching field mobiliser students:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server Error", error: error.message }),
    };
  }
};
