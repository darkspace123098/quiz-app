import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    quizTime: {
      type: Number,
      default: 300, // Default 5 minutes in seconds
      min: 60, // Minimum 1 minute
      max: 3600, // Maximum 1 hour
    },
  },
  { collection: "classes", timestamps: true }
);

export default mongoose.model("Class", classSchema);

