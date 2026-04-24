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
    submittedAt: {
      type: Date,
      default: Date.now
    },
    // Proctor monitoring data
    proctorVideoPath: {
      type: String,
      default: null
    },
    proctorLogPath: {
      type: String,
      default: null
    },
    malpracticeDetected: {
      type: Boolean,
      default: false
    },
    malpracticeDetails: {
      type: Schema.Types.Mixed,
      default: null
    }
  },
  {
    collection: "results"
  }
);

export default model("Result", resultSchema);
