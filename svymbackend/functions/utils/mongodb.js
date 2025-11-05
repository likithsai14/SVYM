const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

async function connectDB() {
  console.log('🔌 Connecting to MongoDB...');
  return mongoose.connect(uri, {
    bufferCommands: false, // disable buffering
    serverSelectionTimeoutMS: 30000, // increase timeout to 30s
    socketTimeoutMS: 45000, // socket timeout
    maxPoolSize: 10, // maintain up to 10 socket connections
    serverApi: { version: '1', strict: true, deprecationErrors: true },
  });
}

module.exports = { connectDB };
