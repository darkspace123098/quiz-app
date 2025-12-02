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
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme";
const SUPERADMIN_USERNAME = process.env.SUPERADMIN_USERNAME || "superadmin";
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || "superadmin123";

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
    
    if (username === SUPERADMIN_USERNAME && password === SUPERADMIN_PASSWORD) {
      req.session.adminId = "superadmin";
      req.session.adminUsername = SUPERADMIN_USERNAME;
      req.session.adminRole = "superadmin";
      return res.json({ status: "success" });
    }
    
    const admin = await Admin.findOne({ username });
    if (admin && admin.password === password) {
      req.session.adminId = admin._id.toString();
      req.session.adminUsername = admin.username;
      req.session.adminRole = admin.role || "admin";
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
    role: req.session.adminRole || "admin"
  });
});

app.get("/admin/data", requireAdmin, async (req, res) => {
  try {
    const totalClasses = 3; // BCA-I, BCA-II, BCA-III
    const totalContestants = await Contestant.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalResults = await Result.countDocuments();
    
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
    
    const newAdmin = await Admin.create({
      username,
      password,
      role: "admin",
      classes
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
    .nav-links { display: flex; gap: 10px; margin-bottom: 20px; }
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
        <a href="/admin/add" class="add-admin-btn superadmin-only" id="addAdminBtn" style="display: none; margin-right: 10px; padding: 8px 16px; background: #17a2b8; color: white; text-decoration: none; border-radius: 4px;">Add Admin</a>
        <button class="logout-btn" onclick="logoutAdmin()">Logout</button>
      </div>
    </div>

    <div class="nav-links">
      <a href="/admin/overview" class="nav-link ${activeTab === 'overview' ? 'active' : ''}">Overview</a>
      <a href="/admin/contestants" class="nav-link ${activeTab === 'contestants' ? 'active' : ''}">Contestants</a>
      <a href="/admin/questions" class="nav-link ${activeTab === 'questions' ? 'active' : ''}">Questions</a>
    </div>

    ${content}
  </div>

  <script>
    // Load admin data on page load
    window.addEventListener('load', async () => {
      await checkUserRole();
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
        
        if (data.role === 'superadmin') {
          document.getElementById('addAdminBtn').style.display = 'inline-block';
          document.querySelectorAll('.superadmin-only').forEach(el => {
            el.classList.add('show');
          });
        }
      } catch (err) {
        console.error('Failed to check role:', err);
      }
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
        <option value="BCA-I">BCA-I</option>
        <option value="BCA-II">BCA-II</option>
        <option value="BCA-III">BCA-III</option>
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
          body: JSON.stringify({
            students: [{
              name,
              usn,
              className
            }]
          })
        });
        const data = await res.json();
        
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
        msg.textContent = 'Server error. Please try again.';
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
        <option value="BCA-I">BCA-I</option>
        <option value="BCA-II">BCA-II</option>
        <option value="BCA-III">BCA-III</option>
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
      <label for="adminClasses">Classes (comma separated)</label>
      <input type="text" id="adminClasses" required />
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
      const classes = document.getElementById('adminClasses').value.split(',').map(c => c.trim());
      const msg = document.getElementById('addAdminMessage');
      msg.textContent = '';

      try {
        const res = await fetch('/admin/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, classes })
        });
        const data = await res.json();
        
        if (data.status === 'success') {
          msg.className = 'message success';
          msg.textContent = 'Admin added successfully!';
          document.getElementById('newAdminUsername').value = '';
          document.getElementById('newAdminPassword').value = '';
          document.getElementById('adminClasses').value = '';
        } else {
          msg.className = 'message error';
          msg.textContent = data.message || 'Failed to add admin';
        }
      } catch (err) {
        msg.className = 'message error';
        msg.textContent = 'Server error. Please try again.';
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

app.get("/admin/add", requireAdmin, (req, res) => {
  if (req.session.adminRole !== "superadmin") {
    return res.redirect("/admin/overview");
  }
  res.send(generateAdminPage(addAdminContent, 'add'));
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