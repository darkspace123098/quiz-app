import { Schema, model } from "mongoose";

const resultSchema = new Schema(
  {
    contestant: {
      type: Schema.Types.ObjectId,
      ref: "Contestant"
    },
    className: {
      type: String,
      required: true
    },
    quizCode: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    usn: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    responses: {
      type: Schema.Types.Mixed,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["completed", "no respond", "rules violation"],
      default: "completed"
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: "results"
  }
);

export default model("Result", resultSchema);
