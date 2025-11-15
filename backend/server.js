import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import Course from "./models/Course.js";
import Program from "./models/Program.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    console.log("📊 Database name:", mongoose.connection.db.databaseName);

    // Start the server only after MongoDB is ready
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));

// --- ROUTES ---

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working and connected to MongoDB!" });
});

// Get all courses
app.get("/api/courses", async (req, res) => {
  try {
    console.log("📚 Fetching courses...");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("📁 Available collections:", collections.map(c => c.name));

    const mongooseCount = await Course.countDocuments();
    console.log(`🔢 Mongoose count: ${mongooseCount} courses`);

    const courses = await Course.find();
    console.log(`📋 Found ${courses.length} courses`);

    res.json(courses);
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all programs
app.get("/api/programs", async (req, res) => {
  try {
    console.log("🎓 Fetching programs...");

    const db = mongoose.connection.db;
    const nativeCount = await db.collection("programs").countDocuments();
    console.log(`🔢 Native MongoDB programs count: ${nativeCount}`);

    const programs = await Program.find();
    console.log(`📋 Mongoose found: ${programs.length} programs`);

    res.json(programs);
  } catch (error) {
    console.error("❌ Error fetching programs:", error);
    res.status(500).json({ error: error.message });
  }
});

// Debug route
app.get("/api/debug", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const dbName = mongoose.connection.db.databaseName;
    const collections = await db.listCollections().toArray();

    const courseCount = await db.collection("courses").countDocuments();
    const sampleCourse = await db.collection("courses").findOne();

    res.json({
      database: dbName,
      collections: collections.map(c => c.name),
      courseCount,
      sampleCourse,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
