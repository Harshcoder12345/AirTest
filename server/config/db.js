import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/voucher_portal';
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // If in development and local Mongo is not running, try fallback message
    console.log('Ensure process.env.MONGODB_URI is set or local MongoDB is running.');
    process.exit(1);
  }
};

export default connectDB;
