const mongoose = require('mongoose');

module.exports = async function connectDB() {
  if (!process.env.MONGO_URL) throw new Error('MONGO_URL is not configured');
  await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 5000 });
  console.log('MongoDB connected');
};
