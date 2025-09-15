const mongoose = require('mongoose');
console.log("inside the file")
const uri =
  process.env.MONGODB_URI ||
  'mongodb+srv://nagendrababutorlikonda_db_user:8NvWN2yYEdkSXpHE@tech4hopecluster.y7mlwdk.mongodb.net/tech4hope_db?retryWrites=true&w=majority&appName=tech4hopeCluster';

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
        bufferCommands: false,
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
