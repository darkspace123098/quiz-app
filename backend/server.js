import express, { json } from "express";
import "mongoose";
import cors from "cors";
import { config } from "dotenv";
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

config();
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
app.use(json());
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
  <meta charset="UTF-8" />
  <title>Admin Login</title>
  <style>
    body {
      font-family: "Segoe UI", sans-serif;
      background: linear-gradient(135deg, #74b9ff, #a29bfe);
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .login-card {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      padding: 32px;
      width: 100%;
      max-width: 360px;
    }
    h2 {
      margin-top: 0;
      text-align: center;
      color: #2d3436;
    }
    label {
      display: block;
      margin-top: 12px;
      margin-bottom: 6px;
      font-weight: 600;
    }
    input {
      width: 100%;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #dcdde1;
      font-size: 14px;
    }
    input:focus {
      outline: none;
      border-color: #0984e3;
      box-shadow: 0 0 0 2px rgba(9,132,227,0.15);
    }
    button {
      width: 100%;
      padding: 12px;
      margin-top: 18px;
      border: none;
      border-radius: 8px;
      background: #0984e3;
      color: #ffffff;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
    }
    button:hover {
      background: #74b9ff;
    }
    .message {
      margin-top: 12px;
      text-align: center;
      font-size: 13px;
      font-weight: 600;
      color: #d63031;
    }
  </style>
</head>
<body>
  <div class="login-card">
    <h2>Admin Login</h2>
    <form id="loginForm">
      <label for="username">Username</label>
      <input type="text" id="username" required />
      <label for="password">Password</label>
      <input type="password" id="password" required />
      <button type="submit">Login</button>
      <div id="loginMessage" class="message"></div>
    </form>
  </div>

  <script>
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;
      const msg = document.getElementById("loginMessage");
      msg.textContent = "";

      try {
        const res = await fetch("/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });
        if (res.ok) {
          window.location.href = "/admin/overview";
        } else {
          const data = await res.json();
          msg.textContent = data.message || "Invalid credentials.";
        }
      } catch (err) {
        msg.textContent = "Server error. Please try again.";
      }
    });
  </script>
</body>
</html>`;

// Register quiz routes (before static files)
app.use("/api/quiz", quizRouter);

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
<html>
<head>
  <title>Admin Panel</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .nav-links { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
    .nav-link { padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; display: inline-block; }
    .nav-link:hover { background: #0056b3; }
    .nav-link.active { background: #0056b3; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; font-weight: bold; }
    input, textarea, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
    input[type="text"] { margin-bottom: 10px; }
    button { padding: 10px 20px; background: #28a745; color: white; border: none; cursor: pointer; border-radius: 4px; }
    button:hover { background: #218838; }
    .message { margin-top: 10px; padding: 10px; border-radius: 4px; }
    .success { background: #d4edda; color: #155724; }
    .error { background: #f8d7da; color: #721c24; }
    .stat-card { background: #f5f5f5; padding: 20px; margin: 10px 0; border-radius: 4px; text-align: center; }
    .stat-card h3 { margin: 0 0 10px 0; }
    .stat-card p { font-size: 28px; font-weight: bold; margin: 0; color: #007bff; }
    .superadmin-only { display: none; }
    .superadmin-only.show { display: block; }
    .logout-btn { background: #dc3545; }
    .logout-btn:hover { background: #c82333; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Admin Panel</h1>
      <div>
        <span id="adminUsername"></span>
        <a href="/admin/classes" class="superadmin-only" id="addClassBtn" style="display: none; margin-right: 10px; padding: 8px 16px; background: #6f42c1; color: white; text-decoration: none; border-radius: 4px;">Manage Classes</a>
        <a href="/admin/add" class="add-admin-btn superadmin-only" id="addAdminBtn" style="display: none; margin-right: 10px; padding: 8px 16px; background: #17a2b8; color: white; text-decoration: none; border-radius: 4px;">Add Admin</a>
        <button class="logout-btn" onclick="logoutAdmin()">Logout</button>
      </div>
    </div>

    <div class="nav-links">
      <a href="/admin/overview" class="nav-link ${activeTab === 'overview' ? 'active' : ''}">Overview</a>
      <a href="/admin/contestants" class="nav-link ${activeTab === 'contestants' ? 'active' : ''}">Contestants</a>
      <a href="/admin/questions" class="nav-link ${activeTab === 'questions' ? 'active' : ''}">Questions</a>
      <a href="/admin/results" class="nav-link ${activeTab === 'results' ? 'active' : ''}">Results</a>
      <a href="/admin/classes" class="nav-link superadmin-only ${activeTab === 'classes' ? 'active' : ''}" style="display: none;">Classes</a>
    </div>

    ${content}
  </div>

  <script>
    // Load admin data on page load
    window.addEventListener('load', async () => {
      await checkUserRole();
      await loadClasses();
      applyClassRestrictions();
      if (window.loadPageData) {
        await loadPageData();
      }
      attachEventListeners();
    });

    // Check user role
    async function checkUserRole() {
      try {
        const res = await fetch('/admin/role');
        const data = await res.json();
        
        document.getElementById('adminUsername').textContent = 'Logged in as: ' + data.username;
        window.isSuperadmin = data.role === 'superadmin';
        window.allowedClasses = Array.isArray(data.allowedClasses) ? data.allowedClasses : [];
        
        if (window.isSuperadmin) {
          document.getElementById('addAdminBtn').style.display = 'inline-block';
          document.getElementById('addClassBtn').style.display = 'inline-block';
          document.querySelectorAll('.superadmin-only').forEach(el => {
            el.classList.add('show');
          });
        }
      } catch (err) {
        console.error('Failed to check role:', err);
      }
    }

    // Load classes for dropdowns/checkboxes (returns only allowed classes for admins)
    async function loadClasses() {
      try {
        const res = await fetch('/admin/classes/data');
        const data = await res.json();
        if (!res.ok || data.status !== 'success') {
          console.error('Failed to load classes', data);
          return;
        }
        const classes = data.classes || [];
        window.loadedClasses = classes;
        renderClassOptions(classes);
        renderClassCheckboxes(classes);
      } catch (err) {
        console.error('Error loading classes:', err);
      }
    }

    function renderClassOptions(classList) {
      const selectIds = ['contestantClass', 'questionClass'];
      selectIds.forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        sel.innerHTML = '<option value=\"\">Select a class</option>' + classList.map(c => \`<option value=\"\${c}\">\${c}</option>\`).join('');
      });
    }

    function renderClassCheckboxes(classList) {
      const box = document.getElementById('classCheckboxes');
      if (!box) return;
      box.innerHTML = classList.map(c => \`
        <label style="display:flex; align-items:center; gap:6px; white-space: nowrap;">
          <input type="checkbox" class="admin-class-checkbox" value="\${c}" /> \${c}
        </label>\`).join('');
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
      try {
        await fetch('/admin/logout', { method: 'POST' });
        window.location.href = '/admin/login';
      } catch (err) {
        console.error('Logout failed:', err);
      }
    }
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
  <h2>Overview</h2>
  <div class="stat-card">
    <h3>Total Classes</h3>
    <p id="totalClasses">0</p>
  </div>
  <div class="stat-card">
    <h3>Total Contestants</h3>
    <p id="totalContestants">0</p>
  </div>
  <div class="stat-card">
    <h3>Total Questions</h3>
    <p id="totalQuestions">0</p>
  </div>
  <div class="stat-card">
    <h3>Total Results</h3>
    <p id="totalResults">0</p>
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
      } catch (err) {
        console.error('Failed to load admin data:', err);
      }
    }
  </script>
`;

// Contestants page content
const contestantsContent = `
  <h2>Contestants</h2>
  <form id="contestantForm">
    <div class="form-group">
      <label for="contestantName">Contestant Name</label>
      <input type="text" id="contestantName" required />
    </div>
    <div class="form-group">
      <label for="contestantUSN">USN (e.g., TY23BCA001)</label>
      <input type="text" id="contestantUSN" required placeholder="TY23BCA001" />
    </div>
    <div class="form-group">
      <label for="contestantClass">Class</label>
      <select id="contestantClass" required>
        <option value="">Select a class</option>
      </select>
    </div>
    <button type="submit">Add Contestant</button>
    <div id="contestantMessage" class="message"></div>
  </form>
  <div id="contestantList"></div>

  <script>
    async function loadPageData() {
      // Load contestants list if needed
    }

    async function addContestantHandler(e) {
      e.preventDefault();
      const name = document.getElementById('contestantName').value.trim();
      const usn = document.getElementById('contestantUSN').value.trim().toUpperCase();
      const className = document.getElementById('contestantClass').value.trim();
      const msg = document.getElementById('contestantMessage');
      msg.textContent = '';

      if (!name || !usn || !className) {
        msg.className = 'message error';
        msg.textContent = 'Please fill all fields';
        return;
      }

      try {
        const res = await fetch('/api/quiz/contestant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            students: [{
              name,
              usn,
              className
            }]
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
        
        if (data.status === 'success') {
          msg.className = 'message success';
          msg.textContent = 'Contestant added successfully!';
          document.getElementById('contestantName').value = '';
          document.getElementById('contestantUSN').value = '';
          document.getElementById('contestantClass').value = '';
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
  </script>
`;

// Questions page content
const questionsContent = `
  <h2>Questions</h2>
  <form id="questionForm">
    <div class="form-group">
      <label for="questionText">Question Text</label>
      <textarea id="questionText" rows="3" required placeholder="Enter your question here..."></textarea>
    </div>
    <div class="form-group">
      <label for="questionClass">Class</label>
      <select id="questionClass" required>
        <option value="">Select a class</option>
      </select>
    </div>
    <div class="form-group">
      <label>Options (4 required)</label>
      <input type="text" id="option1" placeholder="Option 1" required />
      <input type="text" id="option2" placeholder="Option 2" required />
      <input type="text" id="option3" placeholder="Option 3" required />
      <input type="text" id="option4" placeholder="Option 4" required />
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
    <button type="submit">Add Question</button>
    <div id="questionMessage" class="message"></div>
  </form>
  <div id="questionList"></div>

  <script>
    async function loadPageData() {
      // Load questions list if needed
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

    async function addQuestionHandler(e) {
      e.preventDefault();
      const questionText = document.getElementById('questionText').value.trim();
      const className = document.getElementById('questionClass').value.trim();
      const option1 = document.getElementById('option1').value.trim();
      const option2 = document.getElementById('option2').value.trim();
      const option3 = document.getElementById('option3').value.trim();
      const option4 = document.getElementById('option4').value.trim();
      const correctAnswerIndex = document.getElementById('correctAnswer').value;
      const msg = document.getElementById('questionMessage');
      msg.textContent = '';

      if (!questionText || !className || !option1 || !option2 || !option3 || !option4 || !correctAnswerIndex) {
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
          document.getElementById('option1').value = '';
          document.getElementById('option2').value = '';
          document.getElementById('option3').value = '';
          document.getElementById('option4').value = '';
          document.getElementById('correctAnswer').value = '';
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
  </script>
`;

// Results page content
const resultsContent = `
  <h2>Results</h2>
  <div id="resultsMessage" class="message"></div>
  <div id="resultsContainer" style="overflow-x: auto;">
    <table id="resultsTable" style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="text-align: left;">
          <th style="padding: 8px; border-bottom: 1px solid #ddd;">Name</th>
          <th style="padding: 8px; border-bottom: 1px solid #ddd;">USN</th>
          <th style="padding: 8px; border-bottom: 1px solid #ddd;">Class</th>
          <th style="padding: 8px; border-bottom: 1px solid #ddd;">Score</th>
          <th style="padding: 8px; border-bottom: 1px solid #ddd;">Submitted At</th>
        </tr>
      </thead>
      <tbody id="resultsBody">
        <tr><td colspan="5" style="padding: 12px;">Loading...</td></tr>
      </tbody>
    </table>
  </div>

  <script>
    async function loadPageData() {
      const msg = document.getElementById('resultsMessage');
      const body = document.getElementById('resultsBody');
      msg.textContent = '';
      body.innerHTML = '<tr><td colspan="5" style="padding: 12px;">Loading...</td></tr>';

      try {
        const res = await fetch('/admin/results/data', { credentials: 'include' });
        let data;
        try {
          data = await res.json();
        } catch (err) {
          msg.className = 'message error';
          msg.textContent = 'Invalid server response.';
          return;
        }

        if (!res.ok || data.status !== 'success') {
          msg.className = 'message error';
          msg.textContent = data.message || 'Failed to load results';
          body.innerHTML = '<tr><td colspan="5" style="padding: 12px;">No data</td></tr>';
          return;
        }

        if (!data.results || data.results.length === 0) {
          body.innerHTML = '<tr><td colspan="5" style="padding: 12px;">No results yet</td></tr>';
          return;
        }

        body.innerHTML = data.results.map(r => {
          const date = new Date(r.submittedAt || r.createdAt || r._id).toLocaleString();
          return \`<tr>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">\${r.name || '-'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">\${r.usn || '-'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">\${r.className || '-'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">\${r.score ?? '-'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">\${date}</td>
          </tr>\`;
        }).join('');
      } catch (err) {
        console.error('Failed to load results:', err);
        msg.className = 'message error';
        msg.textContent = 'Server error while loading results.';
        body.innerHTML = '<tr><td colspan="5" style="padding: 12px;">Error loading results</td></tr>';
      }
    }
  </script>
`;

// Classes management page (superadmin only)
const classesContent = `
  <h2>Classes</h2>
  <div id="classesMessage" class="message"></div>
  <form id="addClassForm" style="margin-bottom: 20px;">
    <div class="form-group">
      <label for="newClassName">Class Name</label>
      <input type="text" id="newClassName" placeholder="e.g., BCA-IV" required />
    </div>
    <button type="submit">Add Class</button>
  </form>
  <div id="classesListContainer">
    <table style="width:100%; border-collapse: collapse;">
      <thead>
        <tr style="text-align:left;">
          <th style="padding:8px; border-bottom:1px solid #ddd;">Class Name</th>
          <th style="padding:8px; border-bottom:1px solid #ddd;">Actions</th>
        </tr>
      </thead>
      <tbody id="classesTableBody">
        <tr><td colspan="2" style="padding: 12px;">Loading...</td></tr>
      </tbody>
    </table>
  </div>

  <script>
    async function loadPageData() {
      await refreshClassesTable();
      const form = document.getElementById('addClassForm');
      if (form) form.addEventListener('submit', addClassHandler);
    }

    async function refreshClassesTable() {
      const body = document.getElementById('classesTableBody');
      const msg = document.getElementById('classesMessage');
      msg.textContent = '';
      body.innerHTML = '<tr><td colspan="2" style="padding: 12px;">Loading...</td></tr>';
      try {
        const res = await fetch('/admin/classes/data');
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
        body.innerHTML = classes.map(c => \`
          <tr>
            <td style="padding:8px; border-bottom:1px solid #f0f0f0;">\${c}</td>
            <td style="padding:8px; border-bottom:1px solid #f0f0f0;">
              <button data-class="\${c}" class="delete-class-btn" style="background:#dc3545; color:white; border:none; padding:6px 10px; border-radius:4px; cursor:pointer;">Delete</button>
            </td>
          </tr>\`).join('');

        document.querySelectorAll('.delete-class-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const cls = e.target.getAttribute('data-class');
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
          await loadClasses();
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
          await loadClasses();
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
  <div style="margin-bottom: 20px;">
    <a href="/admin/overview" style="padding: 8px 16px; background: #6c757d; color: white; text-decoration: none; border-radius: 4px; margin-bottom: 10px; display: inline-block;">← Back to Overview</a>
  </div>
  <h2>Add New Admin</h2>
  <form id="addAdminForm">
    <div class="form-group">
      <label for="newAdminUsername">Username</label>
      <input type="text" id="newAdminUsername" required />
    </div>
    <div class="form-group">
      <label for="newAdminPassword">Password</label>
      <input type="password" id="newAdminPassword" required />
    </div>
    <div class="form-group">
      <label>Classes (select one or more)</label>
      <div id="classCheckboxes" style="display: flex; gap: 16px; flex-wrap: nowrap; overflow-x: auto; padding: 4px 0;"></div>
    </div>
    <button type="submit">Add Admin</button>
    <div id="addAdminMessage" class="message"></div>
  </form>

  <script>
    async function loadPageData() {
      const addAdminForm = document.getElementById('addAdminForm');
      if (addAdminForm) {
        addAdminForm.addEventListener('submit', addAdminHandler);
      }
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

// Serve frontend static files (after admin routes to avoid conflicts)
const publicPath = path.join(__dirname, "..", "frontend", "public");
app.use(express.static(publicPath));

// Clean connection without deprecated options
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/quiz-app")
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