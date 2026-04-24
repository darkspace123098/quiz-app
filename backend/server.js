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
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5000",
];

// Resolve __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Default admin username is fixed; only superadmin credentials come from env
const ADMIN_USERNAME = "admin";
const SUPERADMIN_USERNAME = process.env.SUPERADMIN_USERNAME || "superadmin";
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || "superadmin123";

const DEFAULT_CLASSES = ["BCA-I", "BCA-II", "BCA-III"];

async function getValidClasses() {
  const classes = await ClassModel.find({}).lean();
  if (!classes || classes.length === 0) {
    // seed defaults
    await ClassModel.insertMany(DEFAULT_CLASSES.map((name) => ({ name })), { ordered: false });
    return DEFAULT_CLASSES;
  }
  return classes.map((c) => c.name);
}

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
      secure: false // Set to true in production with HTTPS
    }
  })
);

// Define admin HTML pages (before routes)
const adminLoginPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login | Quiz System</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    :root {
      --primary: #6366f1;
      --primary-dark: #4f46e5;
      --bg: #f8fafc;
      --text: #0f172a;
      --text-muted: #64748b;
      --error: #ef4444;
      --radius: 12px;
    }

    * { box-sizing: border-box; }
    
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      margin: 0;
      background: radial-gradient(circle at top left, #e0e7ff, #f8fafc);
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text);
    }

    .login-container {
      width: 100%;
      max-width: 440px;
      padding: 24px;
    }

    .login-card {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      border: 1px solid white;
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02);
    }

    .brand {
      text-align: center;
      margin-bottom: 32px;
    }

    .brand-logo {
      width: 48px;
      height: 48px;
      background: var(--primary);
      color: white;
      border-radius: 12px;
      display: inline-grid;
      place-items: center;
      font-weight: 800;
      font-size: 20px;
      margin-bottom: 16px;
      box-shadow: 0 4px 12px rgba(99,102,241,0.3);
    }

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .subtitle {
      color: var(--text-muted);
      font-size: 14px;
      margin-top: 4px;
    }

    .form-group {
      margin-bottom: 20px;
      position: relative;
    }

    label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--text);
    }

    .input-wrapper {
      position: relative;
    }

    .input-wrapper i {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      color: var(--text-muted);
    }

    input {
      width: 100%;
      padding: 12px 16px 12px 42px;
      border-radius: var(--radius);
      border: 1px solid #e2e8f0;
      background: white;
      font-family: inherit;
      font-size: 15px;
      transition: all 0.2s ease;
    }

    input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(99,102,241,0.1);
    }

    .toggle-password {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--primary);
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
    }

    .toggle-password:hover {
      background: #f1f5f9;
    }

    button[type="submit"] {
      width: 100%;
      padding: 14px;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: var(--radius);
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 12px;
    }

    button[type="submit"]:hover {
      background: var(--primary-dark);
      transform: translateY(-1px);
      box-shadow: 0 10px 15px -3px rgba(99,102,241,0.3);
    }

    .message {
      margin-top: 20px;
      font-size: 14px;
      text-align: center;
      color: var(--error);
      font-weight: 500;
      min-height: 20px;
    }

    .footer-text {
      text-align: center;
      margin-top: 24px;
      font-size: 13px;
      color: var(--text-muted);
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 32px 24px;
        border-radius: 20px;
      }
      .brand-logo {
        width: 40px;
        height: 40px;
        font-size: 18px;
      }
      h2 { font-size: 20px; }
    }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="login-card">
      <div class="brand">
        <div class="brand-logo">QA</div>
        <h2>Admin Portal</h2>
        <p class="subtitle">Enter your credentials to continue</p>
      </div>

      <form id="loginForm">
        <div class="form-group">
          <label for="username">Username</label>
          <div class="input-wrapper">
            <i data-lucide="user" style="pointer-events: none;"></i>
            <input type="text" id="username" placeholder="admin" required />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <i data-lucide="lock" style="pointer-events: none;"></i>
            <input type="password" id="password" placeholder="••••••••" required />
            <button type="button" class="toggle-password" onclick="togglePassword(this)">Show</button>
          </div>
        </div>

        <button type="submit">Sign In</button>
        <div id="loginMessage" class="message"></div>
      </form>
    </div>
    
    <div class="footer-text">
      &copy; 2025 Quiz System. All rights reserved.
    </div>
  </div>

  <script>
    lucide.createIcons();

    function togglePassword(btn) {
      const input = document.getElementById('password');
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'Hide';
      } else {
        input.type = 'password';
        btn.textContent = 'Show';
      }
    }

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const msg = document.getElementById('loginMessage');
      msg.textContent = '';

      try {
        const res = await fetch('/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        
        if (res.ok) {
          window.location.href = '/admin/overview';
        } else {
          const data = await res.json();
          msg.textContent = data.message || 'Invalid credentials';
        }
      } catch (err) {
        msg.textContent = 'Connection error. Please try again.';
      }
    });
  </script>
</body>
</html>`;

// Register quiz routes (before static files)
app.use("/api/quiz", quizRouter);

// Register proctor routes for video and malpractice logging
app.use("/api/proctor", proctorRouter);

// Middleware to check admin authentication
const requireAdmin = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return next();
  }
  // For API requests (JSON), return JSON error
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // For browser requests, redirect to login
  return res.redirect("/admin/login");
};

// Admin routes
app.get("/admin/login", (req, res) => {
  if (req.session && req.session.adminId) {
    return res.redirect("/admin/overview");
  }
  res.send(adminLoginPage);
});

app.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const validClasses = await getValidClasses();
    if (username === SUPERADMIN_USERNAME && password === SUPERADMIN_PASSWORD) {
      req.session.adminId = "superadmin";
      req.session.adminUsername = SUPERADMIN_USERNAME;
      req.session.adminRole = "superadmin";
      req.session.adminClasses = validClasses;
      return res.json({ status: "success" });
    }
    
    const admin = await Admin.findOne({ username });
    if (admin && admin.password === password) {
      req.session.adminId = admin._id.toString();
      req.session.adminUsername = admin.username;
      req.session.adminRole = admin.role || "admin";
      req.session.adminClasses = admin.managedClasses?.length
        ? admin.managedClasses
        : (Array.isArray(admin.classes) ? admin.classes.map(c => c.className) : []);
      return res.json({ status: "success" });
    }
    
    res.status(401).json({ message: "Invalid credentials" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/admin/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ status: "success" });
  });
});

app.get("/admin/role", requireAdmin, (req, res) => {
  res.json({
    username: req.session.adminUsername,
    role: req.session.adminRole || "admin",
    allowedClasses: req.session.adminClasses || []
  });
});

app.get("/admin/data", requireAdmin, async (req, res) => {
  try {
    const allowedClasses = req.session.adminRole === "superadmin"
      ? await getValidClasses()
      : (req.session.adminClasses || []);

    const match = allowedClasses.length ? { className: { $in: allowedClasses } } : {};

    const totalContestants = await Contestant.countDocuments(match);
    const totalQuestions = await Question.countDocuments(match);
    const totalResults = await Result.countDocuments(match);
    const totalClasses = req.session.adminRole === "superadmin"
      ? allowedClasses.length
      : allowedClasses.length;
    
    res.json({
      status: "success",
      data: {
        totalClasses,
        totalContestants,
        totalQuestions,
        totalResults
      }
    });
  } catch (err) {
    console.error("Error fetching admin data:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

app.post("/admin/add", requireAdmin, async (req, res) => {
  try {
    if (req.session.adminRole !== "superadmin") {
      return res.status(403).json({ status: "error", message: "Only superadmin can add admins" });
    }
    
    const { username, password, classes } = req.body;
    
    if (!username || !password || !classes || !Array.isArray(classes)) {
      return res.status(400).json({ status: "error", message: "Invalid input" });
    }
    
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ status: "error", message: "Username already exists" });
    }
    
    // Build classes structure matching schema
    const classDocs = classes.map((cls) => ({
      className: cls,
      contestants: [],
      questions: [],
      results: []
    }));
    
    await Admin.create({
      username,
      password,
      role: "admin",
      managedClasses: classes,
      classes: classDocs
    });
    
    res.json({ status: "success", message: "Admin added successfully" });
  } catch (err) {
    console.error("Error adding admin:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Helper function to generate admin page HTML with navigation
function generateAdminPage(content, activeTab = 'overview') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard | Quiz System</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    :root {
      --primary: #6366f1;
      --primary-dark: #4f46e5;
      --primary-light: #818cf8;
      --sidebar-bg: #0f172a;
      --sidebar-text: #94a3b8;
      --sidebar-active: #ffffff;
      --sidebar-hover: #1e293b;
      --bg: #f8fafc;
      --card: #ffffff;
      --border: #e2e8f0;
      --text: #1e293b;
      --text-muted: #64748b;
      --success: #10b981;
      --error: #ef4444;
      --radius: 12px;
      --radius-lg: 16px;
      --shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
      --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
      --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
    }

    * { box-sizing: border-box; }
    
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      margin: 0;
      background-color: var(--bg);
      color: var(--text);
      display: flex;
      min-height: 100vh;
    }

    /* ── Sidebar ───────────────────────────────────────────────────────── */
    .sidebar {
      width: 260px;
      background: var(--sidebar-bg);
      color: var(--sidebar-text);
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 100;
      transition: transform 0.3s ease;
    }

    .sidebar-header {
      padding: 32px 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-logo {
      width: 32px;
      height: 32px;
      background: var(--primary);
      border-radius: 8px;
      display: grid;
      place-items: center;
      color: white;
      font-weight: 800;
      font-size: 14px;
    }

    .brand-name {
      color: white;
      font-weight: 700;
      font-size: 18px;
      letter-spacing: -0.5px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 0 12px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: var(--sidebar-text);
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.2s ease;
      margin-bottom: 4px;
    }

    .nav-item i { width: 18px; height: 18px; }

    .nav-item:hover {
      background: var(--sidebar-hover);
      color: white;
    }

    .nav-item.active {
      background: var(--primary);
      color: white;
      box-shadow: 0 4px 12px rgba(99,102,241,0.3);
    }

    .sidebar-footer {
      padding: 24px;
      border-top: 1px solid rgba(255,255,255,0.05);
    }

    .admin-profile {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      border-radius: 8px;
    }

    .avatar {
      width: 36px;
      height: 36px;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
      display: grid;
      place-items: center;
      color: white;
    }

    .admin-info {
      flex: 1;
      overflow: hidden;
    }

    .admin-name {
      color: white;
      font-size: 13px;
      font-weight: 600;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .admin-role {
      font-size: 11px;
      display: block;
      opacity: 0.6;
    }

    /* ── Main Content ──────────────────────────────────────────────────── */
    .main {
      flex: 1;
      margin-left: 260px;
      padding: 40px;
      min-width: 0;
    }

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .page-title {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .top-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    /* ── UI Components ────────────────────────────────────────────────── */
    .card {
      background: white;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
      padding: 24px;
      margin-bottom: 24px;
    }

    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      padding: 24px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: grid;
      place-items: center;
      background: #f1f5f9;
      color: var(--primary);
    }

    .stat-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 800;
      margin: 0;
      color: var(--text);
    }

    /* ── Forms ─────────────────────────────────────────────────────────── */
    .form-group { margin-bottom: 20px; }
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      font-size: 13px;
      color: var(--text);
    }

    input, select, textarea {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      font-family: inherit;
      font-size: 14px;
      transition: all 0.2s ease;
      background: #fcfcfd;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--primary);
      background: white;
      box-shadow: 0 0 0 4px rgba(99,102,241,0.1);
    }

    button {
      padding: 10px 20px;
      border-radius: var(--radius);
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
    }

    .btn-primary:hover {
      background: var(--primary-dark);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99,102,241,0.3);
    }

    .btn-outline {
      background: white;
      border: 1px solid var(--border);
      color: var(--text);
    }

    .btn-outline:hover {
      background: #f8fafc;
      border-color: var(--text-muted);
    }

    .btn-danger {
      background: #fef2f2;
      color: var(--error);
      border: 1px solid #fee2e2;
    }

    .btn-danger:hover {
      background: var(--error);
      color: white;
    }

    /* ── Tables ────────────────────────────────────────────────────────── */
    .table-container {
      background: white;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      overflow: hidden;
      box-shadow: var(--shadow);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background: #f8fafc;
      padding: 14px 20px;
      text-align: left;
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--border);
    }

    td {
      padding: 14px 20px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
      color: var(--text);
    }

    tr:last-child td { border-bottom: none; }
    
    tr:hover td { background: #fcfcfd; }

    /* ── Alerts ────────────────────────────────────────────────────────── */
    .message {
      padding: 12px 16px;
      border-radius: var(--radius);
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 20px;
    }

    .message.success { background: #ecfdf5; color: #065f46; border: 1px solid #d1fae5; }
    .message.error   { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }

    /* ── Mobile ────────────────────────────────────────────────────────── */
    @media (max-width: 1024px) {
      .sidebar { transform: translateX(-100%); }
      .main { margin-left: 0; padding: 24px; }
      body.sidebar-open .sidebar { transform: translateX(0); }
    }
  </style>
</head>
<body>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="brand-logo">QA</div>
      <span class="brand-name">QuizAdmin</span>
    </div>
    
    <nav class="sidebar-nav">
      <a href="/admin/overview" class="nav-item ${activeTab === 'overview' ? 'active' : ''}">
        <i data-lucide="layout-grid"></i> Overview
      </a>
      <a href="/admin/contestants" class="nav-item ${activeTab === 'contestants' ? 'active' : ''}">
        <i data-lucide="users"></i> Contestants
      </a>
      <a href="/admin/questions" class="nav-item ${activeTab === 'questions' ? 'active' : ''}">
        <i data-lucide="help-circle"></i> Questions
      </a>
      <a href="/admin/results" class="nav-item ${activeTab === 'results' ? 'active' : ''}">
        <i data-lucide="bar-chart-3"></i> Results
      </a>
      <a href="/admin/recordings" class="nav-item ${activeTab === 'recordings' ? 'active' : ''}">
        <i data-lucide="video"></i> Proctor Logs
      </a>
      <a href="/admin/classes" class="nav-item superadmin-only ${activeTab === 'classes' ? 'active' : ''}" style="display: none;">
        <i data-lucide="book-open"></i> Manage Classes
      </a>
    </nav>

    <div class="sidebar-footer">
      <div class="admin-profile">
        <div class="avatar"><i data-lucide="user"></i></div>
        <div class="admin-info">
          <span class="admin-name" id="profileName">Admin</span>
          <span class="admin-role" id="profileRole">Administrator</span>
        </div>
      </div>
      <button onclick="logoutAdmin()" class="btn-danger" style="width: 100%; margin-top: 16px; padding: 8px;">
        <i data-lucide="log-out"></i> Logout
      </button>
    </div>
  </aside>

  <main class="main">
    <header class="top-bar">
      <h2 class="page-title">${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
      <div class="top-actions">
        <a href="/admin/classes" class="btn-outline superadmin-only" id="addClassBtn" style="display: none; text-decoration: none;">
          <i data-lucide="plus-circle"></i> Classes
        </a>
        <a href="/admin/add" class="btn-primary superadmin-only" id="addAdminBtn" style="display: none; text-decoration: none;">
          <i data-lucide="user-plus"></i> New Admin
        </a>
        <button onclick="loadPageData()" class="btn-outline">
          <i data-lucide="refresh-cw"></i> Refresh
        </button>
      </div>
    </header>

    <div id="mainContent">
      ${content}
    </div>
  </main>

  <script>
    lucide.createIcons();
    
    // Check role and update UI
    async function checkAuth() {
      try {
        const res = await fetch('/admin/role', { credentials: 'include' });
        const data = await res.json();
        
        if (data.username) {
          document.getElementById('profileName').textContent = data.username;
          document.getElementById('profileRole').textContent = data.role.toUpperCase();
          window.isSuperadmin = data.role === 'superadmin';
          window.allowedClasses = Array.isArray(data.allowedClasses) ? data.allowedClasses : [];
          
          if (window.isSuperadmin) {
            document.querySelectorAll('.superadmin-only').forEach(el => {
              el.style.display = 'inline-flex';
              if (el.tagName === 'A' && el.classList.contains('nav-item')) el.style.display = 'flex';
            });
          }
        }
      } catch (err) {}
    }

    async function loadClasses() {
      try {
        const res = await fetch('/admin/classes/data', { credentials: 'include' });
        const data = await res.json();
        if (data.status === 'success') {
          const classes = data.classes || [];
          renderClassOptions(classes);
        }
      } catch (err) {}
    }

    function renderClassOptions(classList) {
      const selectIds = ['contestantClass', 'questionClass'];
      selectIds.forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        const currentVal = sel.value;
        sel.innerHTML = '<option value="">Select a class</option>' + 
          classList.map(c => \`\<option value="\${c.className}"\>\${c.className}\</option\>\`).join('');
        sel.value = currentVal;
      });
    }

    // Restrict class dropdowns based on allowed classes
    function applyClassRestrictions() {
      if (window.isSuperadmin) return; // no restriction for superadmin
      const allowed = window.allowedClasses || [];
      ['contestantClass', 'questionClass'].forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        Array.from(select.options).forEach(opt => {
          if (!opt.value) return;
          opt.disabled = allowed.length > 0 && !allowed.includes(opt.value);
        });
        // If current selection is not allowed, reset
        if (select.value && select.selectedOptions.length && select.selectedOptions[0].disabled) {
          select.value = '';
        }
      });
    }

    // Attach event listeners
    function attachEventListeners() {
      ${getEventListenersScript(activeTab)}
    }

    // Logout handler
    async function logoutAdmin() {
      if (!confirm('Are you sure you want to logout?')) return;
      try {
        const res = await fetch('/admin/logout', { method: 'POST' });
        if (res.ok) {
          window.location.href = '/admin/login';
        }
      } catch (err) {
        console.error('Logout failed:', err);
      }
    }

    // Initialization
    window.addEventListener('DOMContentLoaded', async () => {
      await checkAuth();
      await loadClasses();
      // Only call loadPageData if it exists (defined in injected content)
      if (typeof loadPageData === 'function') {
        await loadPageData();
      }
      attachEventListeners();
      applyClassRestrictions();
      lucide.createIcons();
    });
  </script>
</body>
</html>`;
}

function getEventListenersScript(activeTab) {
  let script = '';
  if (activeTab === 'contestants') {
    script += `
      const contestantForm = document.getElementById('contestantForm');
      if (contestantForm) {
        contestantForm.addEventListener('submit', addContestantHandler);
      }
      const updateCredsForm = document.getElementById('updateContestantCredentialsForm');
      if (updateCredsForm) {
        updateCredsForm.addEventListener('submit', updateContestantCredentialsHandler);
      }
    `;
  }
  if (activeTab === 'questions') {
    script += `
      const questionForm = document.getElementById('questionForm');
      if (questionForm) {
        questionForm.addEventListener('submit', addQuestionHandler);
        
        // Update correct answer labels when options change
        ['option1', 'option2', 'option3', 'option4'].forEach(id => {
          const input = document.getElementById(id);
          if (input) {
            input.addEventListener('input', updateCorrectAnswerLabels);
          }
        });
      }
    `;
  }
  return script;
}

// Overview page content
const overviewContent = `
  <div class="stat-grid">
    <div class="stat-card">
      <div class="stat-icon"><i data-lucide="book-open"></i></div>
      <div class="stat-label">Total Classes</div>
      <p class="stat-value" id="totalClasses">0</p>
    </div>
    <div class="stat-card">
      <div class="stat-icon"><i data-lucide="users"></i></div>
      <div class="stat-label">Total Contestants</div>
      <p class="stat-value" id="totalContestants">0</p>
    </div>
    <div class="stat-card">
      <div class="stat-icon"><i data-lucide="help-circle"></i></div>
      <div class="stat-label">Total Questions</div>
      <p class="stat-value" id="totalQuestions">0</p>
    </div>
    <div class="stat-card">
      <div class="stat-icon"><i data-lucide="bar-chart-3"></i></div>
      <div class="stat-label">Total Results</div>
      <p class="stat-value" id="totalResults">0</p>
    </div>
  </div>

  <div class="card">
    <h3 style="margin-top:0"><i data-lucide="info" style="vertical-align:text-bottom; margin-right:8px"></i> Quick Guide</h3>
    <p style="color:var(--text-muted); font-size:14px; line-height:1.6">
      Welcome to the Quiz Admin Dashboard. Use the sidebar to manage your quiz ecosystem. 
      You can track student participation, manage question banks, and monitor live proctoring recordings for malpractice.
    </p>
  </div>

  <script>
    async function loadPageData() {
      try {
        const res = await fetch('/admin/data');
        const data = await res.json();
        if (data.status === 'success') {
          document.getElementById('totalClasses').textContent = data.data.totalClasses || 0;
          document.getElementById('totalContestants').textContent = data.data.totalContestants || 0;
          document.getElementById('totalQuestions').textContent = data.data.totalQuestions || 0;
          document.getElementById('totalResults').textContent = data.data.totalResults || 0;
        }
      } catch (err) {}
      lucide.createIcons();
    }
  </script>
`;
const contestantsContent = `
  <div class="card">
    <h3 style="margin-top:0"><i data-lucide="user-plus" style="vertical-align:text-bottom; margin-right:8px"></i> Add Contestant</h3>
    <div id="contestantMessage" class="message"></div>
    <form id="contestantForm">
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px;">
        <div class="form-group">
          <label for="contestantName">Full Name</label>
          <input type="text" id="contestantName" placeholder="Enter name" required />
        </div>
        <div class="form-group">
          <label for="contestantUSN">USN</label>
          <input type="text" id="contestantUSN" placeholder="Enter USN" required />
        </div>
        <div class="form-group">
          <label for="contestantClass">Class</label>
          <select id="contestantClass" required>
            <option value="">Select a class</option>
          </select>
        </div>
        <div class="form-group">
          <label for="contestantQuizCode">Quiz Code</label>
          <input type="text" id="contestantQuizCode" placeholder="Enter quiz code" required />
        </div>
        <div class="form-group">
          <label for="contestantPassword">Password</label>
          <input type="text" id="contestantPassword" placeholder="Set password" required />
        </div>
      </div>
      <button type="submit" class="btn-primary" style="width:100%; margin-top:12px"><i data-lucide="save"></i> Add Contestant</button>
    </form>
  </div>

  <div class="card">
    <h3 style="margin-top:0"><i data-lucide="users" style="vertical-align:text-bottom; margin-right:8px"></i> Manage Contestants</h3>
    <div class="table-container">
      <div id="contestantList"></div>
    </div>
  </div>

  <div id="contestantEditModal" style="display:none; position:fixed; inset:0; background:rgba(15,23,42,0.7); z-index:9999; align-items:center; justify-content:center; padding:24px; backdrop-filter:blur(4px);">
    <div class="card" style="width:100%; max-width:520px; margin:0;">
      <h3 style="margin-top:0">Edit Contestant</h3>
      <form id="contestantEditForm">
        <div class="form-group">
          <label for="editContestantName">Name</label>
          <input type="text" id="editContestantName" required />
        </div>
        <div class="form-group">
          <label for="editContestantUSN">USN</label>
          <input type="text" id="editContestantUSN" required />
        </div>
        <div class="form-group">
          <label for="editContestantQuizCode">Quiz Code</label>
          <input type="text" id="editContestantQuizCode" required />
        </div>
        <div class="form-group">
          <label for="editContestantPassword">Password</label>
          <input type="text" id="editContestantPassword" required />
        </div>
        <div style="display:flex; gap:12px; margin-top:24px;">
          <button type="submit" class="btn-primary" style="flex:1"><i data-lucide="check"></i> Save Changes</button>
          <button type="button" class="btn-outline" onclick="closeContestantEditModal()">Cancel</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    async function loadPageData() {
      await loadContestants();
      const form = document.getElementById('contestantForm');
      if (form) form.addEventListener('submit', addContestantHandler);
      const editForm = document.getElementById('contestantEditForm');
      if (editForm) editForm.addEventListener('submit', submitContestantEdit);
      lucide.createIcons();
    }

    async function loadContestants() {
      const list = document.getElementById('contestantList');
      list.innerHTML = '<p style="padding:20px; text-align:center">Loading contestants...</p>';
      try {
        const res = await fetch('/api/quiz/contestant', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') {
          list.innerHTML = '<p style="padding:20px; text-align:center">Failed to load contestants.</p>';
          return;
        }
        if (!data.contestants || data.contestants.length === 0) {
          list.innerHTML = '<p style="padding:20px; text-align:center">No contestants found.</p>';
          return;
        }

        list.innerHTML = \`
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>USN</th>
                <th>Class</th>
                <th>Quiz Code</th>
                <th>Password</th>
                <th style="text-align:right">Actions</th>
              </tr>
            </thead>
            <tbody>
              \${data.contestants.map(c => \`
                <tr>
                  <td style="font-weight:600">\${c.name || '-'}</td>
                  <td><code>\${c.usn || '-'}</code></td>
                  <td>\${c.className || '-'}</td>
                  <td>\${c.quizCode || '-'}</td>
                  <td>\${c.quizPassword || '-'}</td>
                  <td style="text-align:right">
                    <button class="btn-outline" style="padding:6px 10px" onclick="openContestantEditModal('\${c._id}', '\${(c.name || '').replace(/'/g, "\\\\'")}', '\${(c.usn || '').replace(/'/g, "\\\\'")}', '\${(c.quizCode || '').replace(/'/g, "\\\\'")}', '\${(c.quizPassword || '').replace(/'/g, "\\\\'")}')"><i data-lucide="edit-2" style="width:14px;height:14px"></i></button>
                    <button class="btn-danger" style="padding:6px 10px" onclick="deleteContestant('\${c._id}')"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>
                  </td>
                </tr>\`).join('')}
            </tbody>
          </table>\`;
        lucide.createIcons();
      } catch (err) {
        list.innerHTML = '<p style="padding:20px; text-align:center">Server error while loading contestants.</p>';
      }
    }

    async function addContestantHandler(e) {
      e.preventDefault();
      const name = document.getElementById('contestantName').value.trim();
      const usn = document.getElementById('contestantUSN').value.trim().toUpperCase();
      const quizCode = document.getElementById('contestantQuizCode').value.trim();
      const quizPassword = document.getElementById('contestantPassword').value.trim();
      const className = document.getElementById('contestantClass').value.trim();
      const msg = document.getElementById('contestantMessage');
      msg.textContent = '';

      try {
        const res = await fetch('/api/quiz/contestant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ students: [{ name, usn, className, quizCode, quizPassword }] })
        });
        const data = await res.json();
        if (data.status === 'success') {
          msg.className = 'message success';
          msg.textContent = 'Contestant added successfully!';
          document.getElementById('contestantPassword').value = '';
          document.getElementById('contestantClass').value = '';
          await loadContestants();
        } else {
          msg.className = 'message error';
          msg.textContent = data.message || 'Failed to add contestant';
        }
      } catch (err) {
        msg.className = 'message error';
        msg.textContent = 'Network error: ' + err.message;
        console.error('Request error:', err);
      }
    }

    let editingContestantId = null;

    function openContestantEditModal(id, name, usn, quizCode, quizPassword) {
      editingContestantId = id;
      document.getElementById('editContestantName').value = name || '';
      document.getElementById('editContestantUSN').value = usn || '';
      document.getElementById('editContestantQuizCode').value = quizCode || '';
      document.getElementById('editContestantPassword').value = quizPassword || '';
      document.getElementById('contestantEditModal').style.display = 'flex';
    }

    function closeContestantEditModal() {
      editingContestantId = null;
      document.getElementById('contestantEditModal').style.display = 'none';
    }

    async function submitContestantEdit(e) {
      e.preventDefault();
      if (!editingContestantId) return;
      const updatedName = document.getElementById('editContestantName').value.trim();
      const updatedUsn = document.getElementById('editContestantUSN').value.trim().toUpperCase();
      const updatedQuizCode = document.getElementById('editContestantQuizCode').value.trim();
      const updatedPassword = document.getElementById('editContestantPassword').value;
      try {
        const res = await fetch('/api/quiz/contestant/' + editingContestantId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: updatedName.trim(),
            usn: updatedUsn.trim().toUpperCase(),
            quizCode: updatedQuizCode.trim(),
            quizPassword: updatedPassword
          })
        });
        const data = await res.json();
        const msg = document.getElementById('contestantMessage');
        if (res.ok && data.status === 'success') {
          msg.className = 'message success';
          msg.textContent = 'Contestant updated successfully';
          closeContestantEditModal();
          await loadContestants();
        } else {
          msg.className = 'message error';
          msg.textContent = data.message || 'Failed to update contestant';
        }
      } catch (err) {
        const msg = document.getElementById('contestantMessage');
        msg.className = 'message error';
        msg.textContent = 'Server error while updating contestant';
      }
    }

    document.getElementById('contestantEditForm').addEventListener('submit', submitContestantEdit);

    async function deleteContestant(id) {
      if (!confirm('Delete this contestant?')) return;
      try {
        const res = await fetch('/api/quiz/contestant/' + id, {
          method: 'DELETE',
          credentials: 'include'
        });
        const data = await res.json();
        const msg = document.getElementById('contestantMessage');
        if (res.ok && data.status === 'success') {
          msg.className = 'message success';
          msg.textContent = 'Contestant deleted successfully';
          await loadContestants();
        } else {
          msg.className = 'message error';
          msg.textContent = data.message || 'Failed to delete contestant';
        }
      } catch (err) {
        const msg = document.getElementById('contestantMessage');
        msg.className = 'message error';
        msg.textContent = 'Server error while deleting contestant';
      }
    }
  </script>
`;

// Questions page content
const questionsContent = `
  <div class="card">
    <h3 style="margin-top:0"><i data-lucide="help-circle" style="vertical-align:text-bottom; margin-right:8px"></i> Create Question</h3>
    <form id="questionForm">
      <div class="form-group">
        <label for="questionText">Question Text</label>
        <textarea id="questionText" rows="3" required placeholder="Enter your question here..."></textarea>
      </div>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div class="form-group">
          <label for="questionQuizCode">Quiz Code</label>
          <input type="text" id="questionQuizCode" required placeholder="AI-ML-2025" />
        </div>
        <div class="form-group">
          <label for="questionClass">Class</label>
          <select id="questionClass" required>
            <option value="">Select a class</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Options</label>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <input type="text" id="option1" placeholder="Option 1" required />
          <input type="text" id="option2" placeholder="Option 2" required />
          <input type="text" id="option3" placeholder="Option 3" required />
          <input type="text" id="option4" placeholder="Option 4" required />
        </div>
      </div>
      <div class="form-group">
        <label for="correctAnswer">Correct Answer</label>
        <select id="correctAnswer" required>
          <option value="">Select correct answer</option>
          <option value="option1" id="correctOption1">Option 1</option>
          <option value="option2" id="correctOption2">Option 2</option>
          <option value="option3" id="correctOption3">Option 3</option>
          <option value="option4" id="correctOption4">Option 4</option>
        </select>
      </div>
      <button type="submit" class="btn-primary" style="width:100%"><i data-lucide="plus"></i> Add Question</button>
      <div id="questionMessage" class="message" style="margin-top:16px"></div>
    </form>
  </div>

  <div class="card">
    <h3 style="margin-top:0"><i data-lucide="list" style="vertical-align:text-bottom; margin-right:8px"></i> Question Bank</h3>
    <div class="table-container">
      <div id="questionList"></div>
    </div>
  </div>

  <div id="questionEditModal" style="display:none; position:fixed; inset:0; background:rgba(15,23,42,0.7); z-index:9999; align-items:center; justify-content:center; padding:24px; backdrop-filter:blur(4px);">
    <div class="card" style="width:100%; max-width:640px; margin:0;">
      <h3 style="margin-top:0">Edit Question</h3>
      <form id="questionEditForm">
        <div class="form-group">
          <label for="editQuestionText">Question Text</label>
          <textarea id="editQuestionText" rows="3" required></textarea>
        </div>
        <div class="form-group">
          <label for="editQuestionQuizCode">Quiz Code</label>
          <input type="text" id="editQuestionQuizCode" required />
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label for="editOption1">Option 1</label>
            <input type="text" id="editOption1" required />
          </div>
          <div class="form-group">
            <label for="editOption2">Option 2</label>
            <input type="text" id="editOption2" required />
          </div>
          <div class="form-group">
            <label for="editOption3">Option 3</label>
            <input type="text" id="editOption3" required />
          </div>
          <div class="form-group">
            <label for="editOption4">Option 4</label>
            <input type="text" id="editOption4" required />
          </div>
        </div>
        <div class="form-group">
          <label for="editQuestionCorrectAnswer">Correct Answer</label>
          <select id="editQuestionCorrectAnswer" required>
            <option value="">Select correct answer</option>
            <option value="option1" id="editCorrectOption1">Option 1</option>
            <option value="option2" id="editCorrectOption2">Option 2</option>
            <option value="option3" id="editCorrectOption3">Option 3</option>
            <option value="option4" id="editCorrectOption4">Option 4</option>
          </select>
        </div>
        <div style="display:flex; gap:12px; margin-top:24px;">
          <button type="submit" class="btn-primary" style="flex:1"><i data-lucide="check"></i> Save Changes</button>
          <button type="button" class="btn-outline" onclick="closeQuestionEditModal()">Cancel</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    async function loadPageData() {
      await loadQuestions();
      lucide.createIcons();
    }

    async function loadQuestions() {
      const list = document.getElementById('questionList');
      list.innerHTML = '<p>Loading questions...</p>';
      try {
        const res = await fetch('/api/quiz/question', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') {
          list.innerHTML = '<p>Failed to load questions.</p>';
          return;
        }
        if (!data.questions || data.questions.length === 0) {
          list.innerHTML = '<p>No questions found.</p>';
          return;
        }
        list.innerHTML = \`
          <table>
            <thead>
              <tr>
                <th>Question</th>
                <th>Class</th>
                <th>Quiz Code</th>
                <th>Correct Answer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              \${data.questions.map(q => \`
                <tr>
                  <td>\${q.questionText || '-'}</td>
                  <td>\${q.className || '-'}</td>
                  <td>\${q.quizCode || '-'}</td>
                  <td>\${q.correctAnswer || '-'}</td>
                  <td style="display:flex; gap:8px;">
                    <button type="button" onclick="openQuestionEditModal('\${q._id}', '\${(q.questionText || '').replace(/'/g, "\\\\'")}', '\${(q.quizCode || '').replace(/'/g, "\\\\'")}', \${JSON.stringify(q.options || []).replace(/"/g, '&quot;')}, '\${(q.correctAnswer || '').replace(/'/g, "\\\\'")}')">Edit</button>
                    <button type="button" class="logout-btn" onclick="deleteQuestion('\${q._id}')">Delete</button>
                  </td>
                </tr>\`).join('')}
            </tbody>
          </table>\`;
      } catch (err) {
        list.innerHTML = '<p>Server error while loading questions.</p>';
      }
    }

    function updateCorrectAnswerLabels() {
      const option1 = document.getElementById('option1')?.value.trim() || 'Option 1';
      const option2 = document.getElementById('option2')?.value.trim() || 'Option 2';
      const option3 = document.getElementById('option3')?.value.trim() || 'Option 3';
      const option4 = document.getElementById('option4')?.value.trim() || 'Option 4';
      
      const opt1 = document.getElementById('correctOption1');
      const opt2 = document.getElementById('correctOption2');
      const opt3 = document.getElementById('correctOption3');
      const opt4 = document.getElementById('correctOption4');
      
      if (opt1) opt1.textContent = option1 || 'Option 1';
      if (opt2) opt2.textContent = option2 || 'Option 2';
      if (opt3) opt3.textContent = option3 || 'Option 3';
      if (opt4) opt4.textContent = option4 || 'Option 4';
    }

    function updateEditCorrectAnswerLabels() {
      const option1 = document.getElementById('editOption1')?.value.trim() || 'Option 1';
      const option2 = document.getElementById('editOption2')?.value.trim() || 'Option 2';
      const option3 = document.getElementById('editOption3')?.value.trim() || 'Option 3';
      const option4 = document.getElementById('editOption4')?.value.trim() || 'Option 4';
      
      const opt1 = document.getElementById('editCorrectOption1');
      const opt2 = document.getElementById('editCorrectOption2');
      const opt3 = document.getElementById('editCorrectOption3');
      const opt4 = document.getElementById('editCorrectOption4');
      
      if (opt1) opt1.textContent = option1 || 'Option 1';
      if (opt2) opt2.textContent = option2 || 'Option 2';
      if (opt3) opt3.textContent = option3 || 'Option 3';
      if (opt4) opt4.textContent = option4 || 'Option 4';
    }

    async function addQuestionHandler(e) {
      e.preventDefault();
      const questionText = document.getElementById('questionText').value.trim();
      const className = document.getElementById('questionClass').value.trim();
      const quizCode = document.getElementById('questionQuizCode').value.trim();
      const option1 = document.getElementById('option1').value.trim();
      const option2 = document.getElementById('option2').value.trim();
      const option3 = document.getElementById('option3').value.trim();
      const option4 = document.getElementById('option4').value.trim();
      const correctAnswerIndex = document.getElementById('correctAnswer').value;
      const msg = document.getElementById('questionMessage');
      msg.textContent = '';

      if (!questionText || !className || !quizCode || !option1 || !option2 || !option3 || !option4 || !correctAnswerIndex) {
        msg.className = 'message error';
        msg.textContent = 'Please fill all fields';
        return;
      }

      const options = [option1, option2, option3, option4];
      const optionIndex = parseInt(correctAnswerIndex.replace('option', '')) - 1;
      
      if (isNaN(optionIndex) || optionIndex < 0 || optionIndex >= options.length) {
        msg.className = 'message error';
        msg.textContent = 'Invalid correct answer selection';
        return;
      }
      
      const correctAnswer = options[optionIndex];

      try {
        const res = await fetch('/api/quiz/question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            className,
            quizCode,
            questionText,
            options,
            correctAnswer
          })
        });
        
        let data;
        try {
          data = await res.json();
        } catch (parseErr) {
          msg.className = 'message error';
          msg.textContent = 'Server returned invalid response. Status: ' + res.status;
          console.error('Response parse error:', parseErr);
          return;
        }
        
        if (res.ok && data.status === 'success') {
          msg.className = 'message success';
          msg.textContent = 'Question added successfully!';
          document.getElementById('questionText').value = '';
          document.getElementById('questionClass').value = '';
          document.getElementById('questionQuizCode').value = '';
          document.getElementById('option1').value = '';
          document.getElementById('option2').value = '';
          document.getElementById('option3').value = '';
          document.getElementById('option4').value = '';
          document.getElementById('correctAnswer').value = '';
          await loadQuestions();
        } else {
          msg.className = 'message error';
          msg.textContent = data.message || data.error || 'Failed to add question. Status: ' + res.status;
          console.error('Error response:', data);
        }
      } catch (err) {
        msg.className = 'message error';
        msg.textContent = 'Network error: ' + err.message;
        console.error('Request error:', err);
      }
    }

    let editingQuestionId = null;

    function openQuestionEditModal(id, questionText, quizCode, options, correctAnswer) {
      editingQuestionId = id;
      const parsedOptions = Array.isArray(options) ? options : ['', '', '', ''];
      document.getElementById('editQuestionText').value = questionText || '';
      document.getElementById('editQuestionQuizCode').value = quizCode || '';
      document.getElementById('editOption1').value = parsedOptions[0] || '';
      document.getElementById('editOption2').value = parsedOptions[1] || '';
      document.getElementById('editOption3').value = parsedOptions[2] || '';
      document.getElementById('editOption4').value = parsedOptions[3] || '';
      
      updateEditCorrectAnswerLabels();

      // Find which option matches the correctAnswer and set the dropdown
      const select = document.getElementById('editQuestionCorrectAnswer');
      select.value = ""; 
      for (let i = 0; i < parsedOptions.length; i++) {
        if (parsedOptions[i] === correctAnswer) {
          select.value = "option" + (i + 1);
          break;
        }
      }

      document.getElementById('questionEditModal').style.display = 'flex';
    }

    function closeQuestionEditModal() {
      editingQuestionId = null;
      document.getElementById('questionEditModal').style.display = 'none';
    }

    async function submitQuestionEdit(e) {
      e.preventDefault();
      if (!editingQuestionId) return;
      const updatedQuestion = document.getElementById('editQuestionText').value.trim();
      const updatedQuizCode = document.getElementById('editQuestionQuizCode').value.trim();
      const o1 = document.getElementById('editOption1').value.trim();
      const o2 = document.getElementById('editOption2').value.trim();
      const o3 = document.getElementById('editOption3').value.trim();
      const o4 = document.getElementById('editOption4').value.trim();
      const correctAnswerIndex = document.getElementById('editQuestionCorrectAnswer').value;
      
      if (!correctAnswerIndex) {
        alert('Please select a correct answer');
        return;
      }
      
      const options = [o1, o2, o3, o4];
      const optionIndex = parseInt(correctAnswerIndex.replace('option', '')) - 1;
      const updatedCorrect = options[optionIndex];

      try {
        const res = await fetch('/api/quiz/question/' + editingQuestionId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            questionText: updatedQuestion.trim(),
            quizCode: updatedQuizCode.trim(),
            options: [o1.trim(), o2.trim(), o3.trim(), o4.trim()],
            correctAnswer: updatedCorrect.trim()
          })
        });
        const data = await res.json();
        const msg = document.getElementById('questionMessage');
        if (res.ok && data.status === 'success') {
          msg.className = 'message success';
          msg.textContent = 'Question updated successfully';
          closeQuestionEditModal();
          await loadQuestions();
        } else {
          msg.className = 'message error';
          msg.textContent = data.message || 'Failed to update question';
        }
      } catch (err) {
        const msg = document.getElementById('questionMessage');
        msg.className = 'message error';
        msg.textContent = 'Server error while updating question';
      }
    }

    document.getElementById('questionEditForm').addEventListener('submit', submitQuestionEdit);
    document.getElementById('editOption1').addEventListener('input', updateEditCorrectAnswerLabels);
    document.getElementById('editOption2').addEventListener('input', updateEditCorrectAnswerLabels);
    document.getElementById('editOption3').addEventListener('input', updateEditCorrectAnswerLabels);
    document.getElementById('editOption4').addEventListener('input', updateEditCorrectAnswerLabels);

    async function deleteQuestion(id) {
      if (!confirm('Delete this question?')) return;
      try {
        const res = await fetch('/api/quiz/question/' + id, {
          method: 'DELETE',
          credentials: 'include'
        });
        const data = await res.json();
        const msg = document.getElementById('questionMessage');
        if (res.ok && data.status === 'success') {
          msg.className = 'message success';
          msg.textContent = 'Question deleted successfully';
          await loadQuestions();
        } else {
          msg.className = 'message error';
          msg.textContent = data.message || 'Failed to delete question';
        }
      } catch (err) {
        const msg = document.getElementById('questionMessage');
        msg.className = 'message error';
        msg.textContent = 'Server error while deleting question';
      }
    }
  </script>
`;

// Results page content
const resultsContent = `
  <div class="card">
    <div id="resultsMessage" class="message"></div>
    <div class="table-container">
      <table id="resultsTable">
        <thead>
          <tr>
            <th>Name</th>
            <th>USN</th>
            <th>Class</th>
            <th>Score</th>
            <th>Submitted At</th>
            <th style="text-align:right">Actions</th>
          </tr>
        </thead>
        <tbody id="resultsBody">
          <tr><td colspan="6" style="padding: 24px; text-align:center; color:var(--text-muted)">Loading results...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <script>
    async function loadPageData() {
      const msg = document.getElementById('resultsMessage');
      const body = document.getElementById('resultsBody');
      msg.textContent = '';
      
      try {
        const res = await fetch('/admin/results/data', { credentials: 'include' });
        const data = await res.json();

        if (!res.ok || data.status !== 'success') {
          msg.className = 'message error';
          msg.textContent = data.message || 'Failed to load results';
          body.innerHTML = '<tr><td colspan="6" style="padding: 24px; text-align:center">No data available</td></tr>';
          return;
        }

        if (!data.results || data.results.length === 0) {
          body.innerHTML = '<tr><td colspan="6" style="padding: 24px; text-align:center; color:var(--text-muted)">No results found</td></tr>';
          return;
        }

        body.innerHTML = data.results.map(r => {
          const date = new Date(r.submittedAt || r.createdAt || r._id).toLocaleString();
          return \`<tr data-id="\${r._id}">
            <td style="font-weight:600">\${r.name || '-'}</td>
            <td><code>\${r.usn || '-'}</code></td>
            <td>\${r.className || '-'}</td>
            <td><span style="font-weight:800; color:var(--primary)">\${r.score ?? '-'}</span></td>
            <td style="color:var(--text-muted); font-size:13px">\${date}</td>
            <td style="text-align:right">
              <button class="btn-danger delete-result-btn" data-id="\${r._id}" style="padding:6px 10px; font-size:12px">
                <i data-lucide="trash-2"></i> Delete
              </button>
            </td>
          </tr>\`;
        }).join('');

        lucide.createIcons();
        attachDeleteListeners();
      } catch (err) {
        body.innerHTML = '<tr><td colspan="6" style="padding: 24px; text-align:center; color:var(--error)">Error loading results</td></tr>';
      }
    }

    function attachDeleteListeners() {
      document.querySelectorAll('.delete-result-btn').forEach(btn => {
        btn.onclick = async (e) => {
          const id = btn.getAttribute('data-id');
          if (!confirm('Delete this result?')) return;
          await deleteResult(id);
        };
      });
    }

    async function deleteResult(id) {
      const msg = document.getElementById('resultsMessage');
      try {
        const res = await fetch('/admin/results/' + id, { 
          method: 'DELETE', 
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok && data.status === 'success') {
          msg.className = 'message success';
          msg.textContent = 'Result deleted successfully';
          await loadPageData();
        } else {
          msg.className = 'message error';
          msg.textContent = data.message || 'Failed to delete result';
        }
      } catch (err) {
        msg.className = 'message error';
        msg.textContent = 'Server error while deleting result';
      }
    }
  </script>
`;

// ── Recordings page ──────────────────────────────────────────────────────────
const recordingsContent = `
  <div class="card" style="margin-bottom:16px">
    <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
      <div style="flex:1; min-width:300px; position:relative">
        <i data-lucide="search" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); width:16px; color:var(--text-muted)"></i>
        <input id="recFilter" type="text" placeholder="Search by USN, Name or Quiz Code..." style="padding-left:36px" />
      </div>
      <button onclick="loadPageData()" class="btn-outline"><i data-lucide="refresh-cw"></i> Refresh</button>
    </div>
  </div>

  <div class="card">
    <div id="recMessage" class="message"></div>
    <div class="table-container">
      <table id="recTable">
        <thead>
          <tr>
            <th>Student</th>
            <th>USN</th>
            <th>Quiz</th>
            <th>Recorded At</th>
            <th>Size</th>
            <th>Score</th>
            <th>Status</th>
            <th style="text-align:right">Actions</th>
          </tr>
        </thead>
        <tbody id="recBody">
          <tr><td colspan="8" style="padding:32px; text-align:center">Loading proctor logs...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div id="playerModal" style="position:fixed; inset:0; background:rgba(15,23,42,0.9); z-index:9999; display:none; flex-direction:column; align-items:center; justify-content:center; padding:24px; backdrop-filter:blur(8px);">
    <div style="background:#1e293b; border-radius:var(--radius-lg); padding:24px; max-width:960px; width:100%; position:relative; box-shadow:var(--shadow-lg);">
      <button onclick="closePlayer()" style="position:absolute; top:-16px; right:-16px; background:var(--error); color:white; border:none; border-radius:50%; width:40px; height:40px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-md)">
        <i data-lucide="x"></i>
      </button>
      <h3 id="playerTitle" style="color:white; margin:0 0 20px; display:flex; align-items:center; gap:10px"></h3>
      <video id="proctorPlayer" controls playsinline style="width:100%; border-radius:var(--radius); background:black; max-height:70vh;"></video>
      <div id="playerMeta" style="margin-top:16px; color:#94a3b8; font-size:14px; display:flex; justify-content:space-between; align-items:center;"></div>
    </div>
  </div>

  <div id="malpModal" style="position:fixed; inset:0; background:rgba(15,23,42,0.8); z-index:10000; display:none; flex-direction:column; align-items:center; justify-content:center; padding:24px; backdrop-filter:blur(4px);">
    <div class="card" style="width:100%; max-width:600px; margin:0; max-height:85vh; overflow-y:auto">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
        <h3 style="margin:0"><i data-lucide="alert-triangle" style="color:var(--error); vertical-align:middle"></i> Malpractice Log</h3>
        <button onclick="closeMalpModal()" class="btn-outline" style="padding:6px; border-radius:50%"><i data-lucide="x"></i></button>
      </div>
      <div id="malpList" style="display:flex; flex-direction:column; gap:12px;"></div>
      <div id="malpEmpty" style="display:none; text-align:center; padding:48px; color:var(--text-muted);">No incidents recorded.</div>
    </div>
  </div>

  <style>
    .malp-badge { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:20px; font-size:12px; font-weight:700; }
    .malp-yes { background:#fef2f2; color:var(--error); border:1px solid #fee2e2; }
    .malp-no  { background:#ecfdf5; color:var(--success); border:1px solid #d1fae5; }
  </style>

  <script>
    let allRecordings = [];

    async function loadPageData() {
      const body = document.getElementById('recBody');
      const msg  = document.getElementById('recMessage');
      msg.textContent = '';
      body.innerHTML  = '<tr><td colspan="8" style="padding:16px;">Loading…</td></tr>';
      try {
        const res  = await fetch('/api/proctor/list', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Failed');
        allRecordings = data.recordings || [];
        renderTable(allRecordings);
      } catch (err) {
        msg.className   = 'message error';
        msg.textContent = 'Error loading recordings: ' + err.message;
        body.innerHTML  = '<tr><td colspan="8" style="padding:16px;">Failed to load</td></tr>';
      }
      lucide.createIcons();
    }

    function renderTable(rows) {
      const body = document.getElementById('recBody');
      if (!rows.length) {
        body.innerHTML = '<tr><td colspan="8" style="padding:16px;color:#64748b;">No recordings found yet. Recordings appear here after students attempt a quiz.</td></tr>';
        return;
      }
      body.innerHTML = rows.map(r => {
        const dt     = new Date(r.recordedAt).toLocaleString();
        const malp   = r.malpracticeDetected
          ? \`<div style="display:flex;flex-direction:column;gap:4px;align-items:flex-start;">
               <span class="malp-badge malp-yes">⚠️ \${r.malpracticeCount} event\${r.malpracticeCount !== 1 ? 's' : ''}</span>
               <button class="rec-action-btn" style="background:#fef2f2;color:#991b1b;border:1px solid #fee2e2;padding:2px 6px;font-size:10px;margin-top:2px;" 
                       onclick="viewMalp('\${r.filename}')">🔍 Details</button>
             </div>\`
          : '<span class="malp-badge malp-no">✓ Clean</span>';
        const score  = r.quizScore !== null ? r.quizScore : '—';
        return \`<tr>
          <td>\${r.contestantName || '—'}</td>
          <td><code>\${r.contestantId}</code></td>
          <td><code>\${r.quizId}</code></td>
          <td style="white-space:nowrap;">\${dt}</td>
          <td>\${r.sizeMB} MB</td>
          <td>\${score}</td>
          <td>\${malp}</td>
          <td style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;">
            <button class="btn-outline" onclick="openPlayer('\${r.filename}', '\${(r.contestantName || '—').replace(/'/g, "\\\\'")}')"><i data-lucide="play" style="width:14px;height:14px"></i></button>
            <a href="/api/proctor/download/\${encodeURIComponent(r.filename)}" download class="btn-outline" style="text-decoration:none;"><i data-lucide="download" style="width:14px;height:14px"></i></a>
            <button class="btn-danger" onclick="deleteRec('\${r.filename}')"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>
          </td>
        </tr>\`;
      }).join('');
      lucide.createIcons();
    }

    // Live filter
    document.getElementById('recFilter').addEventListener('input', function() {
      const q = this.value.toLowerCase();
      const filtered = allRecordings.filter(r =>
        (r.contestantId || '').toLowerCase().includes(q) ||
        (r.contestantName || '').toLowerCase().includes(q) ||
        (r.quizId || '').toLowerCase().includes(q)
      );
      renderTable(filtered);
    });

    function openPlayer(filename, title) {
      const modal = document.getElementById('playerModal');
      const video = document.getElementById('proctorPlayer');
      const tEl   = document.getElementById('playerTitle');
      const meta  = document.getElementById('playerMeta');
      tEl.textContent = title;
      video.src       = '/api/proctor/stream/' + encodeURIComponent(filename);
      meta.innerHTML  = \`File: <code>\${filename}</code>\`;
      modal.style.display = 'flex';
      video.play().catch(() => {});
      lucide.createIcons();
    }

    function closePlayer() {
      const modal = document.getElementById('playerModal');
      const video = document.getElementById('proctorPlayer');
      video.pause();
      video.src = '';
      modal.style.display = 'none';
    }

    function viewMalp(filename) {
      const rec = allRecordings.find(r => r.filename === filename);
      if (!rec) return;
      
      const modal = document.getElementById('malpModal');
      const list  = document.getElementById('malpList');
      const empty = document.getElementById('malpEmpty');
      
      list.innerHTML = '';
      const events = rec.malpracticeEvents || [];
      
      if (events.length === 0) {
        empty.style.display = 'block';
      } else {
        empty.style.display = 'none';
        list.innerHTML = events.map(ev => {
          const time = new Date(ev.timestamp).toLocaleTimeString();
          const isHigh = ev.severity === 'high' || ev.type === 'multiple_faces' || ev.type === 'no_face_detected';
          const color = isHigh ? '#ef4444' : '#f59e0b';
          const bg    = isHigh ? '#fef2f2' : '#fffbeb';
          
          return \`<div style="background:\${bg};border-left:4px solid \${color};padding:12px;border-radius:8px;">
            <div style="display:flex;justify-content:between;align-items:center;margin-bottom:4px;">
              <strong style="color:\${color};font-size:13px;text-transform:uppercase;">\${ev.type.replace(/_/g, ' ')}</strong>
              <span style="margin-left:auto;font-size:11px;color:#64748b;">\${time}</span>
            </div>
            <p style="margin:0;font-size:13px;color:#334155;line-height:1.4;">\${ev.description || 'No description available.'}</p>
          </div>\`;
        }).join('');
      }
      modal.style.display = 'flex';
    }

    function closeMalpModal() {
      document.getElementById('malpModal').style.display = 'none';
    }

    async function deleteRec(filename) {
      if (!confirm('Delete this recording?')) return;
      const msg = document.getElementById('recMessage');
      try {
        const res  = await fetch('/api/proctor/recording/' + encodeURIComponent(filename), {
          method: 'DELETE', credentials: 'include'
        });
        const data = await res.json();
        if (res.ok && data.status === 'success') {
          msg.className   = 'message success';
          msg.textContent = 'Recording deleted';
          await loadPageData();
        } else {
          throw new Error(data.message || 'Delete failed');
        }
      } catch (err) {
        msg.className   = 'message error';
        msg.textContent = 'Error: ' + err.message;
      }
    }
  </script>
`;

// Classes management page (superadmin only)
const classesContent = `
  <div class="card">
    <h3 style="margin-top:0"><i data-lucide="plus-circle" style="vertical-align:text-bottom; margin-right:8px"></i> Add New Class</h3>
    <form id="addClassForm">
      <div class="form-group">
        <label for="newClassName">Class Name</label>
        <input type="text" id="newClassName" placeholder="e.g., BCA-IV" required />
      </div>
      <button type="submit" class="btn-primary" style="width:100%"><i data-lucide="save"></i> Create Class</button>
    </form>
    <div id="classesMessage" class="message" style="margin-top:16px"></div>
  </div>

  <div class="card">
    <h3 style="margin-top:0"><i data-lucide="book-open" style="vertical-align:text-bottom; margin-right:8px"></i> Existing Classes</h3>
    <div class="table-container">
      <table id="classesTable">
        <thead>
          <tr>
            <th>Class Name</th>
            <th style="text-align:right">Actions & Configuration</th>
          </tr>
        </thead>
        <tbody id="classesTableBody">
          <tr><td colspan="2" style="padding:24px; text-align:center">Loading classes...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <script>
    async function loadPageData() {
      await refreshClassesTable();
      const form = document.getElementById('addClassForm');
      if (form) form.addEventListener('submit', addClassHandler);
      lucide.createIcons();
    }

    async function refreshClassesTable() {
      const body = document.getElementById('classesTableBody');
      const msg = document.getElementById('classesMessage');
      msg.textContent = '';
      body.innerHTML = '<tr><td colspan="2" style="padding: 12px;">Loading...</td></tr>';
      try {
        const res = await fetch('/admin/classes/data', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') {
          msg.className = 'message error';
          msg.textContent = data.message || 'Failed to load classes';
          body.innerHTML = '<tr><td colspan="2" style="padding: 12px;">No data</td></tr>';
          return;
        }
        const classes = data.classes || [];
        if (classes.length === 0) {
          body.innerHTML = '<tr><td colspan="2" style="padding: 12px;">No classes</td></tr>';
          return;
        }
        // Fetch quiz times for each class
        const classDataPromises = classes.map(c => fetch(\`/admin/classes/\${encodeURIComponent(c)}/time\`, { credentials: 'include' }).then(r => r.json()).catch(() => ({ quizTime: 300 })));
        const classData = await Promise.all(classDataPromises);
        
        body.innerHTML = classes.map((c, idx) => {
          const quizTime = classData[idx]?.quizTime || 300;
          const minutes = Math.floor(quizTime / 60);
          return \`
          <tr>
            <td style="padding:8px; border-bottom:1px solid #f0f0f0;">
              <strong>\${c}</strong>
            </td>
            <td style="padding:8px; border-bottom:1px solid #f0f0f0;">
              <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                <div style="display:flex; gap:4px; align-items:center;">
                  <label style="margin:0; font-size:13px;">Quiz Time (min):</label>
                  <input type="number" id="quizTime-\${c}" value="\${minutes}" min="1" max="60" style="width:60px; padding:4px; border:1px solid #ddd; border-radius:4px;" />
                  <button data-class="\${c}" class="save-time-btn" style="background:#28a745; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px; pointer-events:auto; position:relative; z-index:1;">Save</button>
                </div>
                <button data-class="\${c}" class="delete-class-btn" style="background:#dc3545; color:white; border:none; padding:6px 10px; border-radius:4px; cursor:pointer; pointer-events:auto; position:relative; z-index:1;">Delete</button>
              </div>
            </td>
          </tr>\`;
        }).join('');
        
        document.querySelectorAll('.save-time-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const button = e.currentTarget || e.target.closest('.save-time-btn');
            if (!button || button.disabled) return;
            const cls = button.getAttribute('data-class');
            const input = document.getElementById(\`quizTime-\${cls}\`);
            if (!cls || !input) return;
            const minutes = parseInt(input.value);
            if (isNaN(minutes) || minutes < 1 || minutes > 60) {
              alert('Please enter a valid time between 1 and 60 minutes');
              return;
            }
            await updateQuizTime(cls, minutes * 60);
          });
        });

        document.querySelectorAll('.delete-class-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const button = e.currentTarget || e.target.closest('.delete-class-btn');
            if (!button || button.disabled) return;
            const cls = button.getAttribute('data-class');
            if (!cls) return;
            if (!confirm('Delete class ' + cls + '? This does not remove existing data but will hide it from admins.')) return;
            await deleteClass(cls);
          });
        });
      } catch (err) {
        msg.className = 'message error';
        msg.textContent = 'Server error loading classes';
        body.innerHTML = '<tr><td colspan="2" style="padding: 12px;">Error</td></tr>';
      }
    }
    
    async function updateQuizTime(className, seconds) {
      const msg = document.getElementById('classesMessage');
      try {
        const res = await fetch(\`/admin/classes/\${encodeURIComponent(className)}/time\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ quizTime: seconds })
        });
        const data = await res.json();
        if (res.ok && data.status === 'success') {
          msg.className = 'message success';
          msg.textContent = \`Quiz time updated for \${className}\`;
          setTimeout(() => refreshClassesTable(), 500);
        } else {
          msg.className = 'message error';
          msg.textContent = data.message || 'Failed to update quiz time';
        }
      } catch (err) {
        msg.className = 'message error';
        msg.textContent = 'Network error updating quiz time';
      }
    }

    async function addClassHandler(e) {
      e.preventDefault();
      const name = document.getElementById('newClassName').value.trim();
      const msg = document.getElementById('classesMessage');
      msg.textContent = '';
      if (!name) {
        msg.className = 'message error';
        msg.textContent = 'Enter class name';
        return;
      }
      try {
        const res = await fetch('/admin/classes/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name })
        });
        const data = await res.json();
        if (res.ok && data.status === 'success') {
          msg.className = 'message success';
          msg.textContent = 'Class added';
          document.getElementById('newClassName').value = '';
          await refreshClassesTable();
        } else {
          msg.className = 'message error';
          msg.textContent = data.message || 'Failed to add class';
        }
      } catch (err) {
        msg.className = 'message error';
        msg.textContent = 'Server error';
      }
    }

    async function deleteClass(name) {
      const msg = document.getElementById('classesMessage');
      msg.textContent = '';
      try {
        const res = await fetch('/admin/classes/data/' + encodeURIComponent(name), {
          method: 'DELETE',
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok && data.status === 'success') {
          msg.className = 'message success';
          msg.textContent = 'Class deleted';
          await refreshClassesTable();
        } else {
          msg.className = 'message error';
          msg.textContent = data.message || 'Failed to delete class';
        }
      } catch (err) {
        msg.className = 'message error';
        msg.textContent = 'Server error';
      }
    }
  </script>
`;

// Add Admin page content
const addAdminContent = `
  <div class="card" style="max-width:600px; margin: 0 auto;">
    <h3 style="margin-top:0"><i data-lucide="user-plus" style="vertical-align:text-bottom; margin-right:8px"></i> Add New Admin</h3>
    <p style="color:var(--text-muted); font-size:14px; margin-bottom:24px">Create a sub-admin and assign them to specific classes.</p>
    
    <form id="addAdminForm">
      <div class="form-group">
        <label for="newAdminUsername">Username</label>
        <input type="text" id="newAdminUsername" placeholder="Enter username" required />
      </div>
      <div class="form-group">
        <label for="newAdminPassword">Password</label>
        <input type="password" id="newAdminPassword" placeholder="Set secure password" required />
      </div>
      <div class="form-group">
        <label>Managed Classes</label>
        <div id="classCheckboxes" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 12px; border:1px solid var(--border); border-radius:var(--radius); background:#fcfcfd; max-height:150px; overflow-y:auto;"></div>
      </div>
      <button type="submit" class="btn-primary" style="width:100%; margin-top:12px"><i data-lucide="user-plus"></i> Create Admin Account</button>
      <div id="addAdminMessage" class="message" style="margin-top:16px"></div>
    </form>
  </div>

  <script>
    async function loadPageData() {
      const addAdminForm = document.getElementById('addAdminForm');
      if (addAdminForm) {
        addAdminForm.addEventListener('submit', addAdminHandler);
      }
      lucide.createIcons();
    }

    async function addAdminHandler(e) {
      e.preventDefault();
      const username = document.getElementById('newAdminUsername').value.trim();
      const password = document.getElementById('newAdminPassword').value;
      const classes = Array.from(document.querySelectorAll('.admin-class-checkbox'))
        .filter(cb => cb.checked)
        .map(cb => cb.value);
      const msg = document.getElementById('addAdminMessage');
      msg.textContent = '';

      if (classes.length === 0) {
        msg.className = 'message error';
        msg.textContent = 'Select at least one class';
        return;
      }

      try {
        const res = await fetch('/admin/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, password, classes })
        });
        
        let data;
        try {
          data = await res.json();
        } catch (parseErr) {
          msg.className = 'message error';
          msg.textContent = 'Server returned invalid response. Status: ' + res.status;
          console.error('Response parse error:', parseErr);
          return;
        }
        
        if (data.status === 'success') {
          msg.className = 'message success';
          msg.textContent = 'Admin added successfully!';
          document.getElementById('newAdminUsername').value = '';
          document.getElementById('newAdminPassword').value = '';
          document.querySelectorAll('.admin-class-checkbox').forEach(cb => cb.checked = false);
        } else {
          msg.className = 'message error';
          msg.textContent = data.message || 'Failed to add admin';
        }
      } catch (err) {
        msg.className = 'message error';
        msg.textContent = 'Network error: ' + err.message;
        console.error('Request error:', err);
      }
    }
  </script>
`;

// Admin routes
app.get("/admin", requireAdmin, (req, res) => {
  res.redirect("/admin/overview");
});

app.get("/admin/overview", requireAdmin, (req, res) => {
  res.send(generateAdminPage(overviewContent, 'overview'));
});

app.get("/admin/contestants", requireAdmin, (req, res) => {
  res.send(generateAdminPage(contestantsContent, 'contestants'));
});

app.get("/admin/questions", requireAdmin, (req, res) => {
  res.send(generateAdminPage(questionsContent, 'questions'));
});

app.get("/admin/results", requireAdmin, (req, res) => {
  res.send(generateAdminPage(resultsContent, 'results'));
});

app.get("/admin/recordings", requireAdmin, (req, res) => {
  res.send(generateAdminPage(recordingsContent, 'recordings'));
});

app.get("/admin/classes", requireAdmin, (req, res) => {
  if (req.session.adminRole !== "superadmin") {
    return res.redirect("/admin/overview");
  }
  res.send(generateAdminPage(classesContent, 'classes'));
});

app.get("/admin/add", requireAdmin, (req, res) => {
  if (req.session.adminRole !== "superadmin") {
    return res.redirect("/admin/overview");
  }
  res.send(generateAdminPage(addAdminContent, 'add'));
});

// Results data for admin table
app.get("/admin/results/data", requireAdmin, async (req, res) => {
  try {
    const filter = {};
    if (req.session.adminRole !== "superadmin") {
      const classes = Array.isArray(req.session.adminClasses) ? req.session.adminClasses : [];
      filter.className = { $in: classes };
    }

    const results = await Result.find(filter)
      .sort({ submittedAt: -1, _id: -1 })
      .limit(200)
      .lean();

    res.json({ status: "success", results });
  } catch (err) {
    console.error("Error fetching results list:", err);
    res.status(500).json({ status: "error", message: "Server error fetching results" });
  }
});

// Delete a result
app.delete("/admin/results/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ status: "error", message: "Invalid result id" });
    }

    const result = await Result.findById(id);
    if (!result) {
      return res.status(404).json({ status: "error", message: "Result not found" });
    }

    if (req.session.adminRole !== "superadmin") {
      const classes = Array.isArray(req.session.adminClasses) ? req.session.adminClasses : [];
      if (!classes.includes(result.className)) {
        return res.status(403).json({ status: "error", message: "Not permitted to delete this result" });
      }
    }

    // Also delete the result from the contestant's results array
    if (result.contestant) {
      const contestant = await Contestant.findById(result.contestant);
      if (contestant && contestant.results && contestant.results.length > 0) {
        // Convert result.responses to a comparable format
        const resultResponses = result.responses;
        const resultScore = result.score;
        
        // Remove matching results from contestant's results array
        // Match by score and responses
        contestant.results = contestant.results.filter(contestantResult => {
          // If score doesn't match, keep it
          if (contestantResult.score !== resultScore) {
            return true;
          }
          
          // Compare responses - convert Map to object for comparison
          const contestantResponsesObj = contestantResult.responses instanceof Map 
            ? Object.fromEntries(contestantResult.responses)
            : contestantResult.responses;
          
          // Compare response objects
          const resultResponsesKeys = Object.keys(resultResponses || {}).sort();
          const contestantResponsesKeys = Object.keys(contestantResponsesObj || {}).sort();
          
          // If keys don't match, keep it
          if (resultResponsesKeys.length !== contestantResponsesKeys.length) {
            return true;
          }
          
          // Check if all key-value pairs match
          for (const key of resultResponsesKeys) {
            if (resultResponses[key] !== contestantResponsesObj[key]) {
              return true; // Keep this result as it doesn't match
            }
          }
          
          // If we get here, this result matches - remove it
          return false;
        });
        
        await contestant.save();
      }
    }

    await Result.deleteOne({ _id: id });
    res.json({ status: "success", message: "Result deleted" });
  } catch (err) {
    console.error("Error deleting result:", err);
    res.status(500).json({ status: "error", message: "Server error deleting result" });
  }
});

// Classes APIs
app.get("/admin/classes/data", requireAdmin, async (req, res) => {
  try {
    const allClasses = await getValidClasses();
    const allowed = req.session.adminRole === "superadmin"
      ? allClasses
      : (req.session.adminClasses || []);
    const responseClasses = req.session.adminRole === "superadmin" ? allClasses : allowed;
    res.json({ status: "success", classes: responseClasses });
  } catch (err) {
    console.error("Error fetching classes:", err);
    res.status(500).json({ status: "error", message: "Server error fetching classes" });
  }
});

app.post("/admin/classes/data", requireAdmin, async (req, res) => {
  try {
    if (req.session.adminRole !== "superadmin") {
      return res.status(403).json({ status: "error", message: "Only superadmin can add classes" });
    }
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ status: "error", message: "Class name is required" });
    }
    const className = name.trim();
    await ClassModel.updateOne({ name: className }, { name: className }, { upsert: true });
    res.json({ status: "success", message: "Class added" });
  } catch (err) {
    console.error("Error adding class:", err);
    res.status(500).json({ status: "error", message: "Server error adding class" });
  }
});

app.delete("/admin/classes/data/:name", requireAdmin, async (req, res) => {
  try {
    if (req.session.adminRole !== "superadmin") {
      return res.status(403).json({ status: "error", message: "Only superadmin can delete classes" });
    }
    const name = decodeURIComponent(req.params.name || "").trim();
    if (!name) {
      return res.status(400).json({ status: "error", message: "Class name required" });
    }
    await ClassModel.deleteOne({ name });
    await Admin.updateMany(
      {},
      {
        $pull: {
          managedClasses: name,
          classes: { className: name }
        }
      }
    );
    res.json({ status: "success", message: "Class deleted" });
  } catch (err) {
    console.error("Error deleting class:", err);
    res.status(500).json({ status: "error", message: "Server error deleting class" });
  }
});

// Quiz time management endpoints
app.get("/admin/classes/:name/time", requireAdmin, async (req, res) => {
  try {
    if (req.session.adminRole !== "superadmin") {
      return res.status(403).json({ status: "error", message: "Only superadmin can view quiz time" });
    }
    const name = decodeURIComponent(req.params.name || "").trim();
    if (!name) {
      return res.status(400).json({ status: "error", message: "Class name required" });
    }
    const classData = await ClassModel.findOne({ name });
    const quizTime = classData?.quizTime || 300;
    res.json({ status: "success", quizTime });
  } catch (err) {
    console.error("Error fetching quiz time:", err);
    res.status(500).json({ status: "error", message: "Server error fetching quiz time" });
  }
});

app.put("/admin/classes/:name/time", requireAdmin, async (req, res) => {
  try {
    if (req.session.adminRole !== "superadmin") {
      return res.status(403).json({ status: "error", message: "Only superadmin can update quiz time" });
    }
    const name = decodeURIComponent(req.params.name || "").trim();
    const { quizTime } = req.body;
    if (!name) {
      return res.status(400).json({ status: "error", message: "Class name required" });
    }
    if (!quizTime || typeof quizTime !== 'number' || quizTime < 60 || quizTime > 3600) {
      return res.status(400).json({ status: "error", message: "Quiz time must be between 60 and 3600 seconds" });
    }
    await ClassModel.updateOne({ name }, { quizTime }, { upsert: true });
    res.json({ status: "success", message: "Quiz time updated successfully" });
  } catch (err) {
    console.error("Error updating quiz time:", err);
    res.status(500).json({ status: "error", message: "Server error updating quiz time" });
  }
});

// Serve frontend static files (after admin routes to avoid conflicts)
const publicPath = path.join(__dirname, "..", "frontend", "public");
app.use(express.static(publicPath));

// Clean connection without deprecated options
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