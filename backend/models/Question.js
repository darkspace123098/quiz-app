import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
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

    questionText: {
      type: String,
      required: true,
      trim: true
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: arr => arr.length === 4,
        message: "Exactly 4 options are required."
      }
    },

    correctAnswer: {
      type: String,
      required: true,
      trim: true
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: "questions"
  }
);

export default mongoose.model("Question", questionSchema);
