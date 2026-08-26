import mongoose from "mongoose";

export async function connectDB() {
  const URI = process.env.MONGODB_URI;

  try {
    if (!URI) {
      throw new Error("MONGODB_URI is not defined")
    }
    await mongoose.connect(URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}
