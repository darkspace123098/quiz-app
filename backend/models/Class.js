import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { collection: "classes", timestamps: true }
);

export default mongoose.model("Class", classSchema);

