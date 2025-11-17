const { connectDB } = require("./utils/mongodb");
const Placement = require("./models/Placement");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "GET") {
      return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    // Connect to DB
    await connectDB();

    // Parse query parameters for pagination and filtering
    const page = parseInt(event.queryStringParameters?.page) || 1;
    const limit = parseInt(event.queryStringParameters?.limit) || 10;
    const search = event.queryStringParameters?.search || "";
    const status = event.queryStringParameters?.status || "";
    const skip = (page - 1) * limit;

    // Build filter query
    let filterQuery = { alumniName: { $exists: true } };

    // Add search filter
    if (search) {
      filterQuery.$or = [
        { alumniName: { $regex: search, $options: 'i' } },
        { trainingName: { $regex: search, $options: 'i' } },
        { jobPlace: { $regex: search, $options: 'i' } },
        { followUpBy: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status === "placed") {
      filterQuery.isPlaced = true;
    } else if (status === "not-placed") {
      filterQuery.isPlaced = false;
    }

    // Get total count for pagination (with filters applied)
    const totalPlacements = await Placement.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalPlacements / limit);

    // Fetch paginated placements (with filters applied)
    const placements = await Placement.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      statusCode: 200,
      body: JSON.stringify({
        placements,
        pagination: {
          currentPage: page,
          totalPages,
          totalPlacements,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }),
    };
  } catch (error) {
    console.error("Error fetching placements:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
