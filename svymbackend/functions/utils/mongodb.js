const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log('✅ Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔌 Connecting to MongoDB...');
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false, // disable buffering
        serverSelectionTimeoutMS: 10000, // fail if cannot connect in 10s
        serverApi: { version: '1', strict: true, deprecationErrors: true },
      })
      .then((mongoose) => {
        console.log('✅ Connected to MongoDB Atlas');
        return mongoose;
      })
      .catch((err) => {
        console.error('❌ Connection error:', err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDB };
