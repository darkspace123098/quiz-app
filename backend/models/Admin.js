import mongoose from "mongoose";

const classRefSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
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
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    managedClasses: [
      {
        type: String,
        trim: true,
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


