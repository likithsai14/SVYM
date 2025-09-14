// netlify/functions/utils/mongodb.js
const mongoose = require("mongoose");

// Connection URI
const uri = process.env.MONGODB_URI || 
  "mongodb+srv://nagendrababutorlikonda_db_user:8NvWN2yYEdkSXpHE@tech4hopecluster.y7mlwdk.mongodb.net/tech4hope_db?retryWrites=true&w=majority&appName=tech4hopeCluster";

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, clientOptions);
    console.log("✅ Connected to MongoDB Atlas: tech4hope_db");
  }
}

module.exports = { connectDB };
