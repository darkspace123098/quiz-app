import { config } from "dotenv";
config();
import express, { json } from "express";
import "mongoose";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import Admin from "./models/Admin.js";
import Contestant from "./models/Contestant.js";
import Question from "./models/Question.js";
import Result from "./models/Results.js";
import ClassModel from "./models/Class.js";
import quizRouter from "./routes/quiz.js";
import proctorRouter from "./routes/proctor.js";
import adminRouter from "./routes/admin.js";
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5000",
];

// Resolve __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "quiz-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000, // 1 hour
      httpOnly: true,
      sameSite: "lax",
      secure: false
    }
  })
);

app.use("/api/quiz", quizRouter);
app.use("/api/proctor", proctorRouter);
app.use("/api/admin", adminRouter);

app.get("/", (req, res) => {
  res.json({ message: "Quiz App API Server" });
});


// Serve frontend static files
const publicPath = path.join(__dirname, "..", "frontend-new", "dist");
app.use(express.static(publicPath));

// SPA Fallback: Serve index.html for any other GET requests (e.g. /admin/overview)
// Express 5 requires RegExp for wildcards
app.get(/\/.*/, (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});


// Clean connection without deprecated options
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/quiz")
  .then(() => {
    console.log("✓ Connected to MongoDB successfully");

    // Start server after MongoDB connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✓ Admin panel available at http://localhost:${PORT}/admin/login`);
    });
  })
  .catch((err) => {
    console.error("✗ MongoDB connection failed:", err.message);
    process.exit(1);
  });