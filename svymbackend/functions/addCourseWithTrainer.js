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

    const { course, trainer, addedBy } = JSON.parse(event.body);
    console.log("Course ", course);
    console.log("trainer ", trainer);
    console.log("added by  ", addedBy);
    let trainerId;
    let trainerName;

    // ✅ CASE 1: Add New Trainer
    if (trainer.isNewTrainer) {
      // Validation: ensure all required trainer fields exist
      console.log("in case 1");
      const requiredFields = ["name", "email", "mobile", "expertise", "securityQuestion", "securityAnswer"];
      for (const field of requiredFields) {
        if (!trainer[field]) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: `Missing required field: ${field}` }),
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
    }
    // ✅ CASE 2: Use Existing Trainer
    else if (trainer.trainerId && trainer.trainerName) {
      console.log("case 2 ");
      trainerId = trainer.trainerId;
      trainerName = trainer.trainerName;
    }
    // ❌ No trainer info
    else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Trainer information missing. Please select or add a trainer.",
        }),
      };
    }

    // ✅ Create Course
    const uniqueCourseSuffix = Math.floor(10000 + Math.random() * 90000).toString();
    const courseId = uniqueCourseSuffix;

    const newCourse = new Course({
    ...course,
    durationMonths: course.duration, // ✅ map correct field
    courseId,
    trainerId,
    trainerName,
    addedBy
  });
  delete newCourse._doc.duration; // optional cleanup


    await newCourse.save();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Course and trainer processed successfully",
        course: newCourse,
        trainerId,
        trainerName,
      }),
    };
  } catch (err) {
    console.error("Error in addCourseWithTrainer:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Internal Server Error: ${err.message}` }),
    };
  }
};
