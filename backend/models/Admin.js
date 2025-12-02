import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
    },
    classes: [
      {
        type: String,
      },
    ],
  },
  {
    collection: "admins",
    timestamps: true,
  }
);

export default mongoose.model("Admin", adminSchema);


