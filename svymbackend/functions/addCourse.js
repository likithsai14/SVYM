const { connectDB } = require("./utils/mongodb");
const Course = require("./models/Course");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    // Ensure DB connection before any query
    await connectDB();
    //await Course.init(); // ensures indexes like unique: true are created

    const body = JSON.parse(event.body);
    const { courseName, startDate, endDate, moduleNames, addedBy } = body;

    if (!courseName || !startDate || !endDate || !moduleNames || moduleNames.length === 0 || !addedBy) {
      return { statusCode: 400, body: JSON.stringify({ message: "All fields are required" }) };
    }

    // Generate unique 5-digit courseId
    let courseId;
    let existing;
    do {
      courseId = Math.floor(10000 + Math.random() * 90000).toString();
      //existing = await Course.findOne({ courseId });
    } while (existing);

    // Determine courseStatus
    const today = new Date();
    let courseStatus = "Upcoming";
    if (today >= new Date(startDate) && today <= new Date(endDate)) {
      courseStatus = "Ongoing";
    } else if (today > new Date(endDate)) {
      courseStatus = "Completed";
    }

    const newCourse = new Course({
      courseId,
      courseName,
      startDate,
      endDate,
      moduleNames,
      addedBy,
      courseStatus,
      trainerId: null, // initially unassigned
    });

    await newCourse.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Course added successfully", course: newCourse }),
    };
  } catch (error) {
    console.error("Error adding course:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
