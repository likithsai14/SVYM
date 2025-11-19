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
    const {
      userId,
      alumniName,
      parentSpouseName,
      trainingName,
      completionDate,
      isPlaced,
      jobPlace,
      earningPerMonth,
      employmentType,
      followUpBy,
      addedBy
    } = body;

    // Validation
    if (!userId || !alumniName || !parentSpouseName || !trainingName || !completionDate || isPlaced === undefined || !jobPlace || !followUpBy || !addedBy) {
      return { statusCode: 400, body: JSON.stringify({ message: "Required fields are missing" }) };
    }

    if (isPlaced && (earningPerMonth === undefined || !employmentType)) {
      return { statusCode: 400, body: JSON.stringify({ message: "Earning per month and employment type are required for placed students" }) };
    }

    const newPlacement = new Placement({
      userId,
      alumniName,
      parentSpouseName,
      trainingName,
      completionDate,
      isPlaced,
      jobPlace,
      earningPerMonth: isPlaced ? earningPerMonth : null,
      employmentType: isPlaced ? body.employmentType : null,
      followUpBy,
      addedBy,
    });

    await newPlacement.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Placement added successfully", placement: newPlacement }),
    };
  } catch (error) {
    console.error("Error adding placement:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
