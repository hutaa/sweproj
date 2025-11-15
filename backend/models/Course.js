import mongoose from "mongoose";

const prerequisiteSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["OR", "AND", "SINGLE"],
    default: "SINGLE"
  },
  courses: [String],
  min_grade: String,
  alternatives: [String]
});

const courseSchema = new mongoose.Schema({
  course_code: {
    type: String,
    required: true,
    unique: true
  },
  course_name: {
    type: String,
    required: true
  },
  credit: {
    type: Number,
    required: true
  },
  description: String,
  category: String,
  prerequisites: [prerequisiteSchema]
});

export default mongoose.model("Course", courseSchema);