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
import { allowedOrigins } from "./config/constants.js";

const frontendOrigin = process.env.FRONTEND_URL;
if (frontendOrigin) {
  allowedOrigins.push(frontendOrigin);
}

// Resolve __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("CORS blocked for origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  exposedHeaders: ["Set-Cookie"],
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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    },
  })
);

app.use("/api/quiz", quizRouter);
app.use("/api/proctor", proctorRouter);
app.use("/api/admin", adminRouter);

// Serve frontend static files
const publicPath = path.join(__dirname, "..", "frontend-new", "dist");
app.use(express.static(publicPath));

// SPA Fallback: for all non-API GET requests serve index.html so React Router handles them
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    res.sendFile(path.join(publicPath, "index.html"));
  } else {
    next();
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✓ Server listening on port ${PORT}`);
});

// Clean connection without deprecated options
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/quiz")
  .then(() => {
    console.log("✓ Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error("✗ MongoDB connection failed:", err.message);
    // Don't exit process immediately, let the server return 500s or try to reconnect
  });