import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  const mongoURI = process.env.MONGODB_URI;

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 4000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️  MongoDB Connection Notice: Could not connect to '${mongoURI}'.`);
    console.warn(`👉 For Local MongoDB: Ensure 'mongod' service is running.`);
    console.warn(`👉 For Cloud MongoDB: Set MONGODB_URI in server/.env with your free MongoDB Atlas URI.`);
    console.warn(`ℹ️  Running in Resilient Fallback Mode so APIs remain testable.`);
  }
};

export const getDBStatus = () => ({
  connected: mongoose.connection.readyState === 1,
  state: mongoose.connection.readyState,
});
