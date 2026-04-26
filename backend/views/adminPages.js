// Admin login page HTML
export const adminLoginPage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login | Quiz Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --bg: #f0f2f5;
      --card: #ffffff;
      --text: #0f172a;
      --muted: #475569;
      --error: #ef4444;
      --success: #10b981;
      --border: #d1d5db;
      --input-bg: #f8fafc;
      --input-focus-bg: #ffffff;
    }
    
    [data-theme="dark"] {
      --bg: #0f172a;
      --card: rgba(30, 41, 59, 0.85);
      --text: #f8fafc;
      --muted: #94a3b8;
      --border: rgba(255, 255, 255, 0.1);
      --input-bg: rgba(15, 23, 42, 0.6);
      --input-focus-bg: rgba(15, 23, 42, 0.8);
    }

    * { box-sizing: border-box; }
    body {
      font-family: "Plus Jakarta Sans", sans-serif;
      background: var(--bg);
      background-image: radial-gradient(ellipse at top left, #e0e7ff 0%, var(--bg) 50%, #f0f2f5 100%);
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      color: var(--text);
      padding: 20px;
      transition: background 0.4s ease, color 0.3s ease;
    }

    [data-theme="dark"] body {
      background-image: radial-gradient(circle at top left, #1e293b 0%, #0f172a 100%);
    }

    .theme-toggle {
      position: absolute;
      top: 24px;
      right: 24px;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: var(--card);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text);
      transition: all 0.2s;
      backdrop-filter: blur(10px);
      z-index: 100;
    }
    .theme-toggle:hover {
      transform: scale(1.05);
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .login-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
      padding: 40px;
      width: 100%;
      max-width: 440px;
      backdrop-filter: blur(10px);
      position: relative;
    }
    [data-theme="dark"] .login-card {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .brand {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 32px;
    }
    .brand-badge {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      background: linear-gradient(135deg, var(--primary), #a855f7);
      display: grid;
      place-items: center;
      font-weight: 800;
      font-size: 24px;
      color: white;
      margin-bottom: 16px;
      box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);
    }
    h2 {
      margin: 0;
      font-size: 28px;
      font-weight: 800;
      color: var(--text);
    }
    [data-theme="dark"] h2 {
      background: linear-gradient(to right, #fff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p.subtitle {
      margin: 8px 0 0 0;
      color: var(--muted);
      font-size: 15px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: var(--muted);
      font-size: 14px;
    }
    input {
      width: 100%;
      padding: 14px 16px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--input-bg);
      color: var(--text);
      font-family: inherit;
      font-size: 16px;
      transition: all 0.2s;
    }
    input::placeholder {
      color: var(--muted);
      opacity: 0.6;
    }
    input:focus {
      outline: none;
      border-color: var(--primary);
      background: var(--input-focus-bg);
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
    }

    .btn-submit {
      width: 100%;
      padding: 14px;
      margin-top: 12px;
      border: none;
      border-radius: 12px;
      background: var(--primary);
      color: white;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .btn-submit:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
    }
    .btn-submit:active {
      transform: translateY(0);
    }
    .message {
      margin-top: 20px;
      text-align: center;
      font-size: 14px;
      font-weight: 500;
      color: var(--error);
      min-height: 20px;
    }
    @media (max-width: 480px) {
      .login-card {
        padding: 30px 24px;
      }
      h2 { font-size: 24px; }
    }
  </style>
</head>
<body>
  <div class="theme-toggle" id="themeToggle" title="Toggle Theme">
    <svg id="themeIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>
  </div>

  <div class="login-card">
    <div class="brand">
      <div class="brand-badge">QA</div>
      <h2>Admin Portal</h2>
      <p class="subtitle">Enter your credentials to manage quizzes</p>
    </div>
    <form id="loginForm">
      <div class="form-group">
        <label for="username">Username</label>
        <input type="text" id="username" placeholder="Enter admin username" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" placeholder="••••••••" required />
      </div>
      <button type="submit" class="btn-submit">Sign In</button>
      <div id="loginMessage" class="message"></div>
    </form>
  </div>

  <script>
    // Theme Switcher Logic
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;

    const sunIcon = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>';
    const moonIcon = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>';

    function setTheme(theme) {
      html.setAttribute('data-theme', theme);
      localStorage.setItem('admin-theme', theme);
      themeIcon.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
    }

    // Initialize theme
    const savedTheme = localStorage.getItem('admin-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme');
      setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    // Login Form Logic
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;
      const msg = document.getElementById("loginMessage");
      const btn = e.target.querySelector('.btn-submit');
      
      msg.textContent = "";
      btn.disabled = true;
      btn.textContent = "Authenticating...";

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
          btn.disabled = false;
          btn.textContent = "Sign In";
        }
      } catch (err) {
        msg.textContent = "Server connection error.";
        btn.disabled = false;
        btn.textContent = "Sign In";
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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Panel | Quiz Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    :root {
      --primary: #6366f1;
      --primary-dark: #4f46e5;
      --primary-light: #818cf8;
      --sidebar-width: 280px;
      --header-height: 72px;
      --bg: #f8fafc;
      --surface: #ffffff;
      --surface-hover: #f1f5f9;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --radius: 12px;
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
      --sidebar-bg: #0f172a;
    }

    [data-theme="dark"] {
      --bg: #0f172a;
      --surface: #1e293b;
      --surface-hover: #334155;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --border: rgba(255,255,255,0.1);
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.2);
    }

    * { box-sizing: border-box; }
    
    body {
      font-family: "Plus Jakarta Sans", sans-serif;
      background: var(--bg);
      color: var(--text-main);
      margin: 0;
      display: flex;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      transition: background 0.3s ease, color 0.3s ease;
    }

    /* Sidebar Styles */
    .sidebar {
      width: var(--sidebar-width);
      background: var(--sidebar-bg);
      color: white;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      display: flex;
      flex-direction: column;
      z-index: 100;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-right: 1px solid rgba(255,255,255,0.05);
    }

    .sidebar-header {
      padding: 32px 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .sidebar-logo {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--primary), #a855f7);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 20px;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .sidebar-nav {
      flex: 1;
      padding: 12px 16px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: #94a3b8;
      text-decoration: none;
      border-radius: 10px;
      margin-bottom: 4px;
      transition: all 0.2s;
      font-weight: 500;
      font-size: 14.5px;
    }

    .nav-item:hover {
      background: rgba(255,255,255,0.05);
      color: white;
    }

    .nav-item.active {
      background: rgba(99, 102, 241, 0.1);
      color: var(--primary-light);
      position: relative;
    }

    .nav-item.active::after {
      content: '';
      position: absolute;
      left: 0;
      top: 12px;
      bottom: 12px;
      width: 3px;
      background: var(--primary);
      border-radius: 0 4px 4px 0;
    }

    .sidebar-footer {
      padding: 20px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    /* Main Content */
    .main-wrapper {
      margin-left: var(--sidebar-width);
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .header {
      height: var(--header-height);
      background: var(--surface);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 40px;
      position: sticky;
      top: 0;
      z-index: 90;
      transition: background 0.3s ease, border 0.3s ease;
    }
    [data-theme="dark"] .header {
      background: rgba(30, 41, 59, 0.8);
    }

    .header-user {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .content-area {
      padding: 32px;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
    }

    /* UI Components */
    .card {
      background: var(--surface);
      border-radius: 16px;
      border: 1px solid var(--border);
      padding: 32px;
      box-shadow: var(--shadow);
      margin-bottom: 32px;
      transition: box-shadow 0.3s ease;
    }

    .card:hover {
      box-shadow: var(--shadow-lg);
    }

    h2 { font-size: 24px; margin-top: 0; margin-bottom: 24px; font-weight: 700; }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      gap: 8px;
      text-decoration: none;
    }

    .btn-primary { background: var(--primary); color: white; }
    .btn-primary:hover { background: var(--primary-dark); transform: translateY(-1px); }
    
    .btn-danger { background: #ef4444; color: white; }
    .btn-danger:hover { background: #dc2626; }

    .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text-main); }
    .btn-outline:hover { background: var(--surface-hover); }

    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px; color: var(--text-main); }
    
    input, select, textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
      background: #ffffff;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    table th {
      background: #f8fafc;
      padding: 16px 20px;
      text-align: left;
      font-weight: 700;
      font-size: 12px;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    table td {
      padding: 20px;
      border-bottom: 1px solid var(--border);
      font-size: 14px;
      color: var(--text-main);
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
    }

    /* Mobile Styles */
    .mobile-menu-toggle {
      display: none;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--text-main);
    }

    .overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 95;
      backdrop-filter: blur(2px);
    }

    @media (max-width: 1024px) {
      .sidebar {
        transform: translateX(-100%);
      }
      .sidebar.open {
        transform: translateX(0);
      }
      .main-wrapper {
        margin-left: 0;
      }
      .mobile-menu-toggle {
        display: block;
      }
      .overlay.show {
        display: block;
      }
      .content-area {
        padding: 20px;
      }
    }

    @media (max-width: 640px) {
      .header { padding: 0 16px; }
      .header-user span { display: none; }
      .stat-grid { grid-template-columns: 1fr ! from 1fr 1fr; }
    }

    /* Custom Styles for existing elements */
    .message { margin: 16px 0; padding: 12px 16px; border-radius: var(--radius); font-size: 14px; font-weight: 500; }
    .success { background: #dcfce7; color: #166534; border: 1px solid #bcf0da; }
    .error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
    
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 40px; }
    .stat-card { 
      background: white; 
      padding: 28px; 
      border-radius: 20px; 
      border: 1px solid var(--border); 
      box-shadow: var(--shadow);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }
    [data-theme="dark"] .stat-card {
      background: var(--bg);
    }
    .stat-card h3 { margin: 0 0 12px 0; color: var(--text-muted); font-size: 14px; font-weight: 600; }
    .stat-card p { margin: 0; font-size: 32px; font-weight: 800; color: var(--text-main); letter-spacing: -0.02em; }
    .stat-card .trend { font-size: 12px; margin-top: 8px; font-weight: 600; display: flex; align-items: center; gap: 4px; }
    .trend-up { color: #10b981; }

    .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); }
    .modal-content { background: var(--surface); margin: 50px auto; padding: 32px; border-radius: 16px; width: 90%; max-width: 600px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
    .close { float: right; font-size: 24px; font-weight: bold; cursor: pointer; color: var(--text-muted); }
    
    .btn-edit { background: #3b82f6; color: white; padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 13px; margin-right: 4px; }
    .btn-delete { background: #ef4444; color: white; padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 13px; }

    /* Sticky fixes */
    .actions-cell { display: flex; gap: 8px; }


  </style>
</head>
<body>
  <div class="overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>
  
  <aside class="sidebar" id="mainSidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">Q</div>
      <div style="font-weight: 700; font-size: 18px;">Admin Panel</div>
    </div>
    
    <nav class="sidebar-nav">
      <a href="/admin/overview" class="nav-item ${activeTab === 'overview' ? 'active' : ''}">
        <i data-lucide="layout-dashboard" style="width: 18px; height: 18px;"></i>
        <span>Overview</span>
      </a>
      <a href="/admin/contestants" class="nav-item ${activeTab === 'contestants' ? 'active' : ''}">
        <i data-lucide="users" style="width: 18px; height: 18px;"></i>
        <span>Contestants</span>
      </a>
      <a href="/admin/questions" class="nav-item ${activeTab === 'questions' ? 'active' : ''}">
        <i data-lucide="help-circle" style="width: 18px; height: 18px;"></i>
        <span>Questions</span>
      </a>
      <a href="/admin/results" class="nav-item ${activeTab === 'results' ? 'active' : ''}">
        <i data-lucide="award" style="width: 18px; height: 18px;"></i>
        <span>Results</span>
      </a>
      <a href="/admin/recordings" class="nav-item ${activeTab === 'recordings' ? 'active' : ''}">
        <i data-lucide="video" style="width: 18px; height: 18px;"></i>
        <span>Recordings</span>
      </a>
      <a href="/admin/classes" class="nav-item superadmin-only ${activeTab === 'classes' ? 'active' : ''}" style="display: none;">
        <i data-lucide="layers" style="width: 18px; height: 18px;"></i>
        <span>Classes</span>
      </a>
    </nav>
    
    <div class="sidebar-footer">
      <button class="btn btn-danger" style="width: 100%; gap: 10px;" onclick="logoutAdmin()">
        <i data-lucide="log-out" style="width: 16px; height: 16px;"></i>
        Logout
      </button>
    </div>
  </aside>

  <div class="main-wrapper">
    <header class="header">
      <button class="mobile-menu-toggle" onclick="toggleSidebar()">☰</button>
      <div class="header-title" style="font-weight: 600; font-size: 18px;">
        ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
      </div>
      <div class="header-user" style="display: flex; align-items: center; gap: 16px;">
        <button id="themeToggle" class="btn btn-outline" style="padding: 8px; border-radius: 10px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;" title="Toggle Theme">
          <i id="themeIcon" data-lucide="moon" style="width: 18px; height: 18px;"></i>
        </button>
        <span id="adminUsername" style="font-size: 14px; font-weight: 500; color: var(--text-muted);"></span>
        <a href="/admin/add" class="btn btn-primary btn-sm superadmin-only" id="addAdminBtn" style="display: none; padding: 6px 12px; font-size: 12px;">Add Admin</a>
      </div>
    </header>

    <main class="content-area">
      ${content}
    </main>
  </div>

  <!-- Custom Confirmation Modal -->
  <div id="confirmModal" class="modal" style="display: none; align-items: center; justify-content: center; z-index: 2000;">
    <div class="modal-content" style="max-width: 400px; padding: 24px; text-align: center;">
      <div id="confirmIcon" style="margin-bottom: 16px; font-size: 48px;">⚠️</div>
      <h3 id="confirmTitle" style="margin-bottom: 8px;">Are you sure?</h3>
      <p id="confirmMessage" style="color: var(--text-muted); margin-bottom: 24px;">This action cannot be undone.</p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button class="btn btn-outline" id="confirmCancelBtn" style="flex: 1;">Cancel</button>
        <button class="btn btn-danger" id="confirmOkBtn" style="flex: 1;">Yes, Proceed</button>
      </div>
    </div>
  </div>

  <script>
    function toggleSidebar() {
      const sidebar = document.getElementById('mainSidebar');
      const overlay = document.getElementById('sidebarOverlay');
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    }

    // Load admin data on page load
    // Theme logic
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;

    function setTheme(theme) {
      html.setAttribute('data-theme', theme);
      localStorage.setItem('admin-theme', theme);
      if (themeIcon) {
        themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }

    const savedTheme = localStorage.getItem('admin-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
      });
    }

    window.addEventListener('load', async () => {
      await checkUserRole();
      await loadClasses();
      applyClassRestrictions();
      if (window.loadPageData) {
        await loadPageData();
      }
      attachEventListeners();
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    });

    // Check user role
    async function checkUserRole() {
      try {
        const res = await fetch('/admin/role');
        const data = await res.json();
        
        document.getElementById('adminUsername').textContent = data.username;
        window.isSuperadmin = data.role === 'superadmin';
        window.allowedClasses = Array.isArray(data.allowedClasses) ? data.allowedClasses : [];
        
        if (window.isSuperadmin) {
          const addAdminBtn = document.getElementById('addAdminBtn');
          if (addAdminBtn) addAdminBtn.style.display = 'inline-flex';
          
          document.querySelectorAll('.superadmin-only').forEach(el => {
            el.style.display = (el.tagName === 'A' || el.tagName === 'BUTTON') ? 'inline-flex' : 'block';
            el.classList.add('show');
          });
        }
      } catch (err) {
        console.error('Failed to check role:', err);
      }
    }

    // Load classes for dropdowns/checkboxes
    async function loadClasses() {
      try {
        const res = await fetch('/admin/classes/data', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') return;
        
        const classes = data.classes || [];
        window.loadedClasses = classes;
        renderClassOptions(classes);
        renderClassCheckboxes(classes);
      } catch (err) {
        console.error('Error loading classes:', err);
      }
    }

    function renderClassOptions(classList) {
      const selectIds = ['contestantClass', 'questionClass', 'editContestantClass', 'editQuestionClass'];
      selectIds.forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        const currentVal = sel.value;
        sel.innerHTML = '<option value="">Select a class</option>' + classList.map(c => \`<option value="\${c}">\${c}</option>\`).join('');
        if (currentVal) sel.value = currentVal;
      });
    }

    function renderClassCheckboxes(classList) {
      const box = document.getElementById('classCheckboxes');
      if (!box) return;
      box.innerHTML = classList.map(c => \`
    <label style="display:flex; align-items:center; gap:8px; white-space: nowrap; padding: 8px 12px; background: var(--surface-hover); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; color: var(--text-main);">
      <input type="checkbox" class="admin-class-checkbox" value="\${c}" style="width: auto; margin: 0;" /> \${c}
        </label>\`).join('');
    }

    function applyClassRestrictions() {
      if (window.isSuperadmin) return;
      const allowed = window.allowedClasses || [];
      ['contestantClass', 'questionClass'].forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        Array.from(select.options).forEach(opt => {
          if (!opt.value) return;
          opt.disabled = allowed.length > 0 && !allowed.includes(opt.value);
        });
      });
    }

    function attachEventListeners() {
      ${getEventListenersScript(activeTab)}
    }

    function showConfirm(title, message, icon = '⚠️') {
      return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const titleEl = document.getElementById('confirmTitle');
        const msgEl = document.getElementById('confirmMessage');
        const iconEl = document.getElementById('confirmIcon');
        const okBtn = document.getElementById('confirmOkBtn');
        const cancelBtn = document.getElementById('confirmCancelBtn');

        titleEl.textContent = title;
        msgEl.textContent = message;
        iconEl.textContent = icon;
        modal.style.display = 'flex';

        const cleanup = () => {
          modal.style.display = 'none';
          okBtn.onclick = null;
          cancelBtn.onclick = null;
        };

        okBtn.onclick = () => { cleanup(); resolve(true); };
        cancelBtn.onclick = () => { cleanup(); resolve(false); };
      });
    }

    async function logoutAdmin() {
      const confirmed = await showConfirm('Logout', 'Are you sure you want to end your session?', '🚪');
      if (!confirmed) return;
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
  <div class="stat-grid">
    <div class="stat-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <h3>Total Classes</h3>
        <div style="background: rgba(99, 102, 241, 0.1); padding: 8px; border-radius: 10px; color: var(--primary);">
          <i data-lucide="layers" style="width: 20px; height: 20px;"></i>
        </div>
      </div>
      <p id="totalClasses">0</p>
      <div class="trend trend-up">
        <i data-lucide="trending-up" style="width: 14px; height: 14px;"></i>
        <span>Active sessions</span>
      </div>
    </div>
    <div class="stat-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <h3>Total Contestants</h3>
        <div style="background: rgba(16, 185, 129, 0.1); padding: 8px; border-radius: 10px; color: #10b981;">
          <i data-lucide="users" style="width: 20px; height: 20px;"></i>
        </div>
      </div>
      <p id="totalContestants">0</p>
      <div class="trend trend-up">
        <i data-lucide="trending-up" style="width: 14px; height: 14px;"></i>
        <span>New registrations</span>
      </div>
    </div>
    <div class="stat-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <h3>Total Questions</h3>
        <div style="background: rgba(245, 158, 11, 0.1); padding: 8px; border-radius: 10px; color: #f59e0b;">
          <i data-lucide="help-circle" style="width: 20px; height: 20px;"></i>
        </div>
      </div>
      <p id="totalQuestions">0</p>
      <div class="trend trend-up">
        <i data-lucide="plus" style="width: 14px; height: 14px;"></i>
        <span>Resource bank</span>
      </div>
    </div>
    <div class="stat-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <h3>Total Results</h3>
        <div style="background: rgba(239, 68, 68, 0.1); padding: 8px; border-radius: 10px; color: #ef4444;">
          <i data-lucide="award" style="width: 20px; height: 20px;"></i>
        </div>
      </div>
      <p id="totalResults">0</p>
      <div class="trend trend-up">
        <i data-lucide="check-circle" style="width: 14px; height: 14px;"></i>
        <span>Completed quizzes</span>
      </div>
    </div>
  </div>

  <div class="card">
    <h3>Quick Actions</h3>
    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
      <a href="/admin/contestants" class="btn btn-outline">Manage Contestants</a>
      <a href="/admin/questions" class="btn btn-outline">Manage Questions</a>
      <a href="/admin/results" class="btn btn-outline">View Results</a>
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
  <div class="card">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
      <div style="background: rgba(99, 102, 241, 0.1); padding: 8px; border-radius: 10px; color: var(--primary);">
        <i data-lucide="user-plus" style="width: 20px; height: 20px;"></i>
      </div>
      <h2 style="margin: 0;">Add New Contestant</h2>
    </div>
    <form id="contestantForm">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px;">
        <div class="form-group">
          <label for="contestantName">Contestant Name</label>
          <input type="text" id="contestantName" required placeholder="Full Name" />
        </div>
        <div class="form-group">
          <label for="contestantUSN">USN</label>
          <input type="text" id="contestantUSN" required placeholder="e.g. TY23BCA001" />
        </div>
        <div class="form-group">
          <label for="contestantClass">Class</label>
          <select id="contestantClass" required>
            <option value="">Select a class</option>
          </select>
        </div>
        <div class="form-group">
          <label for="contestantQuizCode">Quiz Code</label>
          <input type="text" id="contestantQuizCode" required placeholder="e.g. AI-ML-2025" />
        </div>
        <div class="form-group">
          <label for="contestantPassword">Assigned Password</label>
          <input type="text" id="contestantPassword" required placeholder="Contestant login password" />
        </div>
      </div>
      <div style="margin-top: 24px;">
        <button type="submit" class="btn btn-primary">Add Contestant</button>
      </div>
      <div id="contestantMessage" class="message"></div>
    </form>
  </div>
  
  <div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
      <h3 style="margin: 0;">Contestant Directory</h3>
      <div id="contestantsMessage" class="message" style="margin: 0;"></div>
    </div>
    
    <div style="overflow-x: auto;">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>USN</th>
            <th>Class</th>
            <th>Quiz Code</th>
            <th>Password</th>
            <th style="width: 150px;">Actions</th>
          </tr>
        </thead>
        <tbody id="contestantsBody">
          <tr><td colspan="6" style="padding: 24px; text-align: center; color: var(--text-muted);">Loading contestants...</td></tr>
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
        <button type="submit" class="btn btn-primary" style="width: 100%;">Update Contestant</button>
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
          return \`<tr data-id="\${c._id}">
            <td>\${c.name || '-'}</td>
            <td>\${c.usn || '-'}</td>
            <td>\${c.className || '-'}</td>
            <td>\${c.quizCode || '-'}</td>
            <td>\${c.quizPassword ? '••••••' : '-'}</td>
            <td>
              <div class="actions-cell">
                <button class="btn-edit" onclick="openEditContestantModal('\${c._id}', '\${(c.name || '').replace(/'/g, "\\\\'")}', '\${c.usn || ''}', '\${c.className || ''}', '\${c.quizCode || ''}', '\${c.quizPassword || ''}')">Edit</button>
                <button class="btn-delete" onclick="deleteContestant('\${c._id}')">Delete</button>
              </div>
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
      const confirmed = await showConfirm('Delete Contestant', 'Are you sure you want to remove this contestant?');
      if (!confirmed) return;
      
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
  <div class="card">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
      <div style="background: rgba(99, 102, 241, 0.1); padding: 8px; border-radius: 10px; color: var(--primary);">
        <i data-lucide="help-circle" style="width: 20px; height: 20px;"></i>
      </div>
      <h2 style="margin: 0;">Add New Question</h2>
    </div>
    <form id="questionForm">
      <div class="form-group">
        <label for="questionText">Question Text</label>
        <textarea id="questionText" rows="3" required placeholder="Enter your question here..."></textarea>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px;">
        <div class="form-group">
          <label for="questionQuizCode">Quiz Code</label>
          <input type="text" id="questionQuizCode" required placeholder="e.g. AI-ML-2025" />
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
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
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

      <div style="margin-top: 24px;">
        <button type="submit" class="btn btn-primary">Add Question</button>
      </div>
      <div id="questionMessage" class="message"></div>
    </form>
  </div>
  
  <div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
      <h3 style="margin: 0;">Question Bank</h3>
      <div id="questionsMessage" class="message" style="margin: 0;"></div>
    </div>
    
    <div style="overflow-x: auto;">
      <table>
        <thead>
          <tr>
            <th>Question</th>
            <th>Class</th>
            <th>Quiz Code</th>
            <th>Correct Answer</th>
            <th style="width: 150px;">Actions</th>
          </tr>
        </thead>
        <tbody id="questionsBody">
          <tr><td colspan="5" style="padding: 24px; text-align: center; color: var(--text-muted);">Loading questions...</td></tr>
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
          <label>Options</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <input type="text" id="editOption1" required />
            <input type="text" id="editOption2" required />
            <input type="text" id="editOption3" required />
            <input type="text" id="editOption4" required />
          </div>
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
        <button type="submit" class="btn btn-primary" style="width: 100%;">Update Question</button>
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
            <td>\${q.correctAnswer || '-'}</td>
            <td>
              <div class="actions-cell">
                <button class="btn-edit" onclick="OpenEditQuestionModal('\${q._id}', '\${(q.questionText || '').replace(/'/g, "\\\\'")}', '\${q.className || ''}', '\${q.quizCode || ''}', \${JSON.stringify(q.options || [])}, '\${(q.correctAnswer || '').replace(/'/g, "\\\\'")}')">Edit</button>
                <button class="btn-delete" onclick="deleteQuestion('\${q._id}')">Delete</button>
              </div>
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
      const confirmed = await showConfirm('Delete Question', 'Are you sure you want to remove this question?');
      if (!confirmed) return;
      
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
  <div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
      <h2 style="margin: 0;">Quiz Results</h2>
      <div id="resultsMessage" class="message" style="margin: 0;"></div>
    </div>
    
    <div style="overflow-x: auto;">
      <table>
        <thead>
          <tr>
            <th>Candidate</th>
            <th>USN</th>
            <th>Class</th>
            <th>Score</th>
            <th>Submitted At</th>
            <th style="width: 100px;">Actions</th>
          </tr>
        </thead>
        <tbody id="resultsBody">
          <tr><td colspan="6" style="padding: 24px; text-align: center; color: var(--text-muted);">Loading results...</td></tr>
        </tbody>
      </table>
    </div>
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
            <td>\${r.name || '-'}</td>
            <td>\${r.usn || '-'}</td>
            <td>\${r.className || '-'}</td>
            <td><span class="status-badge" style="background:#f1f5f9; color:var(--primary); text-align: center; display: inline-block; width: 30px;">\${r.score ?? '-'}</span></td>
            <td style="font-size:13px; color:var(--text-muted);">\${date}</td>
            <td>
              <button class="btn btn-danger btn-sm delete-result-btn" data-id="\${r._id}" style="padding: 6px 10px; font-size: 12px;">Delete</button>
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

export const recordingsContent = `
  <div class="card" style="margin-bottom:16px">
    <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
      <div style="flex:1; min-width:300px; position:relative">
        <i data-lucide="search" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); width:16px; color:var(--text-muted)"></i>
        <input id="recFilter" type="text" placeholder="Search by USN, Name or Quiz Code..." style="padding:12px 12px 12px 36px; border:1px solid var(--border); border-radius:8px; width:100%;" />
      </div>
      <button onclick="loadPageData()" class="btn btn-outline"><i data-lucide="refresh-cw"></i> Refresh</button>
    </div>
  </div>

  <div class="card">
    <div id="recMessage" class="message"></div>
    <div style="overflow-x: auto;">
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
          <tr><td colspan="8" style="padding:32px; text-align:center; color: var(--text-muted);">Loading proctor logs...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div id="playerModal" class="modal" style="display:none; align-items:center; justify-content:center;">
    <div class="modal-content" style="max-width:960px; width:95%; position:relative; background:#1e293b; color:white;">
      <span class="close" onclick="closePlayer()" style="color:white; opacity:0.8;">&times;</span>
      <h3 id="playerTitle" style="margin-top:0; margin-bottom:20px; display:flex; align-items:center; gap:10px"></h3>
      <video id="proctorPlayer" controls playsinline style="width:100%; border-radius:12px; background:black; max-height:70vh;"></video>
      <div id="playerMeta" style="margin-top:16px; color:#94a3b8; font-size:14px; display:flex; justify-content:space-between; align-items:center;"></div>
    </div>
  </div>

  <div id="malpModal" class="modal" style="display:none; align-items:center; justify-content:center;">
    <div class="modal-content" style="max-width:600px; width:95%; max-height:85vh; overflow-y:auto">
      <span class="close" onclick="closeMalpModal()">&times;</span>
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px">
        <h3 style="margin:0">Malpractice Log</h3>
      </div>
      <div id="malpList" style="display:flex; flex-direction:column; gap:12px;"></div>
      <div id="malpEmpty" style="display:none; text-align:center; padding:48px; color:var(--text-muted);">No incidents recorded.</div>
    </div>
  </div>

  <style>
    .malp-badge { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:20px; font-size:12px; font-weight:700; }
    .malp-yes { background:#fef2f2; color:#ef4444; border:1px solid #fee2e2; }
    .malp-no  { background:#ecfdf5; color:#10b981; border:1px solid #d1fae5; }
    .rec-action-btn { background:none; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px; }
    .rec-action-btn:hover { background: rgba(0,0,0,0.05); }
  </style>

  <script>
    let allRecordings = [];

    async function loadPageData() {
      const body = document.getElementById('recBody');
      const msg  = document.getElementById('recMessage');
      msg.textContent = '';
      body.innerHTML  = '<tr><td colspan="8" style="padding:16px; text-align:center;">Loading…</td></tr>';
      try {
        const res  = await fetch('/api/proctor/list', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Failed');
        allRecordings = data.recordings || [];
        renderTable(allRecordings);
      } catch (err) {
        msg.className   = 'message error';
        msg.textContent = 'Error loading recordings: ' + err.message;
        body.innerHTML  = '<tr><td colspan="8" style="padding:16px; text-align:center;">Failed to load</td></tr>';
      }
    }

    function renderTable(rows) {
      const body = document.getElementById('recBody');
      if (!rows.length) {
        body.innerHTML = '<tr><td colspan="8" style="padding:32px; text-align:center; color:#64748b;">No recordings found yet. Recordings appear here after students attempt a quiz.</td></tr>';
        return;
      }
      body.innerHTML = rows.map(r => {
        const dt     = new Date(r.recordedAt).toLocaleString();
        const malp   = r.malpracticeDetected
          ? \`<div style="display:flex;flex-direction:column;gap:4px;align-items:flex-start;">
               <span class="malp-badge malp-yes">⚠️ \${r.malpracticeCount} event\${r.malpracticeCount !== 1 ? 's' : ''}</span>
               <button class="rec-action-btn" style="color:#991b1b; text-decoration:underline;" 
                       onclick="viewMalp('\${r.filename}')">Details</button>
             </div>\`
          : '<span class="malp-badge malp-no">✓ Clean</span>';
        const score  = r.quizScore !== null ? r.quizScore : '—';
        return \`<tr>
          <td style="font-weight:600">\${r.contestantName || '—'}</td>
          <td><code>\${r.contestantId}</code></td>
          <td><code>\${r.quizId}</code></td>
          <td style="white-space:nowrap; font-size:13px; color:var(--text-muted);">\${dt}</td>
          <td>\${r.sizeMB} MB</td>
          <td><span class="status-badge" style="background:#f1f5f9; color:var(--primary);">\${score}</span></td>
          <td>\${malp}</td>
          <td style="text-align:right;">
            <div style="display:flex; gap:8px; justify-content:flex-end;">
              <button class="btn btn-outline btn-sm" onclick="openPlayer('\${r.filename}', '\${(r.contestantName || '—').replace(/'/g, "\\\\'")}')" style="padding:6px 10px;">Play</button>
              <a href="/api/proctor/download/\${encodeURIComponent(r.filename)}" download class="btn btn-outline btn-sm" style="padding:6px 10px; text-decoration:none;">Get</a>
              <button class="btn btn-danger btn-sm" onclick="deleteRec('\${r.filename}')" style="padding:6px 10px;">Del</button>
            </div>
          </td>
        </tr>\`;
      }).join('');
    }

    document.getElementById('recFilter')?.addEventListener('input', function() {
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
          
          return \`<div style="background:\${bg}; border-left:4px solid \${color}; padding:12px; border-radius:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <strong style="color:\${color}; font-size:13px; text-transform:uppercase;">\${ev.type.replace(/_/g, ' ')}</strong>
              <span style="font-size:11px; color:#64748b;">\${time}</span>
            </div>
            <p style="margin:0; font-size:13px; color:#334155; line-height:1.4;">\${ev.description || 'No description available.'}</p>
          </div>\`;
        }).join('');
      }
      modal.style.display = 'flex';
    }

    function closeMalpModal() {
      document.getElementById('malpModal').style.display = 'none';
    }

    async function deleteRec(filename) {
      const confirmed = await showConfirm('Delete Recording', 'Are you sure you want to delete this recording?');
      if (!confirmed) return;
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

export const classesContent = `
  <div class="card">
    <h2>Manage Classes</h2>
    <div id="classesMessage" class="message"></div>
    <form id="addClassForm" style="display: flex; gap: 12px; align-items: flex-end; margin-bottom: 32px;">
      <div class="form-group" style="margin-bottom: 0; flex: 1;">
        <label for="newClassName">New Class Name</label>
        <input type="text" id="newClassName" placeholder="e.g. BCA-IV" required />
      </div>
      <button type="submit" class="btn btn-primary">Add Class</button>
    </form>

    <div style="overflow-x: auto;">
      <table>
        <thead>
          <tr>
            <th>Class Name</th>
            <th>Settings & Actions</th>
          </tr>
        </thead>
        <tbody id="classesTableBody">
          <tr><td colspan="2" style="padding: 24px; text-align: center; color: var(--text-muted);">Loading classes...</td></tr>
        </tbody>
      </table>
    </div>
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
            <td>
              <strong>\${c}</strong>
            </td>
            <td>
              <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
                <div style="display:flex; gap:8px; align-items:center;">
                  <label style="margin:0; font-size:13px; color:var(--text-muted);">Quiz Duration:</label>
                  <input type="number" id="quizTime-\${c}" value="\${minutes}" min="1" max="60" style="width:70px; padding:6px; border:1px solid #ddd; border-radius:6px;" />
                  <span style="font-size:13px; color:var(--text-muted);">min</span>
                  <button data-class="\${c}" class="btn btn-primary btn-sm save-time-btn" style="padding: 6px 12px; font-size: 12px;">Save</button>
                </div>
                <button data-class="\${c}" class="btn btn-danger btn-sm delete-class-btn" style="padding: 6px 12px; font-size: 12px;">Delete Class</button>
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
            const confirmed = await showConfirm('Delete Class', 'Delete class ' + cls + '? This does not remove existing data but will hide it from admins.', '🗑️');
            if (!confirmed) return;
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
  <div style="margin-bottom: 24px;">
    <a href="/admin/overview" class="btn btn-outline">← Back to Overview</a>
  </div>
  
  <div class="card" style="max-width: 600px;">
    <h2>Add New Admin</h2>
    <form id="addAdminForm">
      <div class="form-group">
        <label for="newAdminUsername">Username</label>
        <input type="text" id="newAdminUsername" required placeholder="Choose a username" />
      </div>
      <div class="form-group">
        <label for="newAdminPassword">Password</label>
        <input type="password" id="newAdminPassword" required placeholder="Choose a secure password" />
      </div>
      <div class="form-group">
        <label>Permitted Classes</label>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">Select which classes this admin can manage.</p>
        <div id="classCheckboxes" style="display: flex; gap: 12px; flex-wrap: wrap; padding: 4px 0;"></div>
      </div>
      <div style="margin-top: 12px;">
        <button type="submit" class="btn btn-primary" style="width: 100%;">Create Admin Account</button>
      </div>
      <div id="addAdminMessage" class="message"></div>
    </form>
  </div>

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
      const btn = e.target.querySelector('button');
      
      msg.textContent = '';
      if (classes.length === 0) {
        msg.className = 'message error';
        msg.textContent = 'Select at least one class';
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Creating...';

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
          msg.textContent = 'Server returned invalid response.';
          btn.disabled = false;
          btn.textContent = 'Create Admin Account';
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
      } finally {
        btn.disabled = false;
        btn.textContent = 'Create Admin Account';
      }
    }
  </script>
`;

