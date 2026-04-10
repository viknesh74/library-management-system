// ════════════════════════════════════════
// Smart Library – Admin Screens
// ════════════════════════════════════════

// ── File-type helpers ─────────────────
function _isPdf(p)  { return /\.pdf$/i.test(p); }
function _isDoc(p)  { return /\.(docx?|doc)$/i.test(p); }
function _isImg(p)  { return !_isPdf(p) && !_isDoc(p); }
function _fileThumb(src, w, h, extra='') {
  if (_isPdf(src))  return `<div style="width:${w};height:${h};display:flex;align-items:center;justify-content:center;background:#fff4f4;border-radius:6px;border:1px solid var(--border);font-size:1.6rem;${extra}" title="PDF file">📄</div>`;
  if (_isDoc(src))  return `<div style="width:${w};height:${h};display:flex;align-items:center;justify-content:center;background:#f0f4ff;border-radius:6px;border:1px solid var(--border);font-size:1.6rem;${extra}" title="DOC file">📝</div>`;
  return `<img src="${src}" style="width:${w};height:${h};object-fit:cover;border-radius:6px;border:1px solid var(--border);${extra}" alt="thumb"/>`;
}
function _fileViewer(src) {
  if (_isPdf(src))  return `<embed src="${src}" type="application/pdf" style="width:100%;height:82vh;border-radius:8px;border:none;"/>`;
  if (_isDoc(src))  return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:3rem;"><span style="font-size:4rem;">📝</span><p style="color:#fff;font-size:1.1rem;">DOC/DOCX files cannot be previewed in browser.</p><a href="${src}" download style="background:#2F80ED;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">⬇ Download File</a></div>`;
  return `<img src="${src}" style="max-width:88vw;max-height:82vh;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.6);object-fit:contain;"/>`;
}
// ── Admin Sidebar ─────────────────────
function buildAdminLayout(activeSection, content) {
  const app = document.getElementById('app');
  const nav = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', route: 'admin-dashboard' },
    { id: 'books', icon: '📚', label: 'Manage Books', route: 'admin-books' },
    { id: 'requests', icon: '📋', label: 'Requests', route: 'admin-requests' },
    { id: 'transactions', icon: '🔄', label: 'Transactions', route: 'admin-transactions' },
    { id: 'reports', icon: '📈', label: 'Reports', route: 'admin-reports' },
    { id: 'students', icon: '🎓', label: 'Students', route: 'admin-students' },
    { id: 'papers', icon: '📝', label: 'Question Papers', route: 'admin-papers' },
  ];

  app.innerHTML = `
    <div class="admin-layout">
      <div class="admin-sidebar" id="adminSidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <svg viewBox="0 0 40 40" width="36" height="36" fill="none">
              <rect width="40" height="40" rx="10" fill="url(#sg)"/>
              <path d="M8 30V12a1 1 0 011-1h5v19H9a1 1 0 01-1-1z" fill="white" opacity="0.9"/>
              <path d="M16 30V13h12a1 1 0 011 1v15a1 1 0 01-1 1H16z" fill="white" opacity="0.7"/>
              <path d="M13 14h1.5v12H13z" fill="#2F80ED"/>
              <path d="M19 15h7v1.5h-7zM19 19h7v1.5h-7zM19 23h5v1.5h-5z" fill="#2F80ED"/>
              <defs><linearGradient id="sg" x1="0" y1="0" x2="40" y2="40"><stop offset="0%" stop-color="#2F80ED"/><stop offset="100%" stop-color="#1565C0"/></linearGradient></defs>
            </svg>
            <span>Smart Library</span>
          </div>
          <button class="sidebar-close" id="sidebarClose">✕</button>
        </div>
        <div class="sidebar-user">
          <div class="su-avatar">${DB.getCurrentUser()?.name?.charAt(0) || 'A'}</div>
          <div class="su-info">
            <div class="su-name">${DB.getCurrentUser()?.name || 'Admin'}</div>
            <div class="su-role">👨‍💼 Librarian</div>
          </div>
        </div>
        <nav class="sidebar-nav">
          ${nav.map(n => `
            <button class="sidebar-item ${activeSection === n.id ? 'active' : ''}" data-route="${n.route}">
              <span class="si-icon">${n.icon}</span>
              <span>${n.label}</span>
            </button>`).join('')}
        </nav>
        <div class="sidebar-footer">
          <button class="sidebar-item" id="adminDarkMode">
            <span class="si-icon">${DB.getDarkMode() ? '☀️' : '🌙'}</span>
            <span>${DB.getDarkMode() ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button class="sidebar-item sidebar-logout" id="adminLogout">
            <span class="si-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
      <div class="admin-main" id="adminMain">
        <div class="admin-topbar">
          <button class="menu-btn" id="menuBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
          <div class="topbar-pending" id="topbarPending"></div>
          <div class="topbar-user">Admin Panel</div>
        </div>
        <div class="admin-content" id="adminContent">${content}</div>
      </div>
      <div class="sidebar-overlay" id="sidebarOverlay"></div>
    </div>`;

  // Sidebar events
  document.getElementById('menuBtn').onclick = () => {
    document.getElementById('adminSidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('show');
  };
  document.getElementById('sidebarClose').onclick = closeSidebar;
  document.getElementById('sidebarOverlay').onclick = closeSidebar;
  function closeSidebar() {
    document.getElementById('adminSidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('show');
  }

  document.querySelectorAll('.sidebar-item[data-route]').forEach(btn => {
    btn.onclick = () => Router.navigate(btn.dataset.route);
  });

  document.getElementById('adminDarkMode').onclick = () => {
    DB.setDarkMode(!DB.getDarkMode());
    Router.navigate(Router.currentRoute.name);
  };
  document.getElementById('adminLogout').onclick = () => {
    UI.confirm('Logout', 'Are you sure you want to logout?', () => {
      DB.logout();
      Router.navigate('login');
      UI.toast('Logged out successfully.', 'info');
    });
  };

  // Pending badge
  const pending = DB.getPendingRequests().length;
  if (pending) {
    document.getElementById('topbarPending').innerHTML = `
      <div class="pending-alert" onclick="Router.navigate('admin-requests')">
        📋 ${pending} pending request${pending > 1 ? 's' : ''}
      </div>`;
  }
}

// ── Admin Dashboard ────────────────────
function renderAdminDashboard() {
  DB.updateOverdueStatuses();
  const stats = DB.getStats();
  const recentTx = [...DB.getTransactions()].reverse().slice(0, 5);
  const pending = DB.getPendingRequests();
  const books = DB.getBooks();
  const topBooks = books.sort((a, b) => (b.total_copies - b.available_copies) - (a.total_copies - a.available_copies)).slice(0, 5);

  buildAdminLayout('dashboard', `
    <div class="admin-page">
      <div class="admin-page-header">
        <h1>Dashboard</h1>
        <p>Overview of library activity</p>
      </div>

      <div class="stats-grid">
        <div class="stat-tile stat-blue" id="goToBooks">
          <div class="stile-icon">📚</div>
          <div class="stile-val">${stats.totalBooks}</div>
          <div class="stile-label">Total Books</div>
          <div class="stile-sub">${stats.totalcopies} copies</div>
        </div>
        <div class="stat-tile stat-green" id="goToIssued">
          <div class="stile-icon">📖</div>
          <div class="stile-val">${stats.issuedBooks}</div>
          <div class="stile-label">Issued Books</div>
          <div class="stile-sub">Currently out</div>
        </div>
        <div class="stat-tile stat-red" id="goToOverdue">
          <div class="stile-icon">⚠️</div>
          <div class="stile-val">${stats.overdueBooks}</div>
          <div class="stile-label">Overdue</div>
          <div class="stile-sub">Need return</div>
        </div>
        <div class="stat-tile stat-purple" id="goToStudents">
          <div class="stile-icon">🎓</div>
          <div class="stile-val">${stats.totalStudents}</div>
          <div class="stile-label">Students</div>
          <div class="stile-sub">Registered</div>
        </div>
      </div>

      <div class="admin-quick-actions">
        <button class="aqa-btn" id="aqaAddBook">
          <span>➕</span> Add Book
        </button>
        <button class="aqa-btn aqa-green" id="aqaRequests">
          <span>📋</span> Requests ${pending.length ? `<span class="aqa-badge">${pending.length}</span>` : ''}
        </button>
        <button class="aqa-btn aqa-orange" id="aqaReports">
          <span>📈</span> Reports
        </button>
      </div>

      ${pending.length ? `
      <div class="admin-section">
        <div class="as-header"><h3>Pending Requests</h3><button class="see-all-btn" id="seeAllReq">View all →</button></div>
        <div class="pending-list">
          ${pending.slice(0, 3).map(r => {
            const book = DB.getBookById(r.book_id);
            const students = DB.getStudents();
            const student = students.find(s => s.register_number === r.register_number);
            return `<div class="pending-row">
              <div class="pr-info">
                <div class="pr-book">${book?.title || 'Unknown'}</div>
                <div class="pr-student">👤 ${student?.name || 'Unknown'} • ${UI.fmtDate(r.request_date)}</div>
              </div>
              <div class="pr-actions">
                <button class="icon-btn green-btn" data-reqid="${r.request_id}" data-action="approve" title="Approve">✓</button>
                <button class="icon-btn red-btn" data-reqid="${r.request_id}" data-action="reject" title="Reject">✕</button>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>` : ''}

      <div class="admin-section">
        <div class="as-header"><h3>Recent Transactions</h3><button class="see-all-btn" id="seeAllTx">View all →</button></div>
        <div class="tx-list">
          ${recentTx.length ? recentTx.map(t => {
            const book = DB.getBookById(t.book_id);
            const student = DB.getStudents().find(s => s.register_number === t.register_number);
            return `<div class="tx-row">
              <div class="tx-info">
                <div class="tx-book">${book?.title || 'Unknown'}</div>
                <div class="tx-student">👤 ${student?.name || 'Unknown'}</div>
                <div class="tx-dates">${UI.fmtDate(t.issue_date)} → ${UI.fmtDate(t.return_date)}</div>
              </div>
              ${UI.statusBadge(t.status)}
            </div>`;
          }).join('') : `<div class="no-data">No transactions yet.</div>`}
        </div>
      </div>

      <div class="chart-grid">
        <div class="chart-section">
          <h3>📊 Book Status</h3>
          <div class="chart-canvas-wrap"><canvas id="bookStatusChart"></canvas></div>
        </div>
        <div class="chart-section">
          <h3>📈 Transaction Overview</h3>
          <div class="chart-canvas-wrap"><canvas id="txOverviewChart"></canvas></div>
        </div>
      </div>
    </div>`);

  document.getElementById('goToBooks').onclick    = () => Router.navigate('admin-books');
  document.getElementById('goToIssued').onclick   = () => Router.navigate('admin-transactions');
  document.getElementById('goToOverdue').onclick  = () => Router.navigate('admin-transactions');
  document.getElementById('goToStudents').onclick = () => Router.navigate('admin-students');
  document.getElementById('aqaAddBook').onclick   = () => renderAddEditBook(null);
  document.getElementById('aqaRequests').onclick  = () => Router.navigate('admin-requests');
  document.getElementById('aqaReports').onclick   = () => Router.navigate('admin-reports');
  const _sR = document.getElementById('seeAllReq'); if(_sR) _sR.onclick = () => Router.navigate('admin-requests');
  const _sT = document.getElementById('seeAllTx'); if(_sT) _sT.onclick  = () => Router.navigate('admin-transactions');

  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const reqId = btn.dataset.reqid;
      if (btn.dataset.action === 'approve') {
        const result = await DB.approveRequest(reqId);
        UI.toast(result.ok ? '✓ Request approved & book issued!' : result.msg, result.ok ? 'success' : 'error');
      } else {
        await DB.rejectRequest(reqId);
        UI.toast('Request rejected.', 'info');
      }
      renderAdminDashboard();
    };
  });

  // ── Chart.js: Book Status Doughnut ──────────────────
  const isDark   = document.body.classList.contains('dark');
  const txtColor = isDark ? '#94A3B8' : '#64748B';
  Chart.defaults.color = txtColor;
  Chart.defaults.borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const allBooks = DB.getBooks();
  const totalAvail = allBooks.reduce((s, b) => s + b.available_copies, 0);
  const totalIssued = stats.issuedBooks;
  const totalOverdue = stats.overdueBooks;

  new Chart(document.getElementById('bookStatusChart'), {
    type: 'doughnut',
    data: {
      labels: ['Available', 'Issued', 'Overdue'],
      datasets: [{
        data: [Math.max(0, totalAvail - totalOverdue), Math.max(0, totalIssued - totalOverdue), totalOverdue],
        backgroundColor: ['rgba(39,174,96,0.85)', 'rgba(47,128,237,0.85)', 'rgba(235,87,87,0.85)'],
        borderColor: ['#27AE60', '#2F80ED', '#EB5757'],
        borderWidth: 2,
        hoverOffset: 10,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyleWidth: 10 } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}` } },
      },
    },
  });

  // ── Chart.js: Transaction Bar ───────────────────────
  const allTx = DB.getTransactions();
  const txByMonth = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
    txByMonth[key] = { issued: 0, returned: 0 };
  }
  allTx.forEach(t => {
    const d   = new Date(t.issue_date);
    const key = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
    if (txByMonth[key]) {
      txByMonth[key].issued++;
      if (t.status === 'returned') txByMonth[key].returned++;
    }
  });
  const months   = Object.keys(txByMonth);
  const issuedD  = months.map(m => txByMonth[m].issued);
  const returnedD = months.map(m => txByMonth[m].returned);

  new Chart(document.getElementById('txOverviewChart'), {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        { label: 'Issued',   data: issuedD,   backgroundColor: 'rgba(47,128,237,0.75)',  borderColor: '#2F80ED',  borderWidth: 1.5, borderRadius: 6 },
        { label: 'Returned', data: returnedD, backgroundColor: 'rgba(39,174,96,0.75)',  borderColor: '#27AE60',  borderWidth: 1.5, borderRadius: 6 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
      },
    },
  });
}

// ── Admin Books ───────────────────────
function renderAdminBooks() {
  let searchQ = '', selectedCat = 'All';

  function render() {
    const books = DB.searchBooks(searchQ, selectedCat);
    buildAdminLayout('books', `
      <div class="admin-page">
        <div class="admin-page-header">
          <h1>Manage Books</h1>
          <button class="btn btn-primary" id="addBookBtn">➕ Add Book</button>
        </div>
        <div class="admin-search-bar">
          <input type="text" id="adminSearch" placeholder="Search books…" value="${searchQ}"/>
          <select id="adminCatFilter">
            ${['All', ...DB.CATEGORIES].map(c => `<option value="${c}" ${selectedCat === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="results-count">${books.length} book${books.length !== 1 ? 's' : ''}</div>
        <div class="admin-book-grid">
          ${books.length ? books.map(b => `
            <div class="admin-book-card">
              <div class="abc-header">
                <div class="abc-cover" style="background:${bookGradient(b.category)}">${UI.catIcon(b.category)}</div>
                <div class="abc-info">
                  <div class="abc-title">${b.title}</div>
                  <div class="abc-author">${b.author}</div>
                  <div class="abc-cat">${b.category}</div>
                </div>
              </div>
              <div class="abc-stats">
                <span class="${b.available_copies > 0 ? 'badge-green' : 'badge-red'} badge">${b.available_copies}/${b.total_copies} available</span>
              </div>
              <div class="abc-actions">
                <button class="icon-btn blue-btn edit-btn" data-bookid="${b.book_id}" title="Edit">✏️</button>
                <button class="icon-btn green-btn copies-btn" data-bookid="${b.book_id}" title="Manage Copies">📦</button>
                <button class="icon-btn red-btn delete-btn" data-bookid="${b.book_id}" title="Delete">🗑️</button>
              </div>
            </div>`).join('')
          : `<div class="no-data full-width">${UI.emptyState('📚', 'No books found')}</div>`}
        </div>
      </div>`);

    document.getElementById('addBookBtn').onclick = () => renderAddEditBook(null);
    document.getElementById('adminSearch').oninput = (e) => { searchQ = e.target.value; render(); };
    document.getElementById('adminCatFilter').onchange = (e) => { selectedCat = e.target.value; render(); };

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.onclick = () => renderAddEditBook(DB.getBookById(btn.dataset.bookid));
    });
    document.querySelectorAll('.copies-btn').forEach(btn => {
      btn.onclick = () => renderManageCopies(btn.dataset.bookid);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = () => {
        const book = DB.getBookById(btn.dataset.bookid);
        UI.confirm('Delete Book', `Delete "<strong>${book.title}</strong>"? This cannot be undone.`, async () => {
          await DB.deleteBook(btn.dataset.bookid);
          UI.toast('Book deleted.', 'success');
          render();
        });
      };
    });
  }

  render();
}

// ── Add / Edit Book Modal ─────────────
function renderAddEditBook(book) {
  const isEdit = !!book;
  const close = UI.modal({
    title: isEdit ? '✏️ Edit Book' : '➕ Add New Book',
    body: `
      <div class="form-group">
        <label>Book Title *</label>
        <input type="text" id="mTitle" value="${book?.title || ''}" placeholder="Enter book title"/>
      </div>
      <div class="form-group">
        <label>Author *</label>
        <input type="text" id="mAuthor" value="${book?.author || ''}" placeholder="Author name"/>
      </div>
      <div class="form-group">
        <label>Category *</label>
        <select id="mCat">
          ${DB.CATEGORIES.map(c => `<option value="${c}" ${book?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="mDesc" rows="3" placeholder="Short description">${book?.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Total Copies *</label>
        <input type="number" id="mCopies" value="${book?.total_copies || ''}" min="1" max="100" placeholder="Number of copies"/>
      </div>
      <div class="form-error" id="mError"></div>`,
    actions: [
      { label: 'Cancel', cls: 'btn-outline' },
      {
        label: isEdit ? 'Save Changes' : 'Add Book',
        cls: 'btn-primary',
        fn: async () => {
          const title = document.getElementById('mTitle').value.trim();
          const author = document.getElementById('mAuthor').value.trim();
          const category = document.getElementById('mCat').value;
          const description = document.getElementById('mDesc').value.trim();
          const total_copies = parseInt(document.getElementById('mCopies').value);

          if (!title || !author || !category || !total_copies) {
            UI.toast('Please fill all required fields.', 'error'); return;
          }

          if (isEdit) {
            const diff = total_copies - book.total_copies;
            await DB.updateBook(book.book_id, {
              title, author, category, description, total_copies,
              available_copies: Math.max(0, book.available_copies + diff),
            });
            UI.toast('Book updated successfully! ✓', 'success');
          } else {
            await DB.addBook({ title, author, category, description, total_copies });
            UI.toast('Book added successfully! 📚', 'success');
          }
          Router.navigate('admin-books');
        },
      },
    ],
  });
}

// ── Manage Copies Modal ───────────────
function renderManageCopies(book_id) {
  const book = DB.getBookById(book_id);
  UI.modal({
    title: '📦 Manage Copies',
    body: `
      <p><strong>${book.title}</strong></p>
      <div class="copies-display">
        <div class="cd-item"><div class="cd-val">${book.total_copies}</div><div class="cd-label">Total</div></div>
        <div class="cd-item"><div class="cd-val" style="color:var(--green)">${book.available_copies}</div><div class="cd-label">Available</div></div>
        <div class="cd-item"><div class="cd-val" style="color:var(--blue)">${book.total_copies - book.available_copies}</div><div class="cd-label">Issued</div></div>
      </div>
      <div class="form-group" style="margin-top:1rem">
        <label>Update Total Copies</label>
        <div class="copies-input-row">
          <button class="copies-adj-btn" id="decCopies">−</button>
          <input type="number" id="copiesInput" value="${book.total_copies}" min="${book.total_copies - book.available_copies}" max="200"/>
          <button class="copies-adj-btn" id="incCopies">+</button>
        </div>
      </div>`,
    actions: [
      { label: 'Cancel', cls: 'btn-outline' },
      {
        label: 'Update Copies',
        cls: 'btn-primary',
        fn: async () => {
          const newTotal = parseInt(document.getElementById('copiesInput').value);
          const issued = book.total_copies - book.available_copies;
          if (newTotal < issued) { UI.toast(`Cannot set below issued count (${issued}).`, 'error'); return; }
          await DB.updateBook(book_id, { total_copies: newTotal, available_copies: newTotal - issued });
          UI.toast('Copies updated!', 'success');
          Router.navigate('admin-books');
        },
      },
    ],
  });
  setTimeout(() => {
    document.getElementById('decCopies').onclick = () => {
      const inp = document.getElementById('copiesInput');
      if (parseInt(inp.value) > parseInt(inp.min)) inp.value = parseInt(inp.value) - 1;
    };
    document.getElementById('incCopies').onclick = () => {
      const inp = document.getElementById('copiesInput');
      inp.value = parseInt(inp.value) + 1;
    };
  }, 50);
}

// ── Admin Requests ────────────────────
function renderAdminRequests() {
  let filter = 'pending';

  function render() {
    const allReqs = DB.getRequests().filter(r => filter === 'all' ? true : r.approval_status === filter);
    buildAdminLayout('requests', `
      <div class="admin-page">
        <div class="admin-page-header">
          <h1>Book Requests</h1>
          <p>${DB.getPendingRequests().length} pending</p>
        </div>
        <div class="tab-bar">
          <button class="tab-btn ${filter === 'pending' ? 'active' : ''}" data-filter="pending">Pending</button>
          <button class="tab-btn ${filter === 'approved' ? 'active' : ''}" data-filter="approved">Approved</button>
          <button class="tab-btn ${filter === 'rejected' ? 'active' : ''}" data-filter="rejected">Rejected</button>
          <button class="tab-btn ${filter === 'all' ? 'active' : ''}" data-filter="all">All</button>
        </div>
        <div class="request-list">
          ${allReqs.length ? [...allReqs].reverse().map(r => {
            const book = DB.getBookById(r.book_id);
            const student = DB.getStudents().find(s => s.register_number === r.register_number);
            return `<div class="request-card">
              <div class="rc-header">
                <div class="rc-icon" style="background:${bookGradient(book?.category)}">${UI.catIcon(book?.category)}</div>
                <div class="rc-info">
                  <div class="rc-title">${book?.title || 'Unknown'}</div>
                  <div class="rc-student">👤 ${student?.name || 'Unknown'} — ${student?.department || ''}</div>
                  <div class="rc-date">Requested: ${UI.fmtDate(r.request_date)}</div>
                </div>
                ${UI.statusBadge(r.approval_status)}
              </div>
              <div class="rc-book-avail">
                ${UI.availBadge(book?.available_copies || 0, book?.total_copies || 0)}
              </div>
              ${r.approval_status === 'pending' ? `
              <div class="rc-actions">
                <button class="btn btn-primary btn-sm approve-btn" data-reqid="${r.request_id}">✓ Approve & Issue</button>
                <button class="btn btn-danger btn-sm reject-btn" data-reqid="${r.request_id}">✕ Reject</button>
              </div>` : ''}
            </div>`;
          }).join('') : UI.emptyState('📋', `No ${filter} requests`)}
        </div>
      </div>`);

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = () => { filter = btn.dataset.filter; render(); };
    });
    document.querySelectorAll('.approve-btn').forEach(btn => {
      btn.onclick = async () => {
        const result = await DB.approveRequest(btn.dataset.reqid);
        UI.toast(result.ok ? '✓ Approved & book issued!' : result.msg, result.ok ? 'success' : 'error');
        render();
      };
    });
    document.querySelectorAll('.reject-btn').forEach(btn => {
      btn.onclick = async () => {
        await DB.rejectRequest(btn.dataset.reqid);
        UI.toast('Request rejected.', 'info');
        render();
      };
    });
  }
  render();
}

// ── Admin Transactions ────────────────
function renderAdminTransactions() {
  DB.updateOverdueStatuses();
  let filter = 'active';

  function render() {
    const allTx = DB.getTransactions();
    const filtered = allTx.filter(t => {
      if (filter === 'active') return t.status === 'issued' || t.status === 'overdue';
      if (filter === 'overdue') return t.status === 'overdue';
      if (filter === 'returned') return t.status === 'returned';
      return true;
    });

    buildAdminLayout('transactions', `
      <div class="admin-page">
        <div class="admin-page-header">
          <h1>Transactions</h1>
          <p>${allTx.length} total transactions</p>
        </div>
        <div class="tab-bar">
          <button class="tab-btn ${filter === 'active' ? 'active' : ''}" data-filter="active">Active</button>
          <button class="tab-btn ${filter === 'overdue' ? 'active' : ''}" data-filter="overdue">Overdue</button>
          <button class="tab-btn ${filter === 'returned' ? 'active' : ''}" data-filter="returned">Returned</button>
          <button class="tab-btn ${filter === 'all' ? 'active' : ''}" data-filter="all">All</button>
        </div>
        <div class="tx-admin-list">
          ${filtered.length ? [...filtered].reverse().map(t => {
            const book = DB.getBookById(t.book_id);
            const student = DB.getStudents().find(s => s.register_number === t.register_number);
            return `<div class="tx-admin-card ${t.status === 'overdue' ? 'card-overdue' : ''}">
              <div class="tac-header">
                <div class="tac-icon" style="background:${bookGradient(book?.category)}">${UI.catIcon(book?.category)}</div>
                <div class="tac-info">
                  <div class="tac-book">${book?.title || 'Unknown'}</div>
                  <div class="tac-student">👤 ${student?.name || 'Unknown'}</div>
                </div>
                ${UI.statusBadge(t.status)}
              </div>
              <div class="tac-dates">
                <span>📅 Issued: ${UI.fmtDate(t.issue_date)}</span>
                <span>⏰ Due: ${UI.fmtDate(t.return_date)}</span>
              </div>
              ${(t.status === 'issued' || t.status === 'overdue') ? `
              <button class="btn btn-outline btn-sm return-btn" data-txid="${t.transaction_id}">
                ✓ Mark Returned
              </button>` : ''}
              ${t.actual_return ? `<div class="tac-returned">Returned: ${UI.fmtDate(t.actual_return)}</div>` : ''}
            </div>`;
          }).join('') : UI.emptyState('🔄', `No ${filter} transactions`)}
        </div>
      </div>`);

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = () => { filter = btn.dataset.filter; render(); };
    });
    document.querySelectorAll('.return-btn').forEach(btn => {
      btn.onclick = () => {
        UI.confirm('Mark as Returned', 'Confirm book has been returned?', async () => {
          const result = await DB.returnBook(btn.dataset.txid);
          UI.toast(result.ok ? '✓ Book marked as returned!' : result.msg, result.ok ? 'success' : 'error');
          render();
        });
      };
    });
  }
  render();
}

// ── Admin Reports ─────────────────────
function renderAdminReports() {
  DB.updateOverdueStatuses();
  const stats = DB.getStats();
  const books = DB.getBooks();
  const allTx = DB.getTransactions();
  const students = DB.getStudents().filter(s => s.role !== 'admin');

  // Category breakdown
  const catMap = {};
  books.forEach(b => { catMap[b.category] = (catMap[b.category] || 0) + 1; });
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  // Most borrowed books
  const bookBorrowCount = {};
  allTx.forEach(t => { bookBorrowCount[t.book_id] = (bookBorrowCount[t.book_id] || 0) + 1; });
  const topBorrowed = Object.entries(bookBorrowCount)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([id, count]) => ({ book: DB.getBookById(id), count })).filter(x => x.book);

  // Student activity
  const studentBorrows = {};
  students.forEach(s => {
    studentBorrows[s.register_number] = allTx.filter(t => t.register_number === s.register_number).length;
  });
  const topStudents = Object.entries(studentBorrows)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([id, cnt]) => ({ student: students.find(s => s.register_number === id), count: cnt })).filter(x => x.student);

  buildAdminLayout('reports', `
    <div class="admin-page">
      <div class="admin-page-header"><h1>Reports & Analytics</h1><p>Library statistics overview</p></div>

      <div class="stats-grid mini-stats">
        <div class="stat-tile stat-blue"><div class="stile-icon">📚</div><div class="stile-val">${stats.totalBooks}</div><div class="stile-label">Books</div></div>
        <div class="stat-tile stat-green"><div class="stile-icon">📖</div><div class="stile-val">${stats.issuedBooks}</div><div class="stile-label">Active Issues</div></div>
        <div class="stat-tile stat-red"><div class="stile-icon">⚠️</div><div class="stile-val">${stats.overdueBooks}</div><div class="stile-label">Overdue</div></div>
        <div class="stat-tile stat-gray"><div class="stile-icon">↩️</div><div class="stile-val">${stats.returnedBooks}</div><div class="stile-label">Returned</div></div>
      </div>

      <div class="chart-grid">
        <div class="chart-section">
          <h3>📊 Books by Category</h3>
          <div class="chart-canvas-wrap"><canvas id="catChart"></canvas></div>
        </div>
        ${topBorrowed.length ? `
        <div class="chart-section">
          <h3>🔥 Most Borrowed Books</h3>
          <div class="chart-canvas-wrap"><canvas id="borrowChart"></canvas></div>
        </div>` : ''}
      </div>

      ${topBorrowed.length ? `
      <div class="report-section">
        <h3>🔥 Most Borrowed Books</h3>
        ${topBorrowed.map((item, i) => `
          <div class="report-row">
            <span class="rank-num">#${i + 1}</span>
            <div class="rr-info">
              <div class="rr-title">${item.book.title}</div>
              <div class="rr-author">${item.book.author}</div>
            </div>
            <span class="rr-count">${item.count} time${item.count !== 1 ? 's' : ''}</span>
          </div>`).join('')}
      </div>` : ''}

      ${topStudents.length ? `
      <div class="report-section">
        <h3>🎓 Most Active Students</h3>
        ${topStudents.map((item, i) => `
          <div class="report-row">
            <span class="rank-num">#${i + 1}</span>
            <div class="rr-info">
              <div class="rr-title">${item.student.name}</div>
              <div class="rr-author">${item.student.department}</div>
            </div>
            <span class="rr-count">${item.count} book${item.count !== 1 ? 's' : ''}</span>
          </div>`).join('')}
      </div>` : ''}

      <div class="report-section">
        <h3>📈 Summary Stats</h3>
        <div class="summary-grid">
          <div class="sg-item"><span class="sg-label">Total Students</span><span class="sg-val">${stats.totalStudents}</span></div>
          <div class="sg-item"><span class="sg-label">Total Copies</span><span class="sg-val">${stats.totalcopies}</span></div>
          <div class="sg-item"><span class="sg-label">Return Rate</span><span class="sg-val">${allTx.length ? Math.round((stats.returnedBooks / allTx.length) * 100) : 0}%</span></div>
          <div class="sg-item"><span class="sg-label">Total Transactions</span><span class="sg-val">${allTx.length}</span></div>
        </div>
      </div>
    </div>`);

  // ── Chart.js: Reports Charts ───────────────────────────
  const isDark   = document.body.classList.contains('dark');
  const txtColor = isDark ? '#94A3B8' : '#64748B';
  Chart.defaults.color = txtColor;
  Chart.defaults.borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  // Category Doughnut
  const catColors = [
    'rgba(47,128,237,0.85)',  'rgba(39,174,96,0.85)',  'rgba(235,87,87,0.85)',
    'rgba(242,153,74,0.85)',  'rgba(155,81,224,0.85)', 'rgba(86,204,242,0.85)',
    'rgba(242,201,76,0.85)',  'rgba(111,207,151,0.85)',
  ];
  const catEl = document.getElementById('catChart');
  if (catEl && catEntries.length) {
    new Chart(catEl, {
      type: 'doughnut',
      data: {
        labels: catEntries.map(([c]) => c),
        datasets: [{ data: catEntries.map(([,n]) => n), backgroundColor: catColors, borderWidth: 2, hoverOffset: 8 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '60%',
        plugins: { legend: { position: 'bottom', labels: { padding: 14, usePointStyle: true } } },
      },
    });
  }

  // Top Borrowed Horizontal Bar
  const borrowEl = document.getElementById('borrowChart');
  if (borrowEl && topBorrowed.length) {
    new Chart(borrowEl, {
      type: 'bar',
      data: {
        labels: topBorrowed.map(x => x.book.title.length > 22 ? x.book.title.slice(0, 22) + '…' : x.book.title),
        datasets: [{
          label: 'Times Borrowed',
          data: topBorrowed.map(x => x.count),
          backgroundColor: topBorrowed.map((_, i) => catColors[i % catColors.length]),
          borderRadius: 8,
          borderWidth: 0,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' } },
          y: { grid: { display: false } },
        },
      },
    });
  }
}

// ── Admin Students ─────────────────────
function renderAdminStudents() {
  const students = DB.getStudents().filter(s => s.role !== 'admin');

  buildAdminLayout('students', `
    <div class="admin-page">
      <div class="admin-page-header"><h1>Students</h1><p>${students.length} registered students</p></div>
      <div class="student-list">
        ${students.length ? students.map(s => {
          const myTx = DB.getStudentTransactions(s.register_number);
          const active = myTx.filter(t => t.status === 'issued' || t.status === 'overdue').length;
          return `<div class="student-card">
            <div class="sc-avatar">${s.name.charAt(0).toUpperCase()}</div>
            <div class="sc-info">
              <div class="sc-name">${s.name}</div>
              <div class="sc-email" style="font-family:monospace;font-size:0.85em;color:var(--primary);">🆔 ${s.register_number}</div>
              <div class="sc-email">✉️ ${s.email}</div>
              <div class="sc-dept">🏫 ${s.department}</div>
              <div class="sc-phone">📱 ${s.phone}</div>
            </div>
            <div class="sc-stats">
              <div class="scs-item"><span class="scs-val">${myTx.length}</span><span class="scs-label">Total</span></div>
              <div class="scs-item"><span class="scs-val ${active > 0 ? 'text-blue' : ''}">${active}</span><span class="scs-label">Active</span></div>
            </div>
          </div>`;
        }).join('') : UI.emptyState('🎓', 'No students registered')}
      </div>
    </div>`);
}

// ── Admin Question Papers ───────────────────────────────
async function renderAdminQuestionPapers() {
  // Fetch papers from API
  let papers = [];
  try {
    const res = await fetch('/api/papers', {
      headers: { 'Authorization': `Bearer ${DB.getToken()}` }
    });
    papers = await res.json();
    if (!Array.isArray(papers)) papers = [];
  } catch (e) { papers = []; }

  // Group by semester
  const grouped = {};
  papers.forEach(p => {
    if (!grouped[p.semester]) grouped[p.semester] = [];
    grouped[p.semester].push(p);
  });

  const semesterOrder = ['Semester I','Semester II','Semester III','Semester IV','Semester V','Semester VI','Semester VII','Semester VIII'];
  const sortedKeys = Object.keys(grouped).sort((a,b) => semesterOrder.indexOf(a) - semesterOrder.indexOf(b));

  buildAdminLayout('papers', `
    <div class="admin-page">
      <div class="admin-page-header">
        <h1>Question Papers</h1>
        <button class="btn btn-primary" id="addPaperBtn">➕ Add Paper</button>
      </div>

      ${papers.length === 0 ? `
        <div class="no-data" style="text-align:center; padding:3rem 0;">
          <div style="font-size:3rem;">📄</div>
          <p style="margin-top:1rem; color:var(--text-mod);">No question papers uploaded yet. Click "Add Paper" to get started.</p>
        </div>` : ''}

      ${sortedKeys.map(sem => `
        <div class="admin-section" style="margin-bottom:2.5rem;">
          <div class="as-header">
            <h3 style="border-left:4px solid var(--primary); padding-left:10px;">${sem}</h3>
            <span style="color:var(--text-mod); font-size:0.9em;">${grouped[sem].length} paper(s)</span>
          </div>
          <div class="admin-book-grid">
            ${grouped[sem].map(p => {
              const imgs = Array.isArray(p.images) ? p.images : [];
              const thumbs = imgs.slice(0,4).map(img => _fileThumb(img.image_path, '36px', '36px')).join('');
              return `
              <div class="admin-book-card">
                <div class="abc-header">
                  <div class="abc-cover" style="background:linear-gradient(135deg,#1565C0,#2F80ED);display:flex;align-items:center;justify-content:center;font-size:2rem;min-width:60px;height:60px;border-radius:10px;overflow:hidden;">
                    ${imgs.length
                      ? (_isImg(imgs[0].image_path)
                        ? `<img src="${imgs[0].image_path}" alt="${p.code}" style="width:100%;height:100%;object-fit:cover;"/>`
                        : `<span style="font-size:1.8rem;">${_isPdf(imgs[0].image_path) ? '📄' : '📝'}</span>`)
                      : '📄'}
                  </div>
                  <div class="abc-info">
                    <div class="abc-title">${p.title}</div>
                    <div class="abc-author" style="font-family:monospace;font-size:0.8em;">${p.code}</div>
                    <div class="abc-cat">${p.semester} • ${p.exam_type || 'SEM'}</div>
                  </div>
                </div>
                ${imgs.length > 1 ? `<div style="display:flex;gap:4px;padding:6px 0;flex-wrap:wrap;">${thumbs}<span style="font-size:0.75em;color:var(--text-mod);align-self:center;">${imgs.length} file${imgs.length>1?'s':''}</span></div>` : ''}
                <div class="abc-actions">
                  <button class="icon-btn blue-btn paper-view-btn" data-imgs='${JSON.stringify(imgs.map(i=>i.image_path))}' title="View Images">🖼️</button>
                  <button class="icon-btn blue-btn paper-edit-btn" data-id="${p.id}" data-code="${p.code}" data-title="${p.title}" data-sem="${p.semester}" data-examtype="${p.exam_type || 'SEM'}" data-imgs='${JSON.stringify(p.images||[])}' title="Edit">✏️</button>
                  <button class="icon-btn red-btn paper-del-btn" data-id="${p.id}" data-title="${p.title}" title="Delete">🗑️</button>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>`).join('')}
    </div>`);

  // ── Events ────────────────────────────────────────
  document.getElementById('addPaperBtn').onclick = () => showPaperModal(null);

  document.querySelectorAll('.paper-edit-btn').forEach(btn => {
    btn.onclick = () => showPaperModal({
      id: btn.dataset.id,
      code: btn.dataset.code,
      title: btn.dataset.title,
      semester: btn.dataset.sem,
      exam_type: btn.dataset.examtype,
      images: JSON.parse(btn.dataset.imgs || '[]')
    });
  });

  document.querySelectorAll('.paper-del-btn').forEach(btn => {
    btn.onclick = () => {
      UI.confirm('Delete Paper', `Delete "<strong>${btn.dataset.title}</strong>"? This cannot be undone.`, async () => {
        const r = await fetch(`/api/papers/${btn.dataset.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${DB.getToken()}` }
        });
        const d = await r.json();
        if (d.ok) { UI.toast('Paper deleted.', 'success'); renderAdminQuestionPapers(); }
        else UI.toast(d.msg || 'Delete failed.', 'error');
      });
    };
  });

  // Gallery lightbox for multi-image view
  document.querySelectorAll('.paper-view-btn').forEach(btn => {
    btn.onclick = () => {
      let imgs = [];
      try { imgs = JSON.parse(btn.dataset.imgs || '[]'); } catch(_) {}
      if (!imgs.length) { UI.toast('No images uploaded for this paper.', 'info'); return; }
      openImageGallery(imgs);
    };
  });
}

function openImageGallery(imgs) {
  let idx = 0;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1rem;';

  function build() {
    const cur = imgs[idx];
    overlay.innerHTML = `
      <button id="glClose" style="position:absolute;top:20px;right:20px;background:#ff4757;color:#fff;border:none;border-radius:8px;padding:10px 18px;cursor:pointer;font-weight:700;font-size:1rem;">✕ Close</button>
      <div style="position:absolute;top:20px;left:50%;transform:translateX(-50%);color:#fff;font-size:0.95rem;opacity:0.8;">File ${idx+1} of ${imgs.length}</div>

      ${imgs.length > 1 ? `<button id="glPrev" style="position:absolute;left:20px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.15);color:#fff;border:none;border-radius:50%;width:50px;height:50px;font-size:1.5rem;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);">‹</button>` : ''}

      ${_fileViewer(cur)}

      ${imgs.length > 1 ? `<button id="glNext" style="position:absolute;right:20px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.15);color:#fff;border:none;border-radius:50%;width:50px;height:50px;font-size:1.5rem;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);">›</button>` : ''}

      ${imgs.length > 1 ? `
      <div style="display:flex;gap:8px;margin-top:4px;">
        ${imgs.map((src, i) => {
          const border = i===idx ? '#2F80ED' : 'transparent';
          if (_isPdf(src)) return `<div onclick="__glGoto(${i})" style="width:52px;height:52px;border-radius:6px;border:2px solid ${border};cursor:pointer;display:flex;align-items:center;justify-content:center;background:#fff4f4;font-size:1.3rem;flex-shrink:0;">📄</div>`;
          if (_isDoc(src)) return `<div onclick="__glGoto(${i})" style="width:52px;height:52px;border-radius:6px;border:2px solid ${border};cursor:pointer;display:flex;align-items:center;justify-content:center;background:#f0f4ff;font-size:1.3rem;flex-shrink:0;">📝</div>`;
          return `<div onclick="__glGoto(${i})" style="width:52px;height:52px;border-radius:6px;overflow:hidden;border:2px solid ${border};cursor:pointer;flex-shrink:0;"><img src="${src}" style="width:100%;height:100%;object-fit:cover;"/></div>`;
        }).join('')}
      </div>` : ''}`;

    document.getElementById('glClose').onclick = () => overlay.remove();
    const prevBtn = document.getElementById('glPrev');
    const nextBtn = document.getElementById('glNext');
    if (prevBtn) prevBtn.onclick = () => { idx = (idx - 1 + imgs.length) % imgs.length; build(); };
    if (nextBtn) nextBtn.onclick = () => { idx = (idx + 1) % imgs.length; build(); };
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

    window.__glGoto = (i) => { idx = i; build(); };
  }

  build();
  document.body.appendChild(overlay);
}

// ── Paper Add/Edit Modal ─────────────────────────────────
const SEMESTERS = ['Semester I','Semester II','Semester III','Semester IV','Semester V','Semester VI','Semester VII','Semester VIII'];

function showPaperModal(paper) {
  const isEdit = !!paper;
  const existingImgs = isEdit && Array.isArray(paper.images) ? paper.images : [];

  const existingImgHTML = existingImgs.length ? `
    <div class="form-group">
      <label>Existing Images (${existingImgs.length}) — click 🗑️ to remove</label>
      <div id="existingImgStrip" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">
        ${existingImgs.map(img => {
          const isImage = _isImg(img.image_path);
          return `
          <div id="imgBlock_${img.id}" style="position:relative;width:72px;height:72px;border-radius:8px;overflow:hidden;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;${isImage ? '' : 'background:#f5f5f5;'}">
            ${isImage
              ? `<img src="${img.image_path}" style="width:100%;height:100%;object-fit:cover;"/>`
              : `<span style="font-size:2rem;">${_isPdf(img.image_path) ? '📄' : '📝'}</span>`}
            <button onclick="adminDeletePaperImg(${paper.id},${img.id})" style="position:absolute;top:2px;right:2px;background:#ff4757;color:#fff;border:none;border-radius:4px;width:20px;height:20px;cursor:pointer;font-size:0.65rem;display:flex;align-items:center;justify-content:center;">✕</button>
          </div>`;
        }).join('')}
      </div>
    </div>` : '';

  UI.modal({
    title: isEdit ? '✏️ Edit Question Paper' : '➕ Add Question Paper',
    body: `
      <div class="form-group">
        <label>Subject Code *</label>
        <input type="text" id="pCode" value="${paper?.code || ''}" placeholder="e.g. 22CSC01"/>
      </div>
      <div class="form-group">
        <label>Subject Title *</label>
        <input type="text" id="pTitle" value="${paper?.title || ''}" placeholder="e.g. Problem Solving and C Programming"/>
      </div>
      <div class="form-group">
        <label>Semester *</label>
        <select id="pSem">
          ${SEMESTERS.map(s => `<option value="${s}" ${paper?.semester === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Exam Type *</label>
        <select id="pExamType">
          <option value="SEM" ${paper?.exam_type === 'SEM' ? 'selected' : ''}>SEM</option>
          <option value="CAT" ${paper?.exam_type === 'CAT' ? 'selected' : ''}>CAT</option>
        </select>
      </div>
      ${existingImgHTML}
      <div class="form-group">
        <label>${isEdit ? '➕ Add More Files (up to 10 at a time)' : 'Upload Files * (select up to 10)'}</label>
        <input type="file" id="pImage" accept="image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" multiple style="border:2px dashed var(--border); padding:1rem; border-radius:8px; width:100%; cursor:pointer;"/>
        <small style="color:var(--text-mod);">${isEdit ? 'New files will be appended to existing ones. Supports images, PDF, DOC, DOCX.' : 'You can select multiple files (images, PDF, DOC, DOCX — max 10).'}</small>
        <div id="pImagePreview" style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;"></div>
      </div>`,
    actions: [
      { label: 'Cancel', cls: 'btn-outline' },
      {
        label: isEdit ? 'Save Changes' : 'Upload Paper',
        cls: 'btn-primary',
        fn: async () => {
          const code  = document.getElementById('pCode').value.trim();
          const title = document.getElementById('pTitle').value.trim();
          const sem   = document.getElementById('pSem').value;
          const exam_type = document.getElementById('pExamType').value;
          const fileInput = document.getElementById('pImage');
          const files = Array.from(fileInput.files);

          if (!code || !title || !sem) { UI.toast('Please fill all required fields.', 'error'); return; }
          if (!isEdit && !files.length) { UI.toast('Please upload at least one file.', 'error'); return; }
          if (files.length > 10) { UI.toast('Maximum 10 files allowed per upload.', 'error'); return; }

          const formData = new FormData();
          formData.append('code', code);
          formData.append('title', title);
          formData.append('semester', sem);
          formData.append('exam_type', exam_type);
          files.forEach(f => formData.append('images', f));

          const url    = isEdit ? `/api/papers/${paper.id}` : '/api/papers';
          const method = isEdit ? 'PUT' : 'POST';

          const r = await fetch(url, {
            method,
            headers: { 'Authorization': `Bearer ${DB.getToken()}` },
            body: formData
          });
          const d = await r.json();
          if (d.ok || d.id) {
            UI.toast(isEdit ? 'Paper updated! ✓' : 'Paper uploaded! 📄', 'success');
            renderAdminQuestionPapers();
          } else {
            UI.toast(d.msg || 'Operation failed.', 'error');
          }
        }
      }
    ]
  });

  // Image preview handler
  setTimeout(() => {
    const inp = document.getElementById('pImage');
    if (!inp) return;
    inp.onchange = () => {
      const preview = document.getElementById('pImagePreview');
      preview.innerHTML = '';
      Array.from(inp.files).slice(0, 10).forEach(f => {
        if (f.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = e => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.cssText = 'width:70px;height:70px;object-fit:cover;border-radius:8px;border:1px solid var(--border);';
            preview.appendChild(img);
          };
          reader.readAsDataURL(f);
        } else {
          // Non-image file: show icon + name
          const el = document.createElement('div');
          const ext = f.name.split('.').pop().toUpperCase();
          el.style.cssText = 'width:70px;height:70px;border-radius:8px;border:1px solid var(--border);display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:0.65rem;background:var(--surface);gap:2px;overflow:hidden;padding:4px;';
          el.innerHTML = `<span style="font-size:1.4rem;">${ext === 'PDF' ? '📄' : '📝'}</span><span style="text-overflow:ellipsis;overflow:hidden;max-width:100%;white-space:nowrap;">${ext}</span>`;
          preview.appendChild(el);
        }
      });
    };
  }, 80);
}

// Delete a single image from a paper (called inline from modal)
window.adminDeletePaperImg = async (paperId, imgId) => {
  const r = await fetch(`/api/papers/${paperId}/images/${imgId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${DB.getToken()}` }
  });
  const d = await r.json();
  if (d.ok) {
    const blk = document.getElementById(`imgBlock_${imgId}`);
    if (blk) blk.remove();
    UI.toast('Image removed.', 'success');
  } else {
    UI.toast(d.msg || 'Failed to remove image.', 'error');
  }
};
