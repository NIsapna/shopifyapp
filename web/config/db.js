import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.DataBaseUrl;

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected successfully`);
  } catch (error) {
    console.error("Connection to MongoDB failed:", error);
    // ✅ Exit process if DB is critical
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB; // Use ES module export
