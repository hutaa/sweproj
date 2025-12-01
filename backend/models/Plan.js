import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  courses: {
    type: Array,   // stores your full course list with semesters
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Plan", PlanSchema);
