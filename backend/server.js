import express, { json } from "express";
import { config } from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST before importing anything that uses them
// Try loading from both backend directory and project root
const envResult1 = config({ path: path.join(__dirname, ".env") });
const envResult2 = config({ path: path.join(__dirname, "..", ".env") });

// Log environment loading status
if (envResult1.error && envResult2.error) {
  console.log("⚠ No .env file found, using default credentials");
  console.log(`  Default superadmin username: superadmin`);
} else {
  console.log("✓ Environment variables loaded");
  console.log(`  Superadmin username: ${process.env.SUPERADMIN_USERNAME || "superadmin"}`);
  console.log(`  Superadmin password: ${process.env.SUPERADMIN_PASSWORD ? "***set***" : "not set (using default)"}`);
}

import { corsMiddleware } from "./middleware/cors.js";
import { sessionMiddleware } from "./middleware/session.js";
import quizRouter from "./routes/quiz.js";
import adminRouter from "./routes/admin.js";

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(json());
app.set("trust proxy", 1);
app.use(sessionMiddleware);

// Register routes
fetch("/api/admin/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify(data)
});
app.use("/api/quiz", quizRouter);
app.use("/admin", adminRouter);

// Serve frontend static files (after admin routes to avoid conflicts)
const publicPath = path.join(__dirname, "..", "frontend", "public");
app.use(express.static(publicPath));

// Database connection and server startup
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/quiz")
  .then(() => {
    console.log("✓ Connected to MongoDB successfully");
    
    // Start server after MongoDB connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Frontend available at http://localhost:${PORT}`);
      console.log(`✓ Admin panel available at http://localhost:${PORT}/admin/login`);
    });
  })
  .catch((err) => {
    console.error("✗ MongoDB connection failed:", err.message);
    process.exit(1);
  });
