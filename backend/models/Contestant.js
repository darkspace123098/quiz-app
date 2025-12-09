import mongoose from "mongoose";

const { Schema, model } = mongoose;

const contestantResultSchema = new Schema({
  responses: {
    type: Map,
    of: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const contestantSchema = new Schema(
  {
    usn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    className: {
      type: String,
      required: true,
      trim: true
    },
    quizCode: {
      type: String,
      required: true,
      trim: true
    },
    quizPassword: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    results: [contestantResultSchema]
  },
  {
    collection: "contestants"
  }
);

export default model("Contestant", contestantSchema);
