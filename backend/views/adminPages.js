// Admin login page HTML
export const adminLoginPage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Admin Login</title>
  <style>
    :root {
      --primary: #4f46e5;
      --primary-light: #6366f1;
      --bg: #f8fafc;
      --card: #ffffff;
      --text: #1e293b;
      --muted: #64748b;
      --error: #ef4444;
    }
    * { box-sizing: border-box; }
    body {
      font-family: "Inter", "Segoe UI", sans-serif;
      background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      color: var(--text);
      padding: 16px;
    }
    .login-card {
      background: var(--card);
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 18px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      padding: 32px;
      width: 100%;
      max-width: 420px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .brand-badge {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--primary), var(--primary-light));
      display: grid;
      place-items: center;
      font-weight: 700;
      color: white;
    }
    h2 {
      margin: 0 0 4px 0;
      color: var(--text);
      font-size: 24px;
    }
    p.subtitle {
      margin: 0 0 18px 0;
      color: var(--muted);
      font-size: 14px;
    }
    label {
      display: block;
      margin-top: 14px;
      margin-bottom: 6px;
      font-weight: 600;
      color: var(--text);
      font-size: 14px;
    }
    input {
      width: 100%;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      color: var(--text);
      font-size: 15px;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
    }
    button {
      width: 100%;
      padding: 12px;
      margin-top: 22px;
      border: none;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--primary), var(--primary-light));
      color: #ffffff;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(79,70,229,0.3);
      transition: transform 0.1s ease, box-shadow 0.1s ease;
    }
    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(79,70,229,0.4);
    }
    .message {
      margin-top: 14px;
      text-align: center;
      font-size: 13px;
      font-weight: 600;
      color: var(--error);
      min-height: 18px;
    }
    @media (max-width: 480px) {
      .login-card {
        padding: 24px;
      }
      h2 { font-size: 20px; }
    }
  </style>
</head>
<body>
  <div class="login-card">
    <div class="brand">
      <div class="brand-badge">QA</div>
      <div>
        <h2>Admin Login</h2>
        <p class="subtitle">Secure access to quiz control panel</p>
      </div>
    </div>
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

// Helper function to generate admin page HTML with navigation
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

export function generateAdminPage(content, activeTab = 'overview') {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Admin Panel</title>
  <style>
    :root {
      --primary: #4f46e5;
      --primary-dark: #4338ca;
      --bg: #f8fafc;
      --panel: #ffffff;
      --card: #ffffff;
      --border: #e2e8f0;
      --text: #1e293b;
      --muted: #64748b;
      --success: #22c55e;
      --error: #ef4444;
    }
    * { box-sizing: border-box; }
    body {
      font-family: "Inter", "Segoe UI", sans-serif;
      margin: 0;
      background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
      color: var(--text);
      min-height: 100vh;
      padding: 20px;
    }
    .container { max-width: 1220px; margin: 0 auto; }
    .header {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }
    .header h1 { margin: 0; color: var(--text); font-size: 24px; }
    .nav-links {
      display: flex;
      gap: 10px;
      margin: 0 0 24px 0;
      flex-wrap: wrap;
    }
    .nav-link {
      padding: 10px 16px;
      background: #ffffff;
      color: var(--text);
      text-decoration: none;
      border-radius: 10px;
      border: 1px solid var(--border);
      transition: background 0.15s, border-color 0.15s, transform 0.1s;
    }
    .nav-link:hover { background: #f1f5f9; border-color: var(--primary); }
    .nav-link.active { background: var(--primary); border-color: var(--primary); color: #fff; }
    h2 {
      margin: 0 0 24px 0;
      color: var(--text);
      font-size: 22px;
      font-weight: 700;
    }
    h3 {
      margin: 0 0 16px 0;
      color: var(--text);
      font-size: 18px;
      font-weight: 600;
    }
    h4 {
      margin: 0 0 12px 0;
      color: var(--text);
      font-size: 16px;
      font-weight: 600;
    }
    form {
      margin-bottom: 24px;
      padding: 20px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; font-weight: 600; color: var(--text); }
    input, textarea, select {
      width: 100%;
      padding: 12px 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: #ffffff;
      color: var(--text);
      font-size: 14px;
    }
    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
    }
    button {
      padding: 12px 20px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
      border: none;
      cursor: pointer;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      transition: transform 0.1s, box-shadow 0.1s;
      margin-top: 8px;
    }
    button:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(79,70,229,0.3); }
    .message { margin: 16px 0; padding: 12px 16px; border-radius: 8px; }
    .success { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
    .error { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    .stat-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); 
      gap: 20px; 
      margin-bottom: 24px;
    }
    .stat-card {
      background: var(--card);
      border: 1px solid var(--border);
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .stat-card h3 { margin: 0 0 12px 0; color: var(--muted); font-size: 14px; letter-spacing: 0.2px; }
    .stat-card p { font-size: 32px; font-weight: 700; margin: 0; color: var(--primary); }
    .superadmin-only { display: none; }
    .superadmin-only.show { display: block; }
    .logout-btn { background: #dc3545; }
    .logout-btn:hover { background: #c82333; }
    #adminUsername { color: var(--muted); font-size: 14px; margin-right: 12px; }
    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--card);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      margin-bottom: 24px;
    }
    table thead {
      background: #f8fafc;
    }
    table th {
      padding: 14px 16px;
      text-align: left;
      font-weight: 600;
      color: var(--text);
      border-bottom: 2px solid var(--border);
      font-size: 14px;
    }
    table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      color: var(--text);
      font-size: 14px;
    }
    table tbody tr:last-child td {
      border-bottom: none;
    }
    table tbody tr:hover {
      background: #f8fafc;
    }
    .content-section {
      margin-bottom: 32px;
    }
    .btn-edit {
      background: #17a2b8;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      margin-right: 6px;
    }
    .btn-edit:hover {
      background: #138496;
    }
    .btn-delete {
      background: #dc3545;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
    }
    .btn-delete:hover {
      background: #c82333;
    }
    .modal {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
      overflow: auto;
    }
    .modal-content {
      background-color: var(--card);
      margin: 5% auto;
      padding: 24px;
      border: 1px solid var(--border);
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    .close {
      color: var(--muted);
      float: right;
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
    }
    .close:hover {
      color: var(--text);
    }
    @media (max-width: 720px) {
      body { padding: 14px; }
      .header { flex-direction: column; align-items: flex-start; margin-bottom: 20px; }
      .nav-links { gap: 8px; margin-bottom: 20px; }
      .nav-link { width: fit-content; }
      form { padding: 16px; }
      .stat-grid { gap: 12px; }
    }
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
        const res = await fetch('/admin/classes/data', { credentials: 'include' });
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

// Page content templates
export const overviewContent = `
  <h2>Overview</h2>
  <div class="stat-grid">
    <div class="stat-card">
      <h3>Total Classes</h3>
      <p id="totalClasses"><a href="https://www.flaticon.com/free-icons/loading" title="loading icons">Loading icons created by Freepik - Flaticon</a></p>
    </div>
    <div class="stat-card">
      <h3>Total Contestants</h3>
      <p id="totalContestants">Loading...</p>
    </div>
    <div class="stat-card">
      <h3>Total Questions</h3>
      <p id="totalQuestions">Loading...</p>
    </div>
    <div class="stat-card">
      <h3>Total Results</h3>
      <p id="totalResults">Loading...</p>
    </div>
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

export const contestantsContent = `
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
      <label for="contestantQuizCode">Quiz Code</label>
      <input type="text" id="contestantQuizCode" required placeholder="e.g., AI-ML-2025" />
    </div>
    <div class="form-group">
      <label for="contestantPassword">Contestant Password (assigned by admin)</label>
      <input type="text" id="contestantPassword" required placeholder="Password for this contestant" />
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
  
  <div class="content-section">
    <h3>All Contestants</h3>
    <div id="contestantsMessage" class="message"></div>
    <div id="contestantsContainer" style="overflow-x: auto;">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>USN</th>
            <th>Class</th>
            <th>Quiz Code</th>
            <th>Password</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="contestantsBody">
          <tr><td colspan="6" style="padding: 12px;">Loading...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Edit Contestant Modal -->
  <div id="editContestantModal" class="modal">
    <div class="modal-content">
      <span class="close" onclick="closeEditContestantModal()">&times;</span>
      <h3>Edit Contestant</h3>
      <form id="editContestantForm">
        <input type="hidden" id="editContestantId" />
        <div class="form-group">
          <label for="editContestantName">Name</label>
          <input type="text" id="editContestantName" required />
        </div>
        <div class="form-group">
          <label for="editContestantUSN">USN</label>
          <input type="text" id="editContestantUSN" required />
        </div>
        <div class="form-group">
          <label for="editContestantClass">Class</label>
          <select id="editContestantClass" required></select>
        </div>
        <div class="form-group">
          <label for="editContestantQuizCode">Quiz Code</label>
          <input type="text" id="editContestantQuizCode" required />
        </div>
        <div class="form-group">
          <label for="editContestantPassword">Password</label>
          <input type="text" id="editContestantPassword" />
        </div>
        <button type="submit">Update Contestant</button>
        <div id="editContestantMessage" class="message"></div>
      </form>
    </div>
  </div>

  <script>
    async function loadPageData() {
      await loadContestants();
    }

    async function loadContestants() {
      const msg = document.getElementById('contestantsMessage');
      const body = document.getElementById('contestantsBody');
      msg.textContent = '';
      body.innerHTML = '<tr><td colspan="6" style="padding: 12px;">Loading...</td></tr>';

      try {
        const res = await fetch('/admin/contestants/data', { credentials: 'include' });
        const data = await res.json();

        if (!res.ok || data.status !== 'success') {
          msg.className = 'message error';
          msg.textContent = data.message || 'Failed to load contestants';
          body.innerHTML = '<tr><td colspan="6" style="padding: 12px;">No data</td></tr>';
          return;
        }

        if (!data.contestants || data.contestants.length === 0) {
          body.innerHTML = '<tr><td colspan="6" style="padding: 12px;">No contestants yet</td></tr>';
          return;
        }

        body.innerHTML = data.contestants.map(c => {
          const date = new Date(c.createdAt || c._id).toLocaleString();
          return \`<tr data-id="\${c._id}">
            <td>\${c.name || '-'}</td>
            <td>\${c.usn || '-'}</td>
            <td>\${c.className || '-'}</td>
            <td>\${c.quizCode || '-'}</td>
            <td>\${c.quizPassword ? '••••••' : '-'}</td>
            <td>
              <button class="btn-edit" onclick="openEditContestantModal('\${c._id}', '\${c.name}', '\${c.usn}', '\${c.className}', '\${c.quizCode}', '\${c.quizPassword || ''}')">Edit</button>
              <button class="btn-delete" onclick="deleteContestant('\${c._id}')">Delete</button>
            </td>
          </tr>\`;
        }).join('');

      } catch (err) {
        console.error('Failed to load contestants:', err);
        msg.className = 'message error';
        msg.textContent = 'Server error while loading contestants.';
        body.innerHTML = '<tr><td colspan="6" style="padding: 12px;">Error loading contestants</td></tr>';
      }
    }

    function openEditContestantModal(id, name, usn, className, quizCode, password) {
      document.getElementById('editContestantId').value = id;
      document.getElementById('editContestantName').value = name || '';
      document.getElementById('editContestantUSN').value = usn || '';
      document.getElementById('editContestantQuizCode').value = quizCode || '';
      document.getElementById('editContestantPassword').value = password || '';
      
      const classSelect = document.getElementById('editContestantClass');
      const currentClasses = window.loadedClasses || [];
      classSelect.innerHTML = '<option value="">Select a class</option>' + 
        currentClasses.map(c => \`<option value="\${c}" \${c === className ? 'selected' : ''}>\${c}</option>\`).join('');
      
      document.getElementById('editContestantModal').style.display = 'block';
    }

    function closeEditContestantModal() {
      document.getElementById('editContestantModal').style.display = 'none';
      document.getElementById('editContestantForm').reset();
    }

    window.onclick = function(event) {
      const modal = document.getElementById('editContestantModal');
      if (event.target === modal) {
        closeEditContestantModal();
      }
    }

    document.addEventListener('DOMContentLoaded', function() {
      const editForm = document.getElementById('editContestantForm');
      if (editForm) {
        editForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const id = document.getElementById('editContestantId').value;
          const name = document.getElementById('editContestantName').value.trim();
          const usn = document.getElementById('editContestantUSN').value.trim().toUpperCase();
          const className = document.getElementById('editContestantClass').value.trim();
          const quizCode = document.getElementById('editContestantQuizCode').value.trim();
          const password = document.getElementById('editContestantPassword').value;
          const msg = document.getElementById('editContestantMessage');
          msg.textContent = '';

          try {
            const res = await fetch(\`/api/quiz/contestant/\${id}\`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ name, usn, className, quizCode, quizPassword: password || undefined })
            });
            const data = await res.json();
            if (res.ok && data.status === 'success') {
              msg.className = 'message success';
              msg.textContent = 'Contestant updated successfully';
              setTimeout(() => {
                closeEditContestantModal();
                loadContestants();
              }, 1000);
            } else {
              msg.className = 'message error';
              msg.textContent = data.message || 'Failed to update contestant';
            }
          } catch (err) {
            msg.className = 'message error';
            msg.textContent = 'Server error updating contestant';
          }
        });
      }
    });

    async function deleteContestant(id) {
      if (!confirm('Are you sure you want to delete this contestant?')) return;
      
      try {
        const res = await fetch(\`/api/quiz/contestant/\${id}\`, {
          method: 'DELETE',
          credentials: 'include'
        });
        const data = await res.json();
        
        if (res.ok && data.status === 'success') {
          const msg = document.getElementById('contestantsMessage');
          msg.className = 'message success';
          msg.textContent = 'Contestant deleted successfully';
          await loadContestants();
        } else {
          alert(data.message || 'Failed to delete contestant');
        }
      } catch (err) {
        alert('Server error deleting contestant');
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

      if (!name || !usn || !className || !quizCode || !quizPassword) {
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
              className,
              quizCode,
              quizPassword
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
          document.getElementById('contestantQuizCode').value = '';
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
  </script>
`;

export const questionsContent = `
  <h2>Questions</h2>
  <form id="questionForm">
    <div class="form-group">
      <label for="questionText">Question Text</label>
      <textarea id="questionText" rows="3" required placeholder="Enter your question here..."></textarea>
    </div>
    <div class="form-group">
      <label for="questionQuizCode">Quiz Code</label>
      <input type="text" id="questionQuizCode" required placeholder="e.g., AI-ML-2025" />
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
  
  <div class="content-section">
    <h3>All Questions</h3>
    <div id="questionsMessage" class="message"></div>
    <div id="questionsContainer" style="overflow-x: auto;">
      <table>
        <thead>
          <tr>
            <th>Question</th>
            <th>Class</th>
            <th>Quiz Code</th>
            <th>Options</th>
            <th>Correct Answer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="questionsBody">
          <tr><td colspan="6" style="padding: 12px;">Loading...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Edit Question Modal -->
  <div id="editQuestionModal" class="modal">
    <div class="modal-content">
      <span class="close" onclick="closeEditQuestionModal()">&times;</span>
      <h3>Edit Question</h3>
      <form id="editQuestionForm">
        <input type="hidden" id="editQuestionId" />
        <div class="form-group">
          <label for="editQuestionText">Question Text</label>
          <textarea id="editQuestionText" rows="3" required></textarea>
        </div>
        <div class="form-group">
          <label for="editQuestionClass">Class</label>
          <select id="editQuestionClass" required></select>
        </div>
        <div class="form-group">
          <label for="editQuestionQuizCode">Quiz Code</label>
          <input type="text" id="editQuestionQuizCode" required />
        </div>
        <div class="form-group">
          <label>Options (4 required)</label>
          <input type="text" id="editOption1" required />
          <input type="text" id="editOption2" required />
          <input type="text" id="editOption3" required />
          <input type="text" id="editOption4" required />
        </div>
        <div class="form-group">
          <label for="editCorrectAnswer">Correct Answer</label>
          <select id="editCorrectAnswer" required>
            <option value="">Select correct answer</option>
            <option value="option1" id="editCorrectOption1">Option 1</option>
            <option value="option2" id="editCorrectOption2">Option 2</option>
            <option value="option3" id="editCorrectOption3">Option 3</option>
            <option value="option4" id="editCorrectOption4">Option 4</option>
          </select>
        </div>
        <button type="submit">Update Question</button>
        <div id="editQuestionMessage" class="message"></div>
      </form>
    </div>
  </div>

  <script>
    async function loadPageData() {
      await loadQuestions();
    }

    async function loadQuestions() {
      const msg = document.getElementById('questionsMessage');
      const body = document.getElementById('questionsBody');
      msg.textContent = '';
      body.innerHTML = '<tr><td colspan="6" style="padding: 12px;">Loading...</td></tr>';

      try {
        const res = await fetch('/admin/questions/data', { credentials: 'include' });
        const data = await res.json();

        if (!res.ok || data.status !== 'success') {
          msg.className = 'message error';
          msg.textContent = data.message || 'Failed to load questions';
          body.innerHTML = '<tr><td colspan="6" style="padding: 12px;">No data</td></tr>';
          return;
        }

        if (!data.questions || data.questions.length === 0) {
          body.innerHTML = '<tr><td colspan="6" style="padding: 12px;">No questions yet</td></tr>';
          return;
        }

        body.innerHTML = data.questions.map(q => {
          const optionsText = Array.isArray(q.options) ? q.options.join(', ') : 'N/A';
          const questionPreview = (q.questionText || '').substring(0, 50) + (q.questionText?.length > 50 ? '...' : '');
          return \`<tr data-id="\${q._id}">
            <td title="\${q.questionText || ''}">\${questionPreview || '-'}</td>
            <td>\${q.className || '-'}</td>
            <td>\${q.quizCode || '-'}</td>
            <td title="\${optionsText}">\${optionsText.substring(0, 40)}...</td>
            <td>\${q.correctAnswer || '-'}</td>
            <td>
            <!--Edit button is disabled for now-->
              <button class="btn-edit" onclick="OpenEditQuestionModal('\${q._id}', '\${(q.questionText || '').replace(/'/g, "\\\\'")}', '\${q.className || ''}', '\${q.quizCode || ''}', \${JSON.stringify(q.options || [])}, '\${(q.correctAnswer || '').replace(/'/g, "\\\\'")}')">Edit</button>
              <button class="btn-delete" onclick="deleteQuestion('\${q._id}')">Delete</button>
            </td>
          </tr>\`;
        }).join('');

      } catch (err) {
        console.error('Failed to load questions:', err);
        msg.className = 'message error';
        msg.textContent = 'Server error while loading questions.';
        body.innerHTML = '<tr><td colspan="6" style="padding: 12px;">Error loading questions</td></tr>';
      }
    }

    function OpenEditQuestionModal(id, questionText, className, quizCode, optionsJson, correctAnswer) {
      document.getElementById('editQuestionId').value = id;
      document.getElementById('editQuestionText').value = questionText || '';
      document.getElementById('editQuestionQuizCode').value = quizCode || '';
      
      const classSelect = document.getElementById('editQuestionClass');
      const currentClasses = window.loadedClasses || [];
      classSelect.innerHTML = '<option value="">Select a class</option>' + 
        currentClasses.map(c => \`<option value="\${c}" \${c === className ? 'selected' : ''}>\${c}</option>\`).join('');
      
      let options = [];
      try {
        options = typeof optionsJson === 'string' ? JSON.parse(optionsJson) : (Array.isArray(optionsJson) ? optionsJson : []);
      } catch (e) {
        options = [];
      }
      document.getElementById('editOption1').value = options[0] || '';
      document.getElementById('editOption2').value = options[1] || '';
      document.getElementById('editOption3').value = options[2] || '';
      document.getElementById('editOption4').value = options[3] || '';
      
      updateEditCorrectAnswerLabels();
      const correctIndex = options.indexOf(correctAnswer);
      if (correctIndex >= 0) {
        document.getElementById('editCorrectAnswer').value = \`option\${correctIndex + 1}\`;
      }
      
      document.getElementById('editQuestionModal').style.display = 'block';
    }

    function closeEditQuestionModal() {
      document.getElementById('editQuestionModal').style.display = 'none';
      document.getElementById('editQuestionForm').reset();
    }

    function updateEditCorrectAnswerLabels() {
      const option1 = document.getElementById('editOption1')?.value.trim() || 'Option 1';
      const option2 = document.getElementById('editOption2')?.value.trim() || 'Option 2';
      const option3 = document.getElementById('editOption3')?.value.trim() || 'Option 3';
      const option4 = document.getElementById('editOption4')?.value.trim() || 'Option 4';
      
      document.getElementById('editCorrectOption1').textContent = option1;
      document.getElementById('editCorrectOption2').textContent = option2;
      document.getElementById('editCorrectOption3').textContent = option3;
      document.getElementById('editCorrectOption4').textContent = option4;
    }

    ['editOption1', 'editOption2', 'editOption3', 'editOption4'].forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('input', updateEditCorrectAnswerLabels);
      }
    });

    window.onclick = function(event) {
      const modal = document.getElementById('editQuestionModal');
      if (event.target === modal) {
        closeEditQuestionModal();
      }
    }

    document.addEventListener('DOMContentLoaded', function() {
      const editForm = document.getElementById('editQuestionForm');
      if (editForm) {
        editForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const id = document.getElementById('editQuestionId').value;
          const questionText = document.getElementById('editQuestionText').value.trim();
          const className = document.getElementById('editQuestionClass').value.trim();
          const quizCode = document.getElementById('editQuestionQuizCode').value.trim();
          const option1 = document.getElementById('editOption1').value.trim();
          const option2 = document.getElementById('editOption2').value.trim();
          const option3 = document.getElementById('editOption3').value.trim();
          const option4 = document.getElementById('editOption4').value.trim();
          const correctAnswerIndex = document.getElementById('editCorrectAnswer').value;
          const msg = document.getElementById('editQuestionMessage');
          msg.textContent = '';

          const options = [option1, option2, option3, option4];
          const optionIndex = parseInt(correctAnswerIndex.replace('option', '')) - 1;
          const correctAnswer = options[optionIndex];

          try {
            const res = await fetch(\`/api/quiz/question/\${id}\`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ questionText, className, quizCode, options, correctAnswer })
            });
            const data = await res.json();
            if (res.ok && data.status === 'success') {
              msg.className = 'message success';
              msg.textContent = 'Question updated successfully';
              setTimeout(() => {
                closeEditQuestionModal();
                loadQuestions();
              }, 1000);
            } else {
              msg.className = 'message error';
              msg.textContent = data.message || 'Failed to update question';
            }
          } catch (err) {
            msg.className = 'message error';
            msg.textContent = 'Server error updating question';
          }
        });
      }
    });

    async function deleteQuestion(id) {
      if (!confirm('Are you sure you want to delete this question?')) return;
      
      try {
        const res = await fetch(\`/api/quiz/question/\${id}\`, {
          method: 'DELETE',
          credentials: 'include'
        });
        const data = await res.json();
        
        if (res.ok && data.status === 'success') {
          const msg = document.getElementById('questionsMessage');
          msg.className = 'message success';
          msg.textContent = 'Question deleted successfully';
          await loadQuestions();
        } else {
          alert(data.message || 'Failed to delete question');
        }
      } catch (err) {
        alert('Server error deleting question');
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
  </script>
`;

export const resultsContent = `
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
          <th style="padding: 8px; border-bottom: 1px solid #ddd;">Actions</th>
        </tr>
      </thead>
      <tbody id="resultsBody">
        <tr><td colspan="6" style="padding: 12px;">Loading...</td></tr>
      </tbody>
    </table>
  </div>

  <script>
    async function loadPageData() {
      const msg = document.getElementById('resultsMessage');
      const body = document.getElementById('resultsBody');
      msg.textContent = '';
      body.innerHTML = '<tr><td colspan="6" style="padding: 12px;">Loading...</td></tr>';

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
          body.innerHTML = '<tr><td colspan="6" style="padding: 12px;">No data</td></tr>';
          return;
        }

        if (!data.results || data.results.length === 0) {
          body.innerHTML = '<tr><td colspan="6" style="padding: 12px;">No results yet</td></tr>';
          return;
        }

        body.innerHTML = data.results.map(r => {
          const date = new Date(r.submittedAt || r.createdAt || r._id).toLocaleString();
          return \`<tr data-id="\${r._id}">
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">\${r.name || '-'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">\${r.usn || '-'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">\${r.className || '-'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">\${r.score ?? '-'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">\${date}</td>
            <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">
              <button class="delete-result-btn" data-id="\${r._id}" style="background:#dc3545; color:white; border:none; padding:6px 10px; border-radius:4px; cursor:pointer; pointer-events:auto; position:relative; z-index:1;">Delete</button>
            </td>
          </tr>\`;
        }).join('');

        document.querySelectorAll('.delete-result-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const button = e.currentTarget || e.target.closest('.delete-result-btn');
            if (!button) return;
            const id = button.getAttribute('data-id');
            if (!id || button.disabled) return;
            if (!confirm('Delete this result?')) return;
            await deleteResult(id);
          });
        });
      } catch (err) {
        console.error('Failed to load results:', err);
        msg.className = 'message error';
        msg.textContent = 'Server error while loading results.';
        body.innerHTML = '<tr><td colspan="6" style="padding: 12px;">Error loading results</td></tr>';
      }
    }

    async function deleteResult(id) {
      const msg = document.getElementById('resultsMessage');
      const body = document.getElementById('resultsBody');
      msg.textContent = '';
      msg.className = '';
      
      const deleteBtn = document.querySelector(\`.delete-result-btn[data-id="\${id}"]\`);
      if (deleteBtn) {
        deleteBtn.disabled = true;
        deleteBtn.style.opacity = '0.6';
        deleteBtn.style.cursor = 'not-allowed';
        deleteBtn.textContent = 'Deleting...';
      }
      
      try {
        const res = await fetch('/admin/results/' + encodeURIComponent(id), { 
          method: 'DELETE', 
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        let data;
        try {
          data = await res.json();
        } catch (parseErr) {
          throw new Error('Invalid server response');
        }
        
        if (res.ok && data.status === 'success') {
          msg.className = 'message success';
          msg.textContent = 'Result deleted successfully';
          await loadPageData();
        } else {
          msg.className = 'message error';
          msg.textContent = data.message || 'Failed to delete result';
          if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.style.opacity = '1';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.textContent = 'Delete';
          }
        }
      } catch (err) {
        console.error('Error deleting result:', err);
        msg.className = 'message error';
        msg.textContent = 'Server error while deleting result: ' + (err.message || 'Unknown error');
        if (deleteBtn) {
          deleteBtn.disabled = false;
          deleteBtn.style.opacity = '1';
          deleteBtn.style.cursor = 'pointer';
          deleteBtn.textContent = 'Delete';
        }
      }
    }
  </script>
`;

export const classesContent = `
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
          document.getElementById('newClassName').value = '';
          await refreshClassesTable();
          msg.textContent = 'Class added successfully';
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

export const addAdminContent = `
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

