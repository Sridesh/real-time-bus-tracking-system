const mongoose = require('mongoose');

const MONGO_CONNECTION_URI =
  process.env.MONGO_CONNECTION_URI ||
  'mongodb+srv://root:E33E7aXsT80FjokP@bus-tracking-system-clu.yooieso.mongodb.net/?retryWrites=true&w=majority&appName=bus-tracking-system-cluster';

if (!MONGO_CONNECTION_URI) {
  throw new Error('Cannot find MONGO_CONNECTION_URI in environment variables');
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_CONNECTION_URI);
  } catch (error) {
    console.error(error);
  }
};

module.exports = { connectDB };
