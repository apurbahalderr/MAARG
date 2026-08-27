import mongoose from "mongoose";

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return; // already connected

  const URI = process.env.MONGODB_URI;
  if (!URI) throw new Error("MONGODB_URI is not defined in environment variables");

  try {
    await mongoose.connect(URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error; // re-throw so callers (API routes) get a 500 with real reason
  }
}
