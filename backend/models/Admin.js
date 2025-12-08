import mongoose from "mongoose";

const classRefSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      enum: ["BCA-I", "BCA-II", "BCA-III"],
      required: true,
    },
    contestants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contestant",
        default: [],
      },
    ],
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        default: [],
      },
    ],
    results: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Result",
        default: [],
      },
    ],
  },
  { _id: false }
);

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
    managedClasses: [
      {
        type: String,
        enum: ["BCA-I", "BCA-II", "BCA-III"],
      },
    ],
    classes: [classRefSchema],
  },
  {
    collection: "admins",
    timestamps: true,
  }
);

export default mongoose.model("Admin", adminSchema);


