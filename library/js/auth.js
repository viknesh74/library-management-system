// ════════════════════════════════════════
// Smart Library – Authentication Screens
// ════════════════════════════════════════

// ── Splash Screen ─────────────────────
function renderSplash() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="splash-screen">
      <div class="splash-content">
        <div class="splash-logo animate-bounce-in">
          <div class="logo-icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="64" height="64" rx="16" fill="url(#logoGrad)"/>
              <path d="M16 48V18a2 2 0 012-2h8v32H18a2 2 0 01-2-2z" fill="white" opacity="0.9"/>
              <path d="M28 48V20h18a2 2 0 012 2v24a2 2 0 01-2 2H28z" fill="white" opacity="0.7"/>
              <path d="M22 22h2v20h-2z" fill="#2F80ED"/>
              <path d="M32 24h10v2H32zM32 30h10v2H32zM32 36h8v2h-8z" fill="#2F80ED"/>
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="64" y2="64">
                  <stop offset="0%" stop-color="#2F80ED"/>
                  <stop offset="100%" stop-color="#1565C0"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        <h1 class="splash-title animate-fade-in-up">Smart Library</h1>
        <p class="splash-subtitle animate-fade-in-up delay-1">Your Digital College Library</p>
        <div class="splash-loader animate-fade-in-up delay-2">
          <div class="loader-bar"><div class="loader-fill"></div></div>
        </div>
      </div>
      <div class="splash-footer animate-fade-in-up delay-3">
        <p>Powered by Smart Library v1.0</p>
      </div>
    </div>`;

  // Auto-navigate after 2.8s
  setTimeout(async () => {
    const user = DB.getCurrentUser();
    if (user) {
      await DB.init();
      Router.navigate(user.role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
    } else {
      Router.navigate('login');
    }
  }, 2800);
}

// ── Login Screen ──────────────────────
function renderLogin(params = {}) {
  const app = document.getElementById('app');
  const role = params.role || 'student';
  app.innerHTML = `
    <div class="auth-screen">
      <div class="auth-header">
        <div class="auth-logo">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
            <rect width="64" height="64" rx="14" fill="url(#lg2)"/>
            <path d="M16 48V18a2 2 0 012-2h8v32H18a2 2 0 01-2-2z" fill="white" opacity="0.9"/>
            <path d="M28 48V20h18a2 2 0 012 2v24a2 2 0 01-2 2H28z" fill="white" opacity="0.7"/>
            <path d="M22 22h2v20h-2z" fill="#2F80ED"/>
            <path d="M32 24h10v2H32zM32 30h10v2H32zM32 36h8v2h-8z" fill="#2F80ED"/>
            <defs><linearGradient id="lg2" x1="0" y1="0" x2="64" y2="64"><stop offset="0%" stop-color="#2F80ED"/><stop offset="100%" stop-color="#1565C0"/></linearGradient></defs>
          </svg>
        </div>
        <h1>Welcome Back</h1>
        <p>Sign in to Smart Library</p>
      </div>

      <div class="role-tabs" id="roleTabs">
        <button class="role-tab ${role === 'student' ? 'active' : ''}" data-role="student" id="tabStudent">
          <span>🎓</span> Student
        </button>
        <button class="role-tab ${role === 'admin' ? 'active' : ''}" data-role="admin" id="tabAdmin">
          <span>👨‍💼</span> Librarian
        </button>
      </div>

      <form class="auth-form" id="loginForm" novalidate>
        <div class="form-group">
          <label>Email Address</label>
          <div class="input-wrap">
            <span class="input-icon">✉️</span>
            <input type="email" id="loginEmail" placeholder="Enter your email" autocomplete="email" required/>
          </div>
        </div>
        <div class="form-group">
          <label>Password</label>
          <div class="input-wrap">
            <span class="input-icon">🔒</span>
            <input type="password" id="loginPassword" placeholder="Enter your password" autocomplete="current-password" required/>
            <button type="button" class="eye-btn" id="eyeBtn">👁</button>
          </div>
        </div>
        <div class="form-error" id="loginError"></div>
        <button type="submit" class="btn btn-primary btn-full" id="loginBtn">
          <span>Sign In</span>
          <span class="btn-arrow">→</span>
        </button>
      </form>

      <div class="auth-divider"><span>Don't have an account?</span></div>
      <button class="btn btn-outline btn-full" id="signupLink">Create Student Account</button>

      <div class="demo-creds">
        <p>🔑 Demo Credentials</p>
        <div class="cred-cards">
          <div class="cred-card" id="fillStudent">
            <span class="cred-role">🎓 Student</span>
            <span class="cred-email">student@demo.edu</span>
            <span class="cred-pwd">Student@123</span>
          </div>
          <div class="cred-card" id="fillAdmin">
            <span class="cred-role">👨‍💼 Admin</span>
            <span class="cred-email">admin@library.edu</span>
            <span class="cred-pwd">Admin@123</span>
          </div>
        </div>
      </div>
    </div>`;

  let currentRole = role;

  // Role tabs
  document.getElementById('roleTabs').querySelectorAll('.role-tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentRole = tab.dataset.role;
    };
  });

  // Eye toggle
  document.getElementById('eyeBtn').onclick = () => {
    const inp = document.getElementById('loginPassword');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  };

  // Demo fill
  document.getElementById('fillStudent').onclick = () => {
    document.getElementById('loginEmail').value = 'student@demo.edu';
    document.getElementById('loginPassword').value = 'Student@123';
    document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tabStudent').classList.add('active');
    currentRole = 'student';
  };
  document.getElementById('fillAdmin').onclick = () => {
    document.getElementById('loginEmail').value = 'admin@library.edu';
    document.getElementById('loginPassword').value = 'Admin@123';
    document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tabAdmin').classList.add('active');
    currentRole = 'admin';
  };

  // Signup link
  document.getElementById('signupLink').onclick = () => Router.navigate('signup');

  // Login form
  document.getElementById('loginForm').onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errEl = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');

    btn.classList.add('loading'); btn.disabled = true;
    errEl.textContent = '';

    setTimeout(async () => {
      btn.classList.remove('loading'); btn.disabled = false;

      const result = await DB.loginStudent(email, password);
      if (!result.ok) { errEl.textContent = result.msg; return; }
      
      if (currentRole === 'admin') {
        if (result.user.role !== 'admin') { errEl.textContent = 'Please use the Student tab.'; return; }
        DB.setCurrentUser({ ...result.user, token: result.token });
        await DB.init();
        Router.navigate('admin-dashboard');
      } else {
        if (result.user.role === 'admin') { errEl.textContent = 'Please use the Librarian tab.'; return; }
        DB.setCurrentUser({ ...result.user, token: result.token });
        await DB.init();
        Router.navigate('student-dashboard');
      }
    }, 500);
  };
}

// ── Signup Screen ─────────────────────
function renderSignup() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="auth-screen">
      <div class="auth-header">
        <button class="back-btn inline-back" id="backToLogin">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1>Create Account</h1>
        <p>Register as a new student</p>
      </div>
      <form class="auth-form" id="signupForm" novalidate>
        <div class="form-group">
          <label>Full Name</label>
          <div class="input-wrap"><span class="input-icon">👤</span>
            <input type="text" id="sigName" placeholder="Your full name" required/></div>
        </div>
        <div class="form-group">
          <label>Register Number</label>
          <div class="input-wrap"><span class="input-icon">🆔</span>
            <input type="text" id="sigRegNo" placeholder="e.g. 732224cs223" required/></div>
        </div>
        <div class="form-group">
          <label>Email Address</label>
          <div class="input-wrap"><span class="input-icon">✉️</span>
            <input type="email" id="sigEmail" placeholder="College email address" required/></div>
        </div>
        <div class="form-group">
          <label>Department</label>
          <div class="input-wrap"><span class="input-icon">🏫</span>
            <select id="sigDept">
              <option value="">-- Select Department --</option>
              ${['Computer Science','Electronics','Mechanical','Civil','Electrical','Chemical','BBA','MBA','Law','Medicine','Arts','Commerce'].map(d=>`<option value="${d}">${d}</option>`).join('')}
            </select></div>
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <div class="input-wrap"><span class="input-icon">📱</span>
            <input type="tel" id="sigPhone" placeholder="10-digit mobile number" maxlength="10" inputmode="numeric"/></div>
        </div>
        <div class="form-group">
          <label>Password</label>
          <div class="input-wrap"><span class="input-icon">🔒</span>
            <input type="password" id="sigPass" placeholder="Min 8 chars, 1 uppercase, 1 number" required/>
            <button type="button" class="eye-btn" id="eyeBtn2">👁</button></div>
        </div>
        <div class="form-group">
          <label>Confirm Password</label>
          <div class="input-wrap"><span class="input-icon">🔒</span>
            <input type="password" id="sigConfirm" placeholder="Re-enter password" required/></div>
        </div>
        <div class="form-error" id="signupError"></div>
        <button type="submit" class="btn btn-primary btn-full" id="signupBtn">
          <span>Create Account</span><span class="btn-arrow">→</span>
        </button>
      </form>
      <div class="auth-divider"><span>Already have an account?</span></div>
      <button class="btn btn-outline btn-full" id="loginLink">Sign In</button>
    </div>`;

  document.getElementById('backToLogin').onclick = () => Router.navigate('login');
  document.getElementById('loginLink').onclick = () => Router.navigate('login');
  document.getElementById('eyeBtn2').onclick = () => {
    const inp = document.getElementById('sigPass');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  };

  document.getElementById('signupForm').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('sigName').value.trim();
    const register_number = document.getElementById('sigRegNo').value.trim();
    const email = document.getElementById('sigEmail').value.trim();
    const department = document.getElementById('sigDept').value;
    const phone = document.getElementById('sigPhone').value.trim();
    const password = document.getElementById('sigPass').value;
    const confirm = document.getElementById('sigConfirm').value;
    const errEl = document.getElementById('signupError');
    const btn = document.getElementById('signupBtn');

    errEl.textContent = '';
    if (!name || !register_number || !email || !department || !phone || !password) { errEl.textContent = 'Please fill all fields.'; return; }
    if (!/^[a-zA-Z0-9]+$/.test(register_number)) { errEl.textContent = 'Register Number can only contain letters and numbers.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errEl.textContent = 'Invalid email address.'; return; }
    if (!/^\d{10}$/.test(phone)) { errEl.textContent = 'Phone must be 10 digits.'; return; }
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      errEl.textContent = 'Password: min 8 chars, 1 uppercase, 1 number.'; return;
    }
    if (password !== confirm) { errEl.textContent = 'Passwords do not match.'; return; }

    btn.classList.add('loading'); btn.disabled = true;
    setTimeout(async () => {
      btn.classList.remove('loading'); btn.disabled = false;
      const result = await DB.registerStudent({ name, register_number, email, department, phone, password });
      if (!result.ok) { errEl.textContent = result.msg; return; }
      const loginRes = await DB.loginStudent(email, password);
      if (loginRes.ok) {
        DB.setCurrentUser({ ...loginRes.user, token: loginRes.token });
        await DB.init();
      }
      UI.toast('Account created! Welcome to Smart Library 📚', 'success');
      Router.navigate('student-dashboard');
    }, 500);
  };
}
