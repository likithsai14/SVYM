const Course = require("./models/Course");
const Trainer = require("./models/Trainer");
const { connectDB } = require("./utils/mongodb");
const bcrypt = require("bcrypt");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method Not Allowed" }),
      };
    }

    await connectDB();

    const {
      courseId,
      startDate,
      endDate,
      durationMonths,
      description,
      moduleNames,
      trainer
    } = JSON.parse(event.body);

    if (!courseId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing courseId" }),
      };
    }

    const course = await Course.findOne({ courseId });
    if (!course) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Course not found" }),
      };
    }

    let trainerId, trainerName;

    // ✅ Handle new trainer creation
    if (trainer.isNewTrainer) {
      const requiredFields = ["name", "email", "mobile", "expertise", "securityQuestion", "securityAnswer"];
      for (const field of requiredFields) {
        if (!trainer[field]) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: `Missing required trainer field: ${field}` }),
          };
        }
      }

      // Check if trainer already exists
      const filter = {};
      if (trainer.email) filter.email = trainer.email;
      else if (trainer.mobile) filter.mobile = trainer.mobile;

      const existingTrainer = await Trainer.findOne(filter);
      if (existingTrainer) {
        trainerId = existingTrainer.trainerId;
        trainerName = existingTrainer.name;
      } else {
        const uniqueSuffix = Math.floor(10000 + Math.random() * 90000).toString();
        trainerId = `SVYMT${uniqueSuffix}`;
        trainerName = trainer.name;
        const hashedPassword = await bcrypt.hash(uniqueSuffix, 10);

        const newTrainer = new Trainer({
          ...trainer,
          trainerId,
          password: hashedPassword,
          role: "trainer",
          status: "Active",
          isFirstLogin: true,
        });

        await newTrainer.save();
      }
    } else if (trainer.trainerId && trainer.trainerName) {
      trainerId = trainer.trainerId;
      trainerName = trainer.trainerName;
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Trainer info missing" }),
      };
    }

    // ✅ Update course
    if (startDate) course.startDate = startDate;
    if (endDate) course.endDate = endDate;
    if (durationMonths) course.durationMonths = durationMonths;
    if (description) course.description = description;
    if (Array.isArray(moduleNames)) course.moduleNames = moduleNames;

    course.trainerId = trainerId;
    course.trainerName = trainerName;

    await course.save();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Course updated successfully",
        updatedCourse: course,
      }),
    };
  } catch (err) {
    console.error("Error in updateCourse:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Internal Server Error: ${err.message}` }),
    };
  }
};
