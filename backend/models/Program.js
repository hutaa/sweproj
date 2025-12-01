// program.js
import mongoose from "mongoose";

const courseRequirementSchema = new mongoose.Schema({
  course_code: {
    type: String,
    required: true
  },
  course_name: String,
  credits: Number,
  min_grade: String,
  category: String
});

const sequenceOptionSchema = new mongoose.Schema({
  sequence_name: String,
  courses: [String]
});

const scienceSequenceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["OR", "AND", "SINGLE"],
    default: "SINGLE"
  },
  options: [sequenceOptionSchema],
  lab_requirement: [courseRequirementSchema]
});

const electiveGroupSchema = new mongoose.Schema({
  required_count: Number,
  options: [courseRequirementSchema]
});

const requirementsSchema = new mongoose.Schema({
  required_courses: {
    cs_core: [courseRequirementSchema],
    math: [courseRequirementSchema],
    statistics: [courseRequirementSchema],
    science_sequences: scienceSequenceSchema
  },
  electives: {
    computer_science_electives: electiveGroupSchema,
    technical_electives: electiveGroupSchema
  }
});

const programSchema = new mongoose.Schema({
  program_name: {
    type: String,
    required: true
  },
  program_type: String,
  total_credits_required: Number,
  requirements: requirementsSchema
});

export default mongoose.model("Program", programSchema);