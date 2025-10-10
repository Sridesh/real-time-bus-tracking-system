const mongoose = require('mongoose');

const connectDB = async () => {
  const MONGO_CONNECTION_URI = process.env.MONGO_CONNECTION_URI;

  if (!MONGO_CONNECTION_URI) {
    throw new Error('Cannot find MONGO_CONNECTION_URI in environment variables');
  }

  try {
    await mongoose.connect(MONGO_CONNECTION_URI);
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

module.exports = { connectDB };
