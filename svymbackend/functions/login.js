const { connectDB } = require("./utils/mongodb");
const User = require("./models/User");
const Admin = require("./models/Admin");
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

  console.log("In backend login function");

  try {
    await connectDB();
    const { userId, password } = JSON.parse(event.body);

    if (!userId || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "User ID and password are required." }),
      };
    }

    // ------------------- Trainer Login -------------------
    if (userId.startsWith("SVYMT")) {
      const trainerDoc = await Trainer.findOne({ trainerId: userId });
      console.log(trainerDoc);

      if (!trainerDoc) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: "Invalid Trainer ID or Password." }),
        };
      }

      const isMatch = await bcrypt.compare(password, trainerDoc.password);
      if (!isMatch) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: "Invalid Trainer ID or Password." }),
        };
      }

      trainerDoc.loginCount = (trainerDoc.loginCount || 0) + 1;
      trainerDoc.lastLoginAt = new Date();
      await trainerDoc.save();

      if (trainerDoc.isFirstLogin) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "First login detected. Please update your PIN.",
            isFirstLoginPrompt: true,
            user: {
              userId: trainerDoc.trainerId,
              email: trainerDoc.email,
              role: "trainer",
              username: trainerDoc.name,
            },
          }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Login successful!",
          user: {
            userId: trainerDoc.trainerId,
            email: trainerDoc.email,
            role: "trainer",
            username: trainerDoc.name,
          },
        }),
      };
    }

    // ------------------- Field Mobiliser Login -------------------
    if (userId.startsWith("SVYMFM")) {
      const fmDoc = await FieldMobiliser.findOne({ userId });
      console.log(fmDoc);

      if (!fmDoc) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: "Invalid Field Mobiliser ID or Password." }),
        };
      }

      const isMatch = await bcrypt.compare(password, fmDoc.password);
      if (!isMatch) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: "Invalid Field Mobiliser ID or Password." }),
        };
      }

      fmDoc.loginCount = (fmDoc.loginCount || 0) + 1;
      fmDoc.lastLoginAt = new Date();
      await fmDoc.save();

      if (fmDoc.isFirstLogin) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "First login detected. Please update your PIN.",
            isFirstLoginPrompt: true,
            user: {
              userId: fmDoc.userId,
              email: fmDoc.email,
              role: "fieldMobiliser",
              username: fmDoc.FieldMobiliserName,
            },
          }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Login successful!",
          user: {
            userId: fmDoc.userId,
            email: fmDoc.email,
            role: "fieldMobiliser",
            username: fmDoc.FieldMobiliserName,
          },
        }),
      };
    }

    // ------------------- Admin Login -------------------
    const adminDoc = await Admin.findOne({ username: userId });
    if (adminDoc) {
      console.log(adminDoc);

      const isMatch = await bcrypt.compare(password, adminDoc.password);
      if (!isMatch) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: "Invalid Admin ID or Password." }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Admin login successful!",
          user: { userId: adminDoc.username, role: "admin", username : adminDoc.username },
        }),
      };
    }

    // ------------------- Normal User Login -------------------
    const userDoc = await User.findOne({ userId });
    if (!userDoc) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid User ID or Password." }),
      };
    }

    if (userDoc.approvalStatus !== "approved") {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: `Cannot login. Current status: ${userDoc.approvalStatus}`,
        }),
      };
    }

    const isMatch = await bcrypt.compare(password, userDoc.password);
    if (!isMatch) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid User ID or Password." }),
      };
    }

    userDoc.loginCount = (userDoc.loginCount || 0) + 1;
    userDoc.lastLoginAt = new Date();
    await userDoc.save();

    if (userDoc.isFirstLogin) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "First login detected. Please update your PIN.",
          isFirstLoginPrompt: true,
          user: { userId: userDoc.userId, email: userDoc.email, role: "user", username : userDoc.candidateName },
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Login successful!",
        user: { userId: userDoc.userId, email: userDoc.email, role: "user", username : userDoc.candidateName },
      }),
    };
  } catch (err) {
    console.error("Login error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Internal server error: ${err.message}`,
      }),
    };
  }
};
