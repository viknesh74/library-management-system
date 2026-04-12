// ════════════════════════════════════════
// Smart Library – Student Screens
// ════════════════════════════════════════

// ── Student Layout (Admin Panel Style) ────────────────
function buildStudentLayout(activeSection, content) {
  const app = document.getElementById('app');
  const user = DB.getCurrentUser();
  const notifications = DB.getNotifications(user.register_number);

  const nav = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', route: 'student-dashboard' },
    { id: 'books', icon: '📚', label: 'My Books', route: 'my-books' },
    { id: 'search', icon: '🔍', label: 'Search', route: 'book-search' },
    { id: 'history', icon: '🕒', label: 'History', route: 'borrow-history' },
    { id: 'ebooks', icon: '📖', label: 'E-Books', route: 'student-ebooks' },
    { id: 'cgpa', icon: '🎯', label: 'CGPA Calc', route: 'cgpa-calculator' },
    { id: 'profile', icon: '👤', label: 'Profile', route: 'student-profile' },
    { id: 'motivation', icon: '💡', label: 'Motivation', route: 'motivation-videos' },
    { id: 'papers', icon: '📝', label: 'Question Papers', route: 'student-question-papers' },
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
          <div class="su-avatar">${user?.name?.charAt(0) || 'S'}</div>
          <div class="su-info">
            <div class="su-name">${user?.name || 'Student'}</div>
            <div class="su-role">🎓 Student</div>
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
          <div class="topbar-pending" id="topbarPending">
            ${notifications.length ? `
              <div class="pending-alert" onclick="Router.navigate('notifications')">
                🔔 ${notifications.length} alerts
              </div>` : ''}
          </div>
          <div class="topbar-user">Student Panel</div>
        </div>
        <div class="admin-content" id="adminContent">${content}</div>
      </div>
      <div class="sidebar-overlay" id="sidebarOverlay"></div>
    </div>`;

  // Sidebar events
  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) {
    menuBtn.onclick = () => {
      document.getElementById('adminSidebar').classList.add('open');
      document.getElementById('sidebarOverlay').classList.add('show');
    };
  }

  const closeSidebarFn = () => {
    document.getElementById('adminSidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('show');
  };
  const sidebarClose = document.getElementById('sidebarClose');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  if (sidebarClose) sidebarClose.onclick = closeSidebarFn;
  if (sidebarOverlay) sidebarOverlay.onclick = closeSidebarFn;

  document.querySelectorAll('.sidebar-item[data-route]').forEach(btn => {
    btn.onclick = () => Router.navigate(btn.dataset.route);
  });

  const darkModeBtn = document.getElementById('adminDarkMode');
  if (darkModeBtn) {
    darkModeBtn.onclick = () => {
      DB.setDarkMode(!DB.getDarkMode());
      Router.navigate(Router.currentRoute.name, Router.currentParams);
    };
  }

  const logoutBtn = document.getElementById('adminLogout');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      UI.confirm('Logout', 'Are you sure you want to logout?', () => {
        DB.logout();
        Router.navigate('login');
        UI.toast('Logged out successfully.', 'info');
      });
    };
  }
}

// ── Student Dashboard ─────────────────
function renderStudentDashboard() {
  DB.updateOverdueStatuses();
  const user = DB.getCurrentUser();
  const notifications = DB.getNotifications(user.register_number);
  const myTx = DB.getStudentTransactions(user.register_number);
  const activeBooks = myTx.filter(t => t.status === 'issued' || t.status === 'overdue');
  const overdueTx = myTx.filter(t => t.status === 'overdue');
  const books = DB.getBooks();
  const recentBooks = [...books].sort((a, b) => new Date(b.added_date) - new Date(a.added_date)).slice(0, 6);

  const content = `
    <div class="admin-page">
      <div class="student-header">
        <div class="header-top">
          <div class="header-greeting">
            <p class="greeting-sub">Good ${getGreeting()} 👋</p>
            <h1 class="greeting-name">${user.name.split(' ')[0]}</h1>
          </div>
        </div>
      </div>

      <div class="screen-body" style="padding: 0;">
        ${overdueTx.length ? `
        <div class="alert-banner" style="margin-bottom: 2rem;">
          <span>⚠️</span>
          <p>You have <strong>${overdueTx.length}</strong> overdue book(s). Please return them immediately.</p>
        </div>` : ''}

        <div class="stats-grid">
          <div class="stat-tile stat-blue" id="qcSearch">
            <div class="stile-icon">🔍</div>
            <div class="stile-val">${books.length}</div>
            <div class="stile-label">Total Books</div>
          </div>
          <div class="stat-tile stat-green" id="qcMyBooks">
            <div class="stile-icon">📖</div>
            <div class="stile-val">${activeBooks.length}</div>
            <div class="stile-label">My Issued</div>
          </div>
          <div class="stat-tile stat-red">
            <div class="stile-icon">⚠️</div>
            <div class="stile-val">${overdueTx.length}</div>
            <div class="stile-label">Overdue</div>
          </div>
          <div class="stat-tile stat-purple" id="qcHistory">
            <div class="stile-icon">🕒</div>
            <div class="stile-val">${myTx.length}</div>
            <div class="stile-label">History</div>
          </div>
          <div class="stat-tile stat-orange" id="qcPapers">
            <div class="stile-icon">📝</div>
            <div class="stile-val">${DB.getPapers().length}</div>
            <div class="stile-label">QP Papers</div>
          </div>
          <div class="stat-tile stat-teal" id="qcEbooks">
            <div class="stile-icon">📖</div>
            <div class="stile-val" id="ebookCountTile">…</div>
            <div class="stile-label">E-Books</div>
          </div>
          <div class="stat-tile stat-indigo" id="qcCGPA">
            <div class="stile-icon">🎯</div>
            <div class="stile-val">GPA</div>
            <div class="stile-label">CGPA Calc</div>
          </div>
          <div class="stat-tile stat-blue" id="qcMotivation">
            <div class="stile-icon">💡</div>
            <div class="stile-val">6</div>
            <div class="stile-label">Motivation</div>
          </div>
        </div>

        ${activeBooks.length ? `
        <div class="admin-section">
          <div class="as-header">
            <h3>My Issued Books</h3>
            <button class="see-all-btn" id="seeAllBooks">See all →</button>
          </div>
          <div class="issued-list" style="margin-top: 1rem;">
            ${activeBooks.map(tx => {
    const book = DB.getBookById(tx.book_id);
    if (!book) return '';
    return `<div class="issued-card" data-txid="${tx.transaction_id}" data-bookid="${tx.book_id}">
                <div class="ic-icon">${UI.catIcon(book.category)}</div>
                <div class="ic-info">
                  <div class="ic-title">${book.title}</div>
                  <div class="ic-author">${book.author}</div>
                  <div class="ic-date">Due: ${UI.fmtDate(tx.return_date)}</div>
                </div>
                ${UI.statusBadge(tx.status)}
              </div>`;
  }).join('')}
          </div>
        </div>` : ''}

        <div class="admin-section">
          <div class="as-header">
            <h3>Recently Added</h3>
            <button class="see-all-btn" id="seeAllSearch">Browse →</button>
          </div>
          <div class="recent-books-grid" style="margin-top: 1rem;">
            ${recentBooks.map(book => `
              <div class="book-tile" data-bookid="${book.book_id}">
                <div class="bt-cover" style="background:${bookGradient(book.category)}">
                  <span class="bt-cat-icon">${UI.catIcon(book.category)}</span>
                </div>
                <div class="bt-info">
                  <div class="bt-title">${book.title}</div>
                  <div class="bt-author">${book.author}</div>
                  <div class="bt-avail">${book.available_copies > 0 ? `<span class="avail-dot green"></span>${book.available_copies} available` : `<span class="avail-dot red"></span>Unavailable`}</div>
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>`;

  buildStudentLayout('dashboard', content);

  // Events
  document.getElementById('qcSearch').onclick = () => Router.navigate('book-search');
  document.getElementById('qcMyBooks').onclick = () => Router.navigate('my-books');
  document.getElementById('qcHistory').onclick = () => Router.navigate('borrow-history');
  document.getElementById('qcPapers').onclick = () => Router.navigate('student-question-papers');
  document.getElementById('qcEbooks').onclick = () => Router.navigate('student-ebooks');
  document.getElementById('qcCGPA').onclick = () => Router.navigate('cgpa-calculator');
  document.getElementById('qcMotivation').onclick = () => Router.navigate('motivation-videos');
  const _sB = document.getElementById('seeAllBooks'); if (_sB) _sB.onclick = () => Router.navigate('my-books');
  const _sS = document.getElementById('seeAllSearch'); if (_sS) _sS.onclick = () => Router.navigate('book-search');

  // Async ebook count
  fetch('/api/ebooks', { headers: { 'Authorization': `Bearer ${DB.getToken()}` } })
    .then(r => r.json())
    .then(data => {
      const el = document.getElementById('ebookCountTile');
      if (el) el.textContent = Array.isArray(data) ? data.length : 0;
    }).catch(() => {});

  document.querySelectorAll('.book-tile').forEach(el => {
    el.onclick = () => Router.navigate('book-details', { book_id: el.dataset.bookid });
  });
  document.querySelectorAll('.issued-card').forEach(el => {
    el.onclick = () => Router.navigate('book-details', { book_id: el.dataset.bookid });
  });
}

// ── Book Search ───────────────────────
function renderBookSearch() {
  const content = `
    <div class="admin-page">
      <div class="admin-page-header">
        <h2>Search Books</h2>
        <p>Find from our collection of ${DB.getBooks().length} books</p>
      </div>
      <div class="screen-body" style="padding: 0;">
        <div class="search-bar-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="searchInput" placeholder="Search title, author…" autofocus/>
          <button class="clear-btn" id="clearSearch" style="display:none">✕</button>
        </div>
        <div class="category-scroll" id="catScroll">
          ${['All', ...DB.CATEGORIES].map(c => `
            <button class="cat-chip ${c === 'All' ? 'active' : ''}" data-cat="${c}">${c === 'All' ? '📚 All' : UI.catIcon(c) + ' ' + c}</button>
          `).join('')}
        </div>
        <div class="results-count" id="resultsCount"></div>
        <div class="book-list" id="bookList"></div>
      </div>
    </div>`;

  buildStudentLayout('search', content);

  let query = '', category = 'All';

  function renderResults() {
    const books = DB.searchBooks(query, category);
    document.getElementById('resultsCount').textContent = `${books.length} book${books.length !== 1 ? 's' : ''} found`;
    const listEl = document.getElementById('bookList');
    if (!books.length) {
      listEl.innerHTML = UI.emptyState('🔍', 'No books found', 'Try a different search or category');
      return;
    }
    listEl.innerHTML = books.map(b => `
      <div class="book-row" data-bookid="${b.book_id}">
        <div class="br-cover" style="background:${bookGradient(b.category)}">
          <span>${UI.catIcon(b.category)}</span>
        </div>
        <div class="br-info">
          <div class="br-title">${b.title}</div>
          <div class="br-author">${b.author}</div>
          <div class="br-cat">${b.category}</div>
        </div>
        <div class="br-right">
          ${UI.availBadge(b.available_copies, b.total_copies)}
        </div>
      </div>`).join('');

    listEl.querySelectorAll('.book-row').forEach(el => {
      el.onclick = () => Router.navigate('book-details', { book_id: el.dataset.bookid });
    });
  }

  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearch');
  searchInput.oninput = () => {
    query = searchInput.value.trim();
    clearBtn.style.display = query ? 'flex' : 'none';
    renderResults();
  };
  clearBtn.onclick = () => { query = ''; searchInput.value = ''; clearBtn.style.display = 'none'; renderResults(); };

  document.getElementById('catScroll').querySelectorAll('.cat-chip').forEach(chip => {
    chip.onclick = () => {
      document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      category = chip.dataset.cat;
      renderResults();
    };
  });

  renderResults();
}

// ── Book Details ──────────────────────
function renderBookDetails({ book_id }) {
  const book = DB.getBookById(book_id);
  const user = DB.getCurrentUser();

  if (!book) {
    buildStudentLayout('search', UI.emptyState('📚', 'Book not found'));
    return;
  }

  const myRequests = DB.getStudentRequests(user.register_number);
  const hasPending = myRequests.some(r => r.book_id === book_id && r.approval_status === 'pending');
  const myTx = DB.getStudentTransactions(user.register_number);
  const alreadyIssued = myTx.some(t => t.book_id === book_id && (t.status === 'issued' || t.status === 'overdue'));

  let btnHTML = '';
  if (alreadyIssued) btnHTML = `<button class="btn btn-outline btn-full" disabled>📖 Already Issued</button>`;
  else if (hasPending) btnHTML = `<button class="btn btn-outline btn-full" disabled>⏳ Request Pending</button>`;
  else if (book.available_copies < 1) btnHTML = `<button class="btn btn-outline btn-full" id="requestBtn">📋 Join Waitlist</button>`;
  else btnHTML = `<button class="btn btn-primary btn-full" id="requestBtn">📬 Request This Book</button>`;

  const content = `
    <div class="admin-page">
      <div class="detail-hero" style="background:${bookGradient(book.category)}">
        ${UI.backBtn('Back', null)}
        <div class="detail-cover">
          <div class="detail-icon">${UI.catIcon(book.category)}</div>
        </div>
      </div>
      <div class="screen-body detail-body" style="padding: 1.5rem 0;">
        <div class="detail-category-tag">${book.category}</div>
        <h1 class="detail-title">${book.title}</h1>
        <p class="detail-author">✍️ ${book.author}</p>
        ${UI.availBadge(book.available_copies, book.total_copies)}

        <div class="detail-stats">
          <div class="ds-item">
            <span class="ds-val">${book.total_copies}</span>
            <span class="ds-label">Total</span>
          </div>
          <div class="ds-divider"></div>
          <div class="ds-item">
            <span class="ds-val" style="color:${book.available_copies > 0 ? 'var(--green)' : 'var(--red)'}">${book.available_copies}</span>
            <span class="ds-label">Available</span>
          </div>
          <div class="ds-divider"></div>
          <div class="ds-item">
            <span class="ds-val">${UI.fmtDate(book.added_date)}</span>
            <span class="ds-label">Added</span>
          </div>
        </div>

        <div class="detail-section">
          <h3>Description</h3>
          <p>${book.description || 'No description available for this book.'}</p>
        </div>

        <div class="detail-meta">
          <div class="dm-row">
            <span class="dm-label">📚 Category</span>
            <span class="dm-val">${book.category}</span>
          </div>
          <div class="dm-row">
            <span class="dm-label">📅 Added Date</span>
            <span class="dm-val">${UI.fmtDate(book.added_date)}</span>
          </div>
          <div class="dm-row">
            <span class="dm-label">🔖 Book ID</span>
            <span class="dm-val" style="font-family:monospace;font-size:0.8em">${book.book_id}</span>
          </div>
          <div class="dm-row">
            <span class="dm-label">📆 Loan Period</span>
            <span class="dm-val">14 days</span>
          </div>
        </div>

        <div class="detail-actions">
          ${btnHTML}
        </div>
      </div>
    </div>`;

  buildStudentLayout('search', content);

  document.querySelector('.back-btn')?.addEventListener('click', () => Router.navigate('book-search'));

  document.getElementById('requestBtn')?.addEventListener('click', () => {
    UI.confirm('Request Book', `Request "<strong>${book.title}</strong>"? An admin will review your request.`, async () => {
      const result = await DB.requestBook(user.register_number, book_id);
      if (result.ok) {
        UI.toast('Book request sent! 📬', 'success');
        renderBookDetails({ book_id });
      } else {
        UI.toast(result.msg, 'error');
      }
    });
  });
}

// ── My Books ──────────────────────────
function renderMyBooks() {
  DB.updateOverdueStatuses();
  const user = DB.getCurrentUser();
  const tx = DB.getStudentTransactions(user.register_number).filter(t => t.status === 'issued' || t.status === 'overdue');

  const content = `
    <div class="admin-page">
      <div class="admin-page-header">
        <h2>My Books</h2>
        <p>${tx.length} book${tx.length !== 1 ? 's' : ''} currently issued</p>
      </div>
      <div class="screen-body" style="padding: 0;">
        ${tx.length ? tx.map(t => {
    const book = DB.getBookById(t.book_id);
    if (!book) return '';
    const overdue = t.status === 'overdue';
    return `<div class="my-book-card ${overdue ? 'card-overdue' : ''}" data-bookid="${t.book_id}">
            <div class="mbc-header">
              <div class="mbc-icon" style="background:${bookGradient(book.category)}">${UI.catIcon(book.category)}</div>
              <div class="mbc-info">
                <div class="mbc-title">${book.title}</div>
                <div class="mbc-author">${book.author}</div>
              </div>
              ${UI.statusBadge(t.status)}
            </div>
            <div class="mbc-dates">
              <div class="mbc-date">
                <span class="mbc-dl">Issued</span>
                <span class="mbc-dv">${UI.fmtDate(t.issue_date)}</span>
              </div>
              <div class="mbc-arrow">→</div>
              <div class="mbc-date">
                <span class="mbc-dl">Return by</span>
                <span class="mbc-dv ${overdue ? 'text-red' : ''}">${UI.fmtDate(t.return_date)}</span>
              </div>
            </div>
            ${overdue ? `<div class="mbc-overdue-alert">⚠️ This book is overdue! Return immediately.</div>` : ''}
          </div>`;
  }).join('') : UI.emptyState('📭', 'No books issued', 'Your currently issued books will appear here')}
      </div>
    </div>`;

  buildStudentLayout('books', content);

  document.querySelectorAll('.my-book-card').forEach(el => {
    el.onclick = () => Router.navigate('book-details', { book_id: el.dataset.bookid });
  });
}

// ── Borrow History ────────────────────
function renderBorrowHistory() {
  const user = DB.getCurrentUser();
  const allTx = DB.getStudentTransactions(user.register_number);
  const requests = DB.getStudentRequests(user.register_number);

  const content = `
    <div class="admin-page">
      <div class="admin-page-header">
        <h2>Borrow History</h2>
        <p>${allTx.length} transaction${allTx.length !== 1 ? 's' : ''} total</p>
      </div>
      <div class="screen-body" style="padding: 0;">
        <div class="tab-bar border-box-tabs" style="margin-bottom: 1.5rem">
          <button class="tab-btn active" id="tabTx">Transactions</button>
          <button class="tab-btn" id="tabReq">Requests</button>
        </div>
        <div id="tabContent"></div>
      </div>
    </div>`;

  buildStudentLayout('history', content);

  function showTx() {
    document.getElementById('tabTx').classList.add('active');
    document.getElementById('tabReq').classList.remove('active');
    const el = document.getElementById('tabContent');
    if (!allTx.length) { el.innerHTML = UI.emptyState('📜', 'No transactions yet'); return; }
    el.innerHTML = [...allTx].reverse().map(t => {
      const book = DB.getBookById(t.book_id);
      return `<div class="history-card" style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:1rem; margin-bottom:1rem; display:flex; align-items:center;">
        <div class="hc-icon" style="font-size:2rem; margin-right:1rem; padding:0.5rem; background:rgba(47,128,237,0.1); border-radius:8px;">${UI.catIcon(book?.category)}</div>
        <div class="hc-info" style="flex:1;">
          <div class="hc-title" style="font-weight:600; font-size:1.1rem; margin-bottom:0.25rem;">${book?.title || 'Unknown Book'}</div>
          <div class="hc-dates" style="color:var(--text-mod); font-size:0.9rem;">${UI.fmtDate(t.issue_date)} → ${UI.fmtDate(t.return_date)}</div>
          ${t.actual_return ? `<div class="hc-returned" style="color:var(--green); font-size:0.9rem; margin-top:0.25rem;">✓ Returned: ${UI.fmtDate(t.actual_return)}</div>` : ''}
        </div>
        ${UI.statusBadge(t.status)}
      </div>`;
    }).join('');
  }

  function showReq() {
    document.getElementById('tabReq').classList.add('active');
    document.getElementById('tabTx').classList.remove('active');
    const el = document.getElementById('tabContent');
    if (!requests.length) { el.innerHTML = UI.emptyState('📋', 'No requests made'); return; }
    el.innerHTML = [...requests].reverse().map(r => {
      const book = DB.getBookById(r.book_id);
      return `<div class="history-card" style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:1rem; margin-bottom:1rem; display:flex; align-items:center;">
        <div class="hc-icon" style="font-size:2rem; margin-right:1rem; padding:0.5rem; background:rgba(47,128,237,0.1); border-radius:8px;">${UI.catIcon(book?.category)}</div>
        <div class="hc-info" style="flex:1">
          <div class="hc-title" style="font-weight:600; font-size:1.1rem; margin-bottom:0.25rem">${book?.title || 'Unknown'}</div>
          <div class="hc-dates" style="color:var(--text-mod); font-size:0.9rem">Requested: ${UI.fmtDate(r.request_date)}</div>
        </div>
        ${UI.statusBadge(r.approval_status)}
      </div>`;
    }).join('');
  }

  showTx();
  document.getElementById('tabTx').onclick = showTx;
  document.getElementById('tabReq').onclick = showReq;
}

// ── Notifications ─────────────────────
function renderNotifications() {
  const user = DB.getCurrentUser();
  const notes = DB.getNotifications(user.register_number);

  const content = `
    <div class="admin-page">
      <div class="admin-page-header">
        <h2>Notifications</h2>
        <p>${notes.length} alert${notes.length !== 1 ? 's' : ''}</p>
      </div>
      <div class="screen-body" style="padding: 0;">
        ${notes.length ? notes.map(n => `
          <div class="notif-card notif-${n.type}">
            <span class="notif-icon">${n.icon}</span>
            <div class="notif-content">
              <p>${n.msg}</p>
              <span class="notif-date" style="font-size:0.85em; opacity:0.8; display:block; margin-top:0.25rem;">${UI.fmtDate(n.date)}</span>
            </div>
          </div>`).join('')
      : UI.emptyState('🔔', 'All clear!', 'No pending alerts or due date reminders')}
      </div>
    </div>`;

  buildStudentLayout('dashboard', content);
}

// ── Student Profile ───────────────────
function renderStudentProfile() {
  const user = DB.getCurrentUser();
  const myTx = DB.getStudentTransactions(user.register_number);
  const issued = myTx.filter(t => t.status === 'issued' || t.status === 'overdue').length;
  const returned = myTx.filter(t => t.status === 'returned').length;

  const content = `
    <div class="admin-page">
      <div class="profile-header" style="background:var(--surface); border-radius:16px; padding:2rem; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.05); margin-bottom:2rem;">
        <div class="profile-avatar" style="width:80px; height:80px; background:linear-gradient(135deg,var(--primary),#56CCF2); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:2.5rem; font-weight:bold; margin:0 auto 1rem auto;">${user.name.charAt(0).toUpperCase()}</div>
        <h2 style="margin:0 0 0.5rem 0;">${user.name}</h2>
        <p style="color:var(--text-mod); margin:0 0 1rem 0;">🎓 ${user.department}</p>
        <span class="badge badge-blue">Student</span>
      </div>
      
      <div class="screen-body" style="padding: 0;">
        <div class="profile-stats" style="display:flex; justify-content:space-around; background:var(--surface); border-radius:16px; padding:1.5rem; box-shadow:0 4px 12px rgba(0,0,0,0.03); margin-bottom:2rem;">
          <div class="ps-item" style="text-align:center;"><div class="ps-val" style="font-size:1.8rem; font-weight:700; color:var(--primary);">${issued}</div><div class="ps-label" style="font-size:0.9rem; color:var(--text-mod);">Active</div></div>
          <div class="ps-item" style="text-align:center;"><div class="ps-val" style="font-size:1.8rem; font-weight:700; color:var(--green);">${returned}</div><div class="ps-label" style="font-size:0.9rem; color:var(--text-mod);">Returned</div></div>
          <div class="ps-item" style="text-align:center;"><div class="ps-val" style="font-size:1.8rem; font-weight:700;">${myTx.length}</div><div class="ps-label" style="font-size:0.9rem; color:var(--text-mod);">Total</div></div>
        </div>

        <div class="profile-info-card" style="background:var(--surface); border-radius:16px; padding:2rem; box-shadow:0 4px 12px rgba(0,0,0,0.03); margin-bottom:2rem;">
          <h3 style="margin:0 0 1.5rem 0;">Personal Information</h3>
          <div class="pi-row" style="display:flex; justify-content:space-between; padding:1rem 0; border-bottom:1px solid var(--border);"><span class="pi-label" style="color:var(--text-mod);"><span style="margin-right:8px;">📧</span> Email</span><span class="pi-val" style="font-weight:500;">${user.email}</span></div>
          <div class="pi-row" style="display:flex; justify-content:space-between; padding:1rem 0; border-bottom:1px solid var(--border);"><span class="pi-label" style="color:var(--text-mod);"><span style="margin-right:8px;">📱</span> Phone</span><span class="pi-val" style="font-weight:500;">${user.phone}</span></div>
          <div class="pi-row" style="display:flex; justify-content:space-between; padding:1rem 0; border-bottom:1px solid var(--border);"><span class="pi-label" style="color:var(--text-mod);"><span style="margin-right:8px;">🏫</span> Department</span><span class="pi-val" style="font-weight:500;">${user.department}</span></div>
          <div class="pi-row" style="display:flex; justify-content:space-between; padding:1rem 0; border-bottom:1px solid var(--border);"><span class="pi-label" style="color:var(--text-mod);"><span style="margin-right:8px;">📅</span> Joined</span><span class="pi-val" style="font-weight:500;">${UI.fmtDate(user.joined)}</span></div>
          <div class="pi-row" style="display:flex; justify-content:space-between; padding:1rem 0;"><span class="pi-label" style="color:var(--text-mod);"><span style="margin-right:8px;">🆔</span> Register No.</span><span class="pi-val" style="font-family:monospace;font-size:0.85em; background:rgba(0,0,0,0.05); padding:4px 8px; border-radius:4px;">${user.register_number}</span></div>
        </div>
      </div>
    </div>`;

  buildStudentLayout('profile', content);
}

// ── Utilities ─────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

function bookGradient(category) {
  const grads = {
    Science: 'linear-gradient(135deg,#1a6b3a,#27AE60)',
    Technology: 'linear-gradient(135deg,#1565C0,#2F80ED)',
    Engineering: 'linear-gradient(135deg,#5D4037,#8D6E63)',
    Mathematics: 'linear-gradient(135deg,#6A1B9A,#9C27B0)',
    Literature: 'linear-gradient(135deg,#BF360C,#FF7043)',
    History: 'linear-gradient(135deg,#827717,#F9A825)',
    Philosophy: 'linear-gradient(135deg,#4A148C,#7B1FA2)',
    Arts: 'linear-gradient(135deg,#880E4F,#E91E63)',
    Medicine: 'linear-gradient(135deg,#B71C1C,#EB5757)',
    Law: 'linear-gradient(135deg,#1B5E20,#388E3C)',
    Economics: 'linear-gradient(135deg,#0D47A1,#1976D2)',
    Other: 'linear-gradient(135deg,#37474F,#607D8B)',
  };
  return grads[category] || grads.Other;
}

// ── Motivation Videos ─────────────────
function renderMotivationVideos() {
  const content = `
    <div class="admin-page">
      <div class="admin-page-header">
        <h2>Motivation Videos</h2>
        <p>Watch inspiring content to stay focused</p>
      </div>
      <div class="screen-body" style="padding: 0;">
        <div class="video-grid" style="margin-top: 1.5rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
          ${[
      { title: "The Power of Believing You Can Improve", author: "Ms. Dhoni Leaves Audience SPEECHLESS | Every Indian Must Watch This | Tribute to Ms. Dhoni | CSK", tag: "Growth Mindset", duration: "10:24", source: "TED", videoId: "ttV9Axj2qTU" },
      { title: "Grit: The Power of Passion and Perseverance", author: "Angela Lee Duckworth explains that the secret to success is not talent but a blend of passion and persistence.", tag: "Perseverance", duration: "6:12", source: "TED", videoId: "H14bBuluwB8" },
      { title: "How to Stop Screwing Yourself Over", author: "Mel Robbins shares a simple strategy to get what you want and stop holding yourself back.", tag: "Motivation", duration: "21:40", source: "TEDx", videoId: "Lp7E973zozc" },
      { title: "Inside the Mind of a Master Procrastinator", author: "Tim Urban takes us on a hilarious journey about the procrastinator's mind and the Panic Monster.", tag: "Productivity", duration: "14:04", source: "TED", videoId: "arj7oStGLkU" },
      { title: "The Secret to Self Control", author: "Jonathan Bricker reveals the surprising science-backed way to build real self-control habits.", tag: "Self-Control", duration: "14:37", source: "TEDx", videoId: "tTb3d5cjSFI" },
      { title: "Developing a Growth Mindset | Carol Dweck", author: "This inspiring talk covers how even simple words of encouragement can change how we learn and grow.", tag: "Study Tips", duration: "9:58", source: "Stanford", videoId: "hiiEeMN7vbQ" }
    ].map(v => `
            <div class="video-card" onclick="openMotivationVideo('${v.videoId}')" style="cursor: pointer; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s;">
              <div class="video-wrapper" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; background: #000;">
                <img src="https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.8;" alt="${v.title}">
                <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
                  <div style="width: 60px; height: 60px; background: rgba(255, 0, 0, 0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(255,0,0,0.4);">
                    <svg viewBox="0 0 24 24" fill="white" width="30" height="30" style="margin-left: 4px;"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
              </div>
              <div class="video-info" style="padding: 1.25rem; flex: 1; display: flex; flex-direction: column;">
                <h4 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; line-height: 1.4;">${v.title}</h4>
                <p style="color: var(--text-mod); font-size: 0.9rem; line-height: 1.5; margin: 0 0 1rem 0; flex: 1;">${v.author}</p>
                <div class="video-meta" style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--text-mod);">
                  <span style="background: rgba(47,128,237,0.1); color: var(--primary); padding: 4px 10px; border-radius: 12px; font-weight: 500;">🏷️ ${v.tag}</span>
                  <span>⏱ ${v.duration} | ${v.source}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    
    <!-- Fullscreen Video Modal -->
    <div id="videoModalOverlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 10000; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
      <button id="closeVideoBtn" style="position: absolute; top: 30px; right: 30px; background: #ff4757; color: white; border: none; border-radius: 8px; padding: 12px 24px; font-weight: bold; cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4); transition: transform 0.2s;">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        Exit Video
      </button>
      <div style="width: 90%; max-width: 1000px; aspect-ratio: 16/9; background: #000; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
        <iframe id="videoModalIframe" style="width: 100%; height: 100%; border: 0;" allow="autoplay; encrypted-media" allowfullscreen></iframe>
      </div>
    </div>`;

  buildStudentLayout('motivation', content);

  // Setup modal close behavior
  const closeBtn = document.getElementById('closeVideoBtn');
  if (closeBtn) {
    closeBtn.onclick = () => {
      document.getElementById('videoModalOverlay').style.display = 'none';
      document.getElementById('videoModalIframe').src = ''; // Clear source to stop playback
    };
  }
}

// Global function so it can be called from onclick strings in the HTML
window.openMotivationVideo = (videoId) => {
  const modal = document.getElementById('videoModalOverlay');
  const iframe = document.getElementById('videoModalIframe');
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  modal.style.display = 'flex';
};

// ── Question Papers Data ────────────────
const QUESTION_PAPERS = [
  {
    semester: "Semester I",
    papers: [

      { code: "22EYA01", title: "Professional Communication - I", image: "images/22EYA01.jpg" },
      { code: "22MYB01", title: "Calculus and Linear Algebra", image: "images/22MYB01.jpg" },
      { code: "22PYB01", title: "Semiconductor Physics", image: "images/22PYB01.jpg" },
      { code: "22ECC01", title: "Basics of Electronics Engineering", image: "images/22ECC01.jpg" },
      { code: "22CSC01", title: "Problem Solving and C Programming", image: "images/22CSC01.jpg" },
      { code: "22GYA01", title: "Heritage of Tamils", image: "images/22GYA01.jpg" }
    ]
  },
  {
    semester: "Semester II",
    papers: [
      { code: "22EYA02", title: "Professional Communication - II", image: "images/22EYA02.jpg" },
      { code: "22MYB03", title: "Statistics and Numerical Methods", image: "images/22MYB03.jpg" },
      { code: "22CSC02", title: "Data Structures using C", image: "images/22CSC02.jpg" },
      { code: "22CSC03", title: "Python Programming", image: "images/22CSC03.jpg" },
      { code: "22CSC04", title: "Digital Principles and Computer Organization", image: "images/22CSC04.jpg" },
      { code: "22GYA02", title: "Tamils and Technology", image: "images/22GYA02.jpg" }
    ]
  },
  {
    semester: "Semester III",
    papers: [
      { code: "22MYB05", title: "Discrete Mathematics", image: "images/22MYB05.jpg" },
      { code: "22CSC05", title: "Algorithms", image: "images/22CSC05.jpg" },
      { code: "22CSC06", title: "Computer Networks", image: "images/22CSC06.jpg" },
      { code: "22CSC07", title: "Java Programming", image: "images/22CSC07.jpg" },
      { code: "22CSC08", title: "Operating Systems", image: "images/22CSC08.jpg" }
    ]
  },
  {
    semester: "Semester IV",
    papers: [
      { code: "22CSC09", title: "Artificial Intelligence and Machine Learning", image: "images/22CSC09.jpg" },
      { code: "22CSC10", title: "Theory of Computation", image: "images/22CSC10.jpg" },
      { code: "22CSC11", title: "Database Management System", image: "images/22CSC11.jpg" },
      { code: "22CSC12", title: "Advanced Java Programming", image: "images/22CSC12.jpg" },
      { code: "22CSC13", title: "Foundations of Data Science", image: "images/22CSC13.jpg" },
      { code: "22CYB07", title: "Environmental Science and Engineering", image: "images/22CYB07.jpg" }
    ]
  },
  {
    semester: "Semester V",
    papers: [
      { code: "22CSC14", title: "Principles of Compiler Design", image: "images/22CSC14.jpg" },
      { code: "22CSC15", title: "Full Stack Development", image: "images/22CSC15.jpg" },
      { code: "22CSC16", title: "Object Oriented Software Engineering", image: "images/22CSC16.jpg" },
      { code: "E1", title: "Elective (PEC)", image: "images/E1.jpg" },
      { code: "E2", title: "Elective (PEC)", image: "images/E2.jpg" },
      { code: "E3", title: "Elective (OEC/PEC)", image: "images/E3.jpg" }
    ]
  },
  {
    semester: "Semester VI",
    papers: [
      { code: "22CSC17", title: "Internet of Things and its Applications", image: "images/22CSC17.jpg" },
      { code: "22CSC18", title: "Mobile Application Development", image: "images/22CSC18.jpg" },
      { code: "E4", title: "Elective (PEC)", image: "images/E4.jpg" },
      { code: "E5", title: "Elective (PEC)", image: "images/E5.jpg" },
      { code: "E6", title: "Elective (OEC)", image: "images/E6.jpg" },
      { code: "E7", title: "Elective (OEC/PEC)", image: "images/E7.jpg" }
    ]
  },
  {
    semester: "Semester VII",
    papers: [
      { code: "22GEA01", title: "Universal Human Values", image: "images/22GEA01.jpg" },
      { code: "EM", title: "Elective (Management)", image: "images/EM.jpg" },
      { code: "E8", title: "Elective (PEC)", image: "images/E8.jpg" },
      { code: "E9", title: "Elective (OEC/PEC)", image: "images/E9.jpg" },
      { code: "E10", title: "Elective (OEC)", image: "images/E10.jpg" }
    ]
  },
  {
    semester: "Semester VIII",
    papers: [
      { code: "22CSD01", title: "Project Work", image: "images/22CSD01.jpg" }
    ]
  }
];

// ── Question Papers Screen ──────────────
async function renderQuestionPapers() {
  // Show loading state first
  buildStudentLayout('papers', `
    <div class="admin-page">
      <div class="admin-page-header">
        <h2>Model Question Papers</h2>
        <p>Access question papers by semester</p>
      </div>
      <div style="text-align:center; padding:3rem 0; color:var(--text-mod);">⏳ Loading papers…</div>
    </div>`);

  // Fetch from API
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

  const content = `
    <div class="admin-page">
      <div class="admin-page-header">
        <h2>Model Question Papers</h2>
        <p>${papers.length} paper(s) available across ${sortedKeys.length} semester(s)</p>
      </div>
      <div class="screen-body" style="padding: 0;">
        ${papers.length === 0 ? `
          <div style="text-align:center; padding:3rem 0;">
            <div style="font-size:3rem;">📄</div>
            <p style="color:var(--text-mod); margin-top:1rem;">No question papers available yet. Check back later.</p>
          </div>` : ''}
        ${sortedKeys.map(sem => `
          <div class="semester-section" style="margin-bottom: 2.5rem;">
            <h3 style="margin-bottom: 1.25rem; font-size: 1.3rem; border-left: 4px solid var(--primary); padding-left: 12px; color: var(--text);">${sem}</h3>
            <div class="papers-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem;">
              ${grouped[sem].map(p => {
                const imgs = Array.isArray(p.images) ? p.images : [];
                return `
                <div class="paper-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; box-shadow: var(--card-shadow); transition: transform 0.2s;">
                  <div style="display: flex; flex-direction: column; gap: 0.5rem; flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border); padding-bottom: 0.4rem;">
                      <span style="font-size: 0.75rem; color: var(--text-mod); font-weight: 600; text-transform: uppercase;">Subject Code</span>
                      <span style="background: rgba(47,128,237,0.1); color: var(--primary); padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 0.85rem; font-family: monospace;">${p.code || 'N/A'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border); padding-bottom: 0.4rem;">
                      <span style="font-size: 0.75rem; color: var(--text-mod); font-weight: 600; text-transform: uppercase;">Exam Type</span>
                      <span style="background: rgba(46,204,113,0.1); color: #2ecc71; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 0.85rem;">${p.exam_type || 'SEM'}</span>
                    </div>
                    <div style="margin-top: 0.15rem;">
                      <span style="font-size: 0.75rem; color: var(--text-mod); font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 0.25rem;">Subject Title</span>
                      <h4 style="font-size: 1rem; line-height: 1.3; margin:0; color: var(--text); font-weight: 600;">${p.title}</h4>
                    </div>
                  </div>
                  <button class="btn btn-outline btn-sm btn-full paper-open-btn"
                    style="margin-top: auto; padding: 0.5rem; font-size: 0.85rem;"
                    data-code="${p.code}"
                    data-title="${p.title.replace(/"/g,'&quot;')}"
                    data-images='${JSON.stringify(imgs.map(i=>i.image_path))}'>
                    🔍 Open Question Paper
                  </button>
                </div>`;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;

  buildStudentLayout('papers', content);

  document.querySelectorAll('.paper-open-btn').forEach(btn => {
    btn.onclick = () => Router.navigate('view-paper', {
      code:   btn.dataset.code,
      title:  btn.dataset.title,
      images: JSON.parse(btn.dataset.images || '[]')
    });
  });
}


// ── Paper View Screen ───────────────────
function renderPaperView({ code, title, images }) {
  // images is an array of image URL strings
  const imgs = Array.isArray(images) ? images.filter(Boolean) : [];

  // Helper to render the right viewer for each file type
  function _pgViewer(src) {
    if (/\.pdf$/i.test(src))   return `<embed src="${src}" type="application/pdf" style="width:100%;height:85vh;border:none;"/>`;
    if (/\.(docx?)$/i.test(src)) return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:3rem;background:transparent;"><span style="font-size:4rem;">📝</span><p style="color:var(--text);font-size:1.1rem;">DOC/DOCX preview is not supported in browser.</p><a href="${src}" download style="background:#2F80ED;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">⬇ Download File</a></div>`;
    return `<img src="${src}" style="max-width:100%;max-height:85vh;border:none;box-shadow:none;object-fit:contain;" alt="Question Paper"/>`;
  }
  function _pgThumb(src, i, active) {
    const border = active ? '#2F80ED' : '#ddd';
    if (/\.pdf$/i.test(src))     return `<div data-idx="${i}" class="pg-thumb" style="width:64px;height:64px;border-radius:6px;border:2px solid ${border};cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#fff4f4;font-size:1.5rem;" title="PDF">📄</div>`;
    if (/\.(docx?)$/i.test(src)) return `<div data-idx="${i}" class="pg-thumb" style="width:64px;height:64px;border-radius:6px;border:2px solid ${border};cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#f0f4ff;font-size:1.5rem;" title="DOC">📝</div>`;
    return `<img data-idx="${i}" class="pg-thumb" src="${src}" style="width:64px;height:64px;object-fit:cover;border-radius:6px;border:2px solid ${border};cursor:pointer;flex-shrink:0;transition:border-color 0.2s;" alt="Page ${i+1}"/>`;
  }

  const galleryHTML = imgs.length ? `
    <div id="paperGallery" style="position:relative;">
      <!-- Main viewer -->
      <div id="pgMainWrap" style="text-align:center; margin-top:1rem; position:relative;">
        ${_pgViewer(imgs[0])}
        ${imgs.length > 1 ? `
        <div style="display:flex;justify-content:space-between;margin-top:10px;">
          <button id="pgPrev" style="background:rgba(0,0,0,0.7);color:#fff;border:none;border-radius:6px;padding:10px 18px;cursor:pointer;font-size:1.1rem;">‹ Prev</button>
          <span id="pgCounter" style="align-self:center;font-size:0.85rem;color:#555;">1 / ${imgs.length}</span>
          <button id="pgNext" style="background:rgba(0,0,0,0.7);color:#fff;border:none;border-radius:6px;padding:10px 18px;cursor:pointer;font-size:1.1rem;">Next ›</button>
        </div>` : ''}
      </div>
      <!-- Thumbnail strip -->
      ${imgs.length > 1 ? `
      <div style="display:flex;gap:8px;margin-top:12px;overflow-x:auto;padding-bottom:4px;">
        ${imgs.map((src, i) => _pgThumb(src, i, i===0)).join('')}
      </div>` : ''}
    </div>` : `
    <!-- Fallback generated paper -->
    <div class="paper-section" style="margin-bottom: 2rem;">
      <h3 style="text-align: center; text-decoration: underline; margin-bottom: 1rem;">PART - A (10 x 2 = 20 Marks)</h3>
      <p style="text-align: center; font-style: italic; margin-bottom: 1.5rem;">Answer ALL Questions</p>
      <ol style="padding-left: 2rem;">
        ${Array.from({ length: 10 }).map((_, i) => `<li style="margin-bottom: 12px;">Describe the fundamental principles of ${title.split(' ')[0]} in the context of ${code}.</li>`).join('')}
      </ol>
    </div>
    <div class="paper-section" style="margin-bottom: 2rem;">
      <h3 style="text-align: center; text-decoration: underline; margin-bottom: 1rem;">PART - B (5 x 13 = 65 Marks)</h3>
      <p style="text-align: center; font-style: italic; margin-bottom: 1.5rem;">Answer ALL Questions (Either - Or Type)</p>
      <ol start="11" style="padding-left: 2rem;">
        ${Array.from({ length: 5 }).map((_, i) => `
          <li style="margin-bottom: 20px;">
            (a) Explain in detail about the architecture and implementation of ${title}.
            <div style="text-align: center; margin: 10px 0; font-weight: bold;">(OR)</div>
            (b) Discuss the various challenges and solutions in ${title} with suitable diagrams.
          </li>
        `).join('')}
      </ol>
    </div>
    <div class="paper-section">
      <h3 style="text-align: center; text-decoration: underline; margin-bottom: 1rem;">PART - C (1 x 15 = 15 Marks)</h3>
      <p style="text-align: center; font-style: italic; margin-bottom: 1.5rem;">Case Study / Comprehensive Question</p>
      <ol start="16" style="padding-left: 2rem;">
        <li>Design a complete system based on the concepts of ${title} for a real-world scenario including all constraints and optimizations.</li>
      </ol>
    </div>`;

  const isImagePaper = imgs.length > 0;

  const viewerContent = `
    <div style="background: var(--bg); min-height: 100vh; padding: 1rem; display: flex; flex-direction: column;">
      <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; width: 100%; margin: 0 auto 1rem auto;">
        <button class="back-btn" onclick="Router.navigate('student-question-papers')" style="display: flex; align-items: center; gap: 8px; background: none; border: none; font-size: 1.1rem; font-weight: 600; cursor: pointer; color: var(--text);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Back
        </button>
        <div style="display: flex; gap: 1rem;">
          <button class="btn btn-outline btn-sm" onclick="window.print()">🖨️ Print</button>
          <button class="btn btn-primary btn-sm" onclick="UI.toast('Downloading started...', 'info')">📥 Download</button>
        </div>
      </div>
      
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; margin: 0 auto; ${!isImagePaper ? `background: white; color: #000; padding: 3rem; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); font-family: 'Times New Roman', serif; position: relative; max-width: 800px;` : 'max-width: 1200px;'}">
        ${!isImagePaper ? `
        <!-- Watermark -->
        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 8rem; color: rgba(0,0,0,0.03); transform: rotate(-45deg); pointer-events: none; user-select: none;">SMART LIBRARY</div>
        <div style="width: 100%;">
          <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
            <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem; text-transform: uppercase;">Model Question Paper</h1>
            <h2 style="font-size: 1.2rem; margin-bottom: 1rem;">${title} (${code})</h2>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 0.9rem;">
              <span>Time: 3 Hours</span>
              <span>Max Marks: 100</span>
            </div>
          </div>
          ${galleryHTML}
        </div>` : `<div style="width: 100%; text-align: center;">${galleryHTML}</div>`}
      </div>
    </div>`;

  if (isImagePaper) {
    document.getElementById('app').innerHTML = viewerContent;
  } else {
    buildStudentLayout('papers', `
      <div class="admin-page" style="padding: 0;">
        <div class="paper-viewer-wrapper" style="width: 100%;">
          ${viewerContent}
        </div>
      </div>`);
  }

  // Gallery interactivity
  if (imgs.length > 1) {
    let current = 0;
    const wrap    = document.getElementById('pgMainWrap');
    const counter = document.getElementById('pgCounter');
    const thumbs  = document.querySelectorAll('.pg-thumb');

    function goTo(i) {
      thumbs[current].style.borderColor = '#ddd';
      current = (i + imgs.length) % imgs.length;

      // Rebuild main viewer content for new file
      const src = imgs[current];
      let viewerHTML;
      if (/\.pdf$/i.test(src))        viewerHTML = `<embed src="${src}" type="application/pdf" style="width:100%;height:85vh;border:none;"/>`;
      else if (/\.(docx?)$/i.test(src)) viewerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:3rem;background:transparent;"><span style="font-size:4rem;">📝</span><p style="color:var(--text);font-size:1.1rem;">DOC/DOCX preview is not supported.</p><a href="${src}" download style="background:#2F80ED;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">⬇ Download File</a></div>`;
      else viewerHTML = `<img src="${src}" style="max-width:100%;max-height:85vh;border:none;box-shadow:none;object-fit:contain;" alt="Page ${current+1}"/>`;

      // Replace only the first child (the viewer), keep the nav buttons
      const firstChild = wrap.firstElementChild;
      const temp = document.createElement('div');
      temp.innerHTML = viewerHTML;
      wrap.replaceChild(temp.firstElementChild, firstChild);

      counter.textContent = `${current + 1} / ${imgs.length}`;
      thumbs[current].style.borderColor = '#2F80ED';
      thumbs[current].scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }

    document.getElementById('pgPrev').onclick = () => goTo(current - 1);
    document.getElementById('pgNext').onclick = () => goTo(current + 1);
    thumbs.forEach(th => {
      th.onclick = () => goTo(parseInt(th.dataset.idx));
    });
  }
}

// ── E-Books Screen ────────────────────
async function renderEbooks() {
  // Show loading skeleton first
  buildStudentLayout('ebooks', `
    <div class="admin-page">
      <div class="admin-page-header">
        <h2>📖 E-Books Library</h2>
        <p>Loading e-books…</p>
      </div>
      <div style="text-align:center;padding:3rem 0;color:var(--text-mod);">⏳ Loading…</div>
    </div>`);

  // Fetch ebooks from API
  let ebooks = [];
  try {
    const res = await fetch('/api/ebooks', {
      headers: { 'Authorization': `Bearer ${DB.getToken()}` }
    });
    ebooks = await res.json();
    if (!Array.isArray(ebooks)) ebooks = [];
  } catch (e) { ebooks = []; }

  // Derive unique categories
  const cats = ['All', ...new Set(ebooks.map(e => e.category).filter(Boolean))].sort((a, b) => a === 'All' ? -1 : a.localeCompare(b));

  function fmtSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function fileIcon(name) {
    if (!name) return '📄';
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📕';
    if (ext === 'epub') return '📗';
    if (ext === 'docx' || ext === 'doc') return '📘';
    return '📄';
  }

  function fileTypeBadge(name) {
    const ext = (name || '').split('.').pop().toUpperCase();
    const colors = { PDF: '#EB5757', EPUB: '#27AE60', DOCX: '#2F80ED', DOC: '#2F80ED' };
    const bg = colors[ext] || '#607D8B';
    return `<span style="background:${bg};color:#fff;font-size:0.7rem;font-weight:700;padding:2px 7px;border-radius:4px;letter-spacing:0.5px;">${ext}</span>`;
  }

  const ebookGrad = (cat) => {
    const g = {
      Science: 'linear-gradient(135deg,#1a6b3a,#27AE60)',
      Technology: 'linear-gradient(135deg,#1565C0,#2F80ED)',
      Engineering: 'linear-gradient(135deg,#5D4037,#8D6E63)',
      Mathematics: 'linear-gradient(135deg,#6A1B9A,#9C27B0)',
      Literature: 'linear-gradient(135deg,#BF360C,#FF7043)',
      History: 'linear-gradient(135deg,#827717,#F9A825)',
      Philosophy: 'linear-gradient(135deg,#4A148C,#7B1FA2)',
      Arts: 'linear-gradient(135deg,#880E4F,#E91E63)',
      Medicine: 'linear-gradient(135deg,#B71C1C,#EB5757)',
      Law: 'linear-gradient(135deg,#1B5E20,#388E3C)',
      Economics: 'linear-gradient(135deg,#0D47A1,#1976D2)',
    };
    return g[cat] || 'linear-gradient(135deg,#00695c,#26a69a)';
  };

  function renderCards(list) {
    if (!list.length) {
      return `<div style="text-align:center;padding:3rem 0;">
        <div style="font-size:3rem;">📚</div>
        <p style="color:var(--text-mod);margin-top:1rem;">No e-books found.</p>
      </div>`;
    }
    return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.25rem;margin-top:1.25rem;">
      ${list.map(eb => `
        <div class="ebook-card" data-path="${eb.file_path}" data-name="${(eb.file_name||'').replace(/"/g,'&quot;')}"
          style="background:var(--surface);border:1px solid var(--border);border-radius:14px;overflow:hidden;display:flex;flex-direction:column;
                 box-shadow:0 4px 16px rgba(0,0,0,0.07);transition:transform 0.2s,box-shadow 0.2s;cursor:pointer;"
          onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 28px rgba(0,0,0,0.13)'"
          onmouseout="this.style.transform='';this.style.boxShadow='0 4px 16px rgba(0,0,0,0.07)'">
          <!-- Cover -->
          <div style="height:110px;background:${ebookGrad(eb.category)};display:flex;align-items:center;justify-content:center;font-size:3rem;position:relative;">
            ${fileIcon(eb.file_name)}
            <span style="position:absolute;top:10px;right:10px;">${fileTypeBadge(eb.file_name)}</span>
          </div>
          <!-- Info -->
          <div style="padding:1rem;flex:1;display:flex;flex-direction:column;gap:0.35rem;">
            <div style="font-weight:700;font-size:1rem;line-height:1.35;color:var(--text);">${eb.title}</div>
            <div style="font-size:0.85rem;color:var(--text-mod);">✍️ ${eb.author}</div>
            <div style="font-size:0.78rem;background:rgba(47,128,237,0.1);color:var(--primary);padding:2px 8px;border-radius:10px;display:inline-block;margin-top:2px;width:fit-content;">${eb.category}</div>
            ${eb.description ? `<div style="font-size:0.82rem;color:var(--text-mod);margin-top:4px;line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${eb.description}</div>` : ''}
            <div style="font-size:0.78rem;color:var(--text-mod);margin-top:auto;padding-top:0.5rem;">${fmtSize(eb.file_size)}</div>
          </div>
          <!-- Actions -->
          <div style="display:flex;gap:0.5rem;padding:0.75rem 1rem;border-top:1px solid var(--border);">
            <a href="${eb.file_path}" target="_blank" rel="noopener"
              style="flex:1;text-align:center;padding:0.45rem;border-radius:8px;font-size:0.85rem;font-weight:600;
                     background:rgba(47,128,237,0.12);color:var(--primary);text-decoration:none;transition:background 0.2s;"
              onmouseover="this.style.background='rgba(47,128,237,0.22)'" onmouseout="this.style.background='rgba(47,128,237,0.12)'">
              👁 Read
            </a>
            <a href="${eb.file_path}" download="${eb.file_name || 'ebook'}"
              style="flex:1;text-align:center;padding:0.45rem;border-radius:8px;font-size:0.85rem;font-weight:600;
                     background:rgba(39,174,96,0.12);color:#27AE60;text-decoration:none;transition:background 0.2s;"
              onmouseover="this.style.background='rgba(39,174,96,0.22)'" onmouseout="this.style.background='rgba(39,174,96,0.12)'">
              ⬇ Download
            </a>
          </div>
        </div>`).join('')}
    </div>`;
  }

  const content = `
    <div class="admin-page">
      <div class="admin-page-header">
        <h2>📖 E-Books Library</h2>
        <p>${ebooks.length} e-book${ebooks.length !== 1 ? 's' : ''} available</p>
      </div>
      <div class="screen-body" style="padding:0;">
        <!-- Search -->
        <div class="search-bar-wrap" style="margin-bottom:1rem;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="ebookSearch" placeholder="Search title or author…"/>
          <button class="clear-btn" id="ebookClearSearch" style="display:none;">✕</button>
        </div>
        <!-- Category chips -->
        <div class="category-scroll" id="ebookCatScroll">
          ${cats.map(c => `<button class="cat-chip ${c === 'All' ? 'active' : ''}" data-cat="${c}">${c === 'All' ? '📚 All' : c}</button>`).join('')}
        </div>
        <!-- Cards container -->
        <div id="ebookList">${renderCards(ebooks)}</div>
      </div>
    </div>`;

  buildStudentLayout('ebooks', content);

  // Filter logic
  let query = '', selCat = 'All';
  function applyFilter() {
    const q = query.toLowerCase();
    const filtered = ebooks.filter(eb => {
      const matchCat = selCat === 'All' || eb.category === selCat;
      const matchQ = !q || (eb.title || '').toLowerCase().includes(q) || (eb.author || '').toLowerCase().includes(q);
      return matchCat && matchQ;
    });
    document.getElementById('ebookList').innerHTML = renderCards(filtered);
  }

  const searchEl = document.getElementById('ebookSearch');
  const clearEl  = document.getElementById('ebookClearSearch');
  searchEl.oninput = () => {
    query = searchEl.value.trim();
    clearEl.style.display = query ? 'flex' : 'none';
    applyFilter();
  };
  clearEl.onclick = () => { query = ''; searchEl.value = ''; clearEl.style.display = 'none'; applyFilter(); };

  document.getElementById('ebookCatScroll').querySelectorAll('.cat-chip').forEach(chip => {
    chip.onclick = () => {
      document.querySelectorAll('#ebookCatScroll .cat-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selCat = chip.dataset.cat;
      applyFilter();
    };
  });
}

// ── CGPA Calculator ───────────────────
function renderCGPACalculator() {
  const content = `
    <div class="admin-page">
      <div class="admin-page-header">
        <h2>🎯 GPA & CGPA Calculator</h2>
        <p>Calculate your academic performance</p>
      </div>
      <div class="screen-body" style="padding: 0;">
        <div class="tab-bar border-box-tabs" style="margin-bottom: 1.5rem">
          <button class="tab-btn active" id="tabCurriculum" style="font-weight: 800; text-transform: uppercase;">GPA CALCULATOR</button>
          <button class="tab-btn" id="tabSimple" style="font-weight: 800; text-transform: uppercase;">CGPA CALCULATOR</button>
        </div>
        <div id="cgpaCalculatorContent"></div>
      </div>
    </div>`;

  buildStudentLayout('cgpa', content);

  const curriculumBtn = document.getElementById('tabCurriculum');
  const simpleBtn = document.getElementById('tabSimple');

  curriculumBtn.onclick = () => {
    curriculumBtn.classList.add('active');
    simpleBtn.classList.remove('active');
    renderCurriculumCalculator();
  };

  simpleBtn.onclick = () => {
    simpleBtn.classList.add('active');
    curriculumBtn.classList.remove('active');
    renderSimpleCalculator();
  };

  // Default
  renderCurriculumCalculator();
}

function renderCurriculumCalculator() {
  const container = document.getElementById('cgpaCalculatorContent');
  if (!container) return;
  const GRADE_MAP = [
    { grade: 'O',  points: 10, label: 'O  – Outstanding (10)' },
    { grade: 'A+', points: 9,  label: 'A+ – Excellent (9)' },
    { grade: 'A',  points: 8,  label: 'A  – Very Good (8)' },
    { grade: 'B+', points: 7,  label: 'B+ – Good (7)' },
    { grade: 'B',  points: 6,  label: 'B  – Average (6)' },
    { grade: 'C',  points: 5,  label: 'C  – Satisfactory (5)' },
    { grade: 'U',  points: 0,  label: 'U  – Reappearance (0)' },
  ];

  const SEM1_SUBJECTS = [
    { code: '22EYA01', name: 'Professional Communication - I', credits: 3, category: 'HSMC', type: 'Theory' },
    { code: '22MYB01', name: 'Calculus and Linear Algebra', credits: 4, category: 'BSC', type: 'Theory' },
    { code: '22PYB01', name: 'Semiconductor Physics', credits: 3, category: 'BSC', type: 'Theory' },
    { code: '22ECC01', name: 'Basics of Electronics Engineering', credits: 3, category: 'ESC', type: 'Theory' },
    { code: '22CSC01', name: 'Problem Solving and C Programming', credits: 3, category: 'ESC', type: 'Theory' },
    { code: '22GYA01', name: '\u0ba4\u0bae\u0bbf\u0bb4\u0bb0\u0bcd \u0bae\u0bb0\u0baa\u0bc1 / Heritage of Tamils', credits: 1, category: 'HSMC', type: 'Theory' },
    { code: '22ECP01', name: 'Basics of Electronics Engg. Lab', credits: 2, category: 'ESC', type: 'Practical' },
    { code: '22CSP01', name: 'Problem Solving and C Programming Lab', credits: 2, category: 'ESC', type: 'Practical' },
    { code: '22PYP01', name: 'Physics Laboratory', credits: 1, category: 'BSC', type: 'Practical' },
  ];
  const SEM2_SUBJECTS = [
    { code: '22EYA02', name: 'Professional Communication - II', credits: 3, category: 'HSMC', type: 'Theory' },
    { code: '22MYB03', name: 'Statistics and Numerical Methods', credits: 4, category: 'BSC', type: 'Theory' },
    { code: '22CSC02', name: 'Data Structures using C', credits: 3, category: 'ESC', type: 'Theory' },
    { code: '22CSC03', name: 'Python Programming', credits: 3, category: 'ESC', type: 'Theory' },
    { code: '22CSC04', name: 'Digital Principles and Computer Organization', credits: 3, category: 'ESC', type: 'Theory' },
    { code: '22GYA02', name: '\u0ba4\u0bae\u0bbf\u0bb4\u0bb0\u0bc1\u0bae\u0bcd \u0ba4\u0bca\u0bb4\u0bbf\u0bb2\u0bcd\u0ba8\u0bc1\u0b9f\u0bcd\u0baa\u0bae\u0bc1\u0bae\u0bcd / Tamils and Technology', credits: 1, category: 'HSMC', type: 'Theory' },
    { code: '22CSP02', name: 'Data Structures Laboratory', credits: 2, category: 'ESC', type: 'Practical' },
    { code: '22CSP03', name: 'Python Programming Laboratory', credits: 2, category: 'ESC', type: 'Practical' },
    { code: '22EYP01', name: 'Communication Skills Laboratory', credits: 1, category: 'HSMC', type: 'Practical' },
  ];
  const SEM3_SUBJECTS = [
    { code: '22MYB05', name: 'Discrete Mathematics', credits: 4, category: 'BSC', type: 'Theory' },
    { code: '22CSC05', name: 'Algorithms', credits: 3, category: 'PCC', type: 'Theory' },
    { code: '22CSC06', name: 'Computer Networks', credits: 3, category: 'PCC', type: 'Theory' },
    { code: '22CSC07', name: 'Java Programming', credits: 3, category: 'PCC', type: 'Theory' },
    { code: '22CSC08', name: 'Operating Systems', credits: 3, category: 'PCC', type: 'Theory' },
    { code: '22CSP04', name: 'Algorithms Laboratory', credits: 2, category: 'PCC', type: 'Practical' },
    { code: '22CSP05', name: 'Computer Networks Laboratory', credits: 2, category: 'PCC', type: 'Practical' },
    { code: '22CSP06', name: 'Java Programming Laboratory', credits: 2, category: 'PCC', type: 'Practical' },
  ];
  const SEM4_SUBJECTS = [
    { code: '22CSC09', name: 'Artificial Intelligence and Machine Learning', credits: 3, category: 'PCC', type: 'Theory' },
    { code: '22CSC10', name: 'Theory of Computation', credits: 4, category: 'PCC', type: 'Theory' },
    { code: '22CSC11', name: 'Database Management System', credits: 3, category: 'PCC', type: 'Theory' },
    { code: '22CSC12', name: 'Advanced Java Programming', credits: 3, category: 'PCC', type: 'Theory' },
    { code: '22CSC13', name: 'Foundations of Data Science', credits: 4, category: 'PCC', type: 'Theory' },
    { code: '22CYB07', name: 'Environmental Science and Engineering', credits: 3, category: 'BSC', type: 'Theory' },
    { code: '22CSP07', name: 'Database Management System Laboratory', credits: 2, category: 'PCC', type: 'Practical' },
    { code: '22CSP08', name: 'Advanced Java Programming Laboratory', credits: 2, category: 'PCC', type: 'Practical' },
  ];
  const SEM5_SUBJECTS = [
    { code: '22CSC14', name: 'Principles of Compiler Design', credits: 4, category: 'PCC', type: 'Theory' },
    { code: '22CSC15', name: 'Full Stack Development', credits: 3, category: 'PCC', type: 'Theory' },
    { code: '22CSC16', name: 'Object Oriented Software Engineering', credits: 3, category: 'PCC', type: 'Theory' },
    { code: 'E1', name: 'Elective (PEC)', credits: 3, category: 'PEC', type: 'Theory' },
    { code: 'E2', name: 'Elective (PEC)', credits: 3, category: 'PEC', type: 'Theory' },
    { code: 'E3', name: 'Elective (OEC/PEC)', credits: 3, category: 'PEC', type: 'Theory' },
    { code: '22CSP09', name: 'Full Stack Development Laboratory', credits: 2, category: 'PCC', type: 'Practical' },
    { code: '22CSP10', name: 'Object Oriented Software Engg. Lab', credits: 2, category: 'PCC', type: 'Practical' },
  ];
  const SEM6_SUBJECTS = [
    { code: '22CSC17', name: 'Internet of Things and its Applications', credits: 3, category: 'PCC', type: 'Theory' },
    { code: '22CSC18', name: 'Mobile Application Development', credits: 3, category: 'PCC', type: 'Theory' },
    { code: 'E4', name: 'Elective (PEC)', credits: 3, category: 'PEC', type: 'Theory' },
    { code: 'E5', name: 'Elective (PEC)', credits: 3, category: 'PEC', type: 'Theory' },
    { code: 'E6', name: 'Elective (OEC)', credits: 3, category: 'OEC', type: 'Theory' },
    { code: 'E7', name: 'Elective (OEC/PEC)', credits: 3, category: 'PEC', type: 'Theory' },
    { code: '22CSP11', name: 'IoT and its Applications Laboratory', credits: 2, category: 'PCC', type: 'Practical' },
    { code: '22CSP12', name: 'Mobile Application Development Lab', credits: 2, category: 'PCC', type: 'Practical' },
  ];
  const SEM7_SUBJECTS = [
    { code: '22GEA01', name: 'Universal Human Values', credits: 2, category: 'HSMC', type: 'Theory' },
    { code: 'EM', name: 'Elective (Management)', credits: 3, category: 'HSMC', type: 'Theory' },
    { code: 'E8', name: 'Elective (PEC)', credits: 3, category: 'PEC', type: 'Theory' },
    { code: 'E9', name: 'Elective (OEC/PEC)', credits: 3, category: 'PEC', type: 'Theory' },
    { code: 'E10', name: 'Elective (OEC)', credits: 3, category: 'OEC', type: 'Theory' },
    { code: '22GED02', name: 'Internship / Industrial Training', credits: 2, category: 'EEC', type: 'Practical' },
  ];
  const SEM8_SUBJECTS = [
    { code: '22CSD01', name: 'Project Work', credits: 10, category: 'EEC', type: 'Practical' },
  ];

  const ALL_SEMS = { 1: SEM1_SUBJECTS, 2: SEM2_SUBJECTS, 3: SEM3_SUBJECTS, 4: SEM4_SUBJECTS, 5: SEM5_SUBJECTS, 6: SEM6_SUBJECTS, 7: SEM7_SUBJECTS, 8: SEM8_SUBJECTS };
  const SEM_ROMAN = ['I','II','III','IV','V','VI','VII','VIII'];

  function catColor(cat) {
    return ({ 'HSMC':'#9B59B6','BSC':'#2ECC71','ESC':'#3498DB','PCC':'#E67E22','PEC':'#1ABC9C','OEC':'#2980B9','EEC':'#E74C3C','MC':'#95A5A6' })[cat] || '#7F8C8D';
  }
  function catBg(cat) {
    return ({ 'HSMC':'rgba(155,89,182,0.1)','BSC':'rgba(46,204,113,0.1)','ESC':'rgba(52,152,219,0.1)','PCC':'rgba(230,126,34,0.1)','PEC':'rgba(26,188,156,0.1)','OEC':'rgba(41,128,185,0.1)','EEC':'rgba(231,76,60,0.1)','MC':'rgba(149,165,166,0.1)' })[cat] || 'rgba(127,140,141,0.1)';
  }

  // State: saved grades per semester (Load from localStorage if available)
  const STORAGE_KEY = `sl_cgpa_grades_${DB.getCurrentUser()?.register_number}`;
  let semGrades = {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) semGrades = JSON.parse(saved);
  } catch (e) {}

  // Initialize missing sems
  for (let i = 1; i <= 8; i++) {
    if (!semGrades[i]) semGrades[i] = ALL_SEMS[i].map(() => '10');
  }

  function saveGrades() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(semGrades));
  }

  const gradeOptions = GRADE_MAP.map(g => `<option value="${g.points}">${g.label}</option>`).join('');

  // ─── VIEW 1: Semester List ───
  function renderSemesterList() {
    // Calculate total CGPA
    let totalWeight = 0, totalCredits = 0, semestersCounted = 0;
    const semResults = {};

    for (let s = 1; s <= 8; s++) {
      let sw = 0, sc = 0, hasValid = false;
      ALL_SEMS[s].forEach((sub, idx) => {
        const g = parseFloat(semGrades[s][idx]);
        if (!isNaN(g)) {
          sw += sub.credits * g;
          sc += sub.credits;
          hasValid = true;
        }
      });
      if (sc > 0) {
        semResults[s] = sw / sc;
        totalWeight += sw;
        totalCredits += sc;
        semestersCounted++;
      }
    }

    const overallCGPA = totalCredits > 0 ? (totalWeight / totalCredits) : 0;

    const content = `
    <div class="admin-page">
      <div class="admin-page-header">
        <h2>🎯 GPA Dashboard</h2>
        <p>Curriculum: Regulation 2022 (CSE)</p>
      </div>
      <div class="screen-body" style="padding: 0;">


        <!-- Grade Scale -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1.25rem; margin-bottom: 2rem; box-shadow: var(--card-shadow);">
          <h4 style="margin-bottom: 1rem; font-size: 0.9rem; color: var(--text-sec); text-align: center; text-transform: uppercase; letter-spacing: 1px;">University Grading Standard</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center;">
            ${GRADE_MAP.map(g => `
              <span style="background: ${g.points >= 8 ? 'rgba(39,174,96,0.12)' : g.points >= 5 ? 'rgba(47,128,237,0.1)' : 'rgba(235,87,87,0.1)'};
                color: ${g.points >= 8 ? '#27AE60' : g.points >= 5 ? 'var(--primary)' : '#EB5757'};
                padding: 6px 14px; border-radius: 10px; font-size: 0.8rem; font-weight: 800;
                border: 1px solid ${g.points >= 8 ? 'rgba(39,174,96,0.2)' : g.points >= 5 ? 'rgba(47,128,237,0.15)' : 'rgba(235,87,87,0.15)'};">
                ${g.grade}=${g.points}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Semester List Card -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 18px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.05);">
          ${[1,2,3,4,5,6,7,8].map((s, i) => {
            const subs = ALL_SEMS[s];
            const tc = subs.reduce((a, b) => a + b.credits, 0);
            const gpa = semResults[s];
            return `
            <div class="cgpa-sem-row" data-sem="${s}" style="display: flex; align-items: center; padding: 1.25rem 1.5rem; cursor: pointer;
              ${i < 7 ? 'border-bottom: 1px solid var(--border);' : ''} transition: all 0.2s;">
              <div style="width: 48px; height: 48px; background: rgba(47,128,237,0.08); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--primary); margin-right: 1.25rem; font-size: 1.2rem;">${s}</div>
              <div style="flex: 1;">
                <div style="font-weight: 700; font-size: 1.1rem; color: var(--text);">Semester ${SEM_ROMAN[s-1]}</div>
                <div style="font-size: 0.85rem; color: var(--text-mod); margin-top: 4px;">${subs.length} subjects \u00B7 ${tc} credits</div>
              </div>
              <div style="text-align: right; margin-right: 1rem;">
                ${gpa ? `<div style="font-size: 1.25rem; font-weight: 800; color: var(--primary);">${gpa.toFixed(2)}</div><div style="font-size: 0.7rem; color: var(--text-mod); font-weight: 600; text-transform: uppercase;">GPA</div>` : '<div style="color: var(--text-sec); opacity: 0.5; font-size: 0.9rem;">No data</div>'}
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-mod)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;

    container.innerHTML = content;

    document.querySelectorAll('.cgpa-sem-row').forEach(row => {
      row.onmouseenter = () => row.style.background = 'var(--bg)';
      row.onmouseleave = () => row.style.background = 'transparent';
      row.onclick = () => renderSemesterDetail(parseInt(row.dataset.sem));
    });
  }

  // ─── VIEW 2: Semester Detail ───
  function renderSemesterDetail(semNum) {
    const subjects = ALL_SEMS[semNum];
    const totalCredits = subjects.reduce((a, b) => a + b.credits, 0);
    const theory = subjects.filter(s => s.type === 'Theory');
    const practical = subjects.filter(s => s.type === 'Practical');

    function subjectRow(sub, idx) {
      return `
      <div style="display: flex; align-items: center; gap: 0.6rem; padding: 0.65rem 0.75rem; border-radius: 10px; border: 1px solid var(--border); background: var(--surface);">
        <div style="width: 6px; height: 40px; border-radius: 3px; background: ${catColor(sub.category)}; flex-shrink: 0;"></div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 600; font-size: 0.88rem; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${sub.name}">${sub.name}</div>
          <div style="display: flex; gap: 0.4rem; align-items: center; margin-top: 2px;">
            <span style="font-size: 0.72rem; color: var(--text-mod);">${sub.code}</span>
            <span style="font-size: 0.68rem; padding: 1px 5px; border-radius: 4px; background: ${catBg(sub.category)}; color: ${catColor(sub.category)}; font-weight: 600;">${sub.category}</span>
            <span style="font-size: 0.72rem; font-weight: 700; color: var(--primary);">${sub.credits}C</span>
          </div>
        </div>
        <select class="cgpa-grade-sel" data-idx="${idx}" style="width: 140px; padding: 0.4rem; border-radius: 8px; border: 2px solid var(--border); background: var(--bg); color: var(--text); font-size: 0.8rem; font-weight: 600; cursor: pointer; outline: none;">
          ${gradeOptions}
        </select>
      </div>`;
    }

    const content = `
    <div class="admin-page">
      <div class="admin-page-header" style="display: flex; align-items: center; gap: 0.6rem;">
        <button id="cgpaBackBtn" style="background: none; border: none; cursor: pointer; padding: 0.4rem; border-radius: 8px; display: flex;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <div>
          <h2 style="margin:0;">Semester ${SEM_ROMAN[semNum-1]}</h2>
          <p style="margin:0;">${subjects.length} subjects \u00B7 ${totalCredits} credits</p>
        </div>
      </div>
      <div class="screen-body" style="padding: 0;">

        ${theory.length ? `
        <div style="margin-bottom: 1rem;">
          <div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:0.5rem;">
            <span style="font-size:1rem;">\u{1F4D8}</span>
            <span style="font-weight:700;font-size:0.88rem;color:var(--text);text-transform:uppercase;letter-spacing:0.5px;">Theory</span>
            <span style="font-size:0.75rem;color:var(--text-mod);">(${theory.length})</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:0.4rem;">
            ${theory.map(sub => subjectRow(sub, subjects.indexOf(sub))).join('')}
          </div>
        </div>` : ''}

        ${practical.length ? `
        <div style="margin-bottom: 1rem;">
          <div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:0.5rem;">
            <span style="font-size:1rem;">\u{1F52C}</span>
            <span style="font-weight:700;font-size:0.88rem;color:var(--text);text-transform:uppercase;letter-spacing:0.5px;">Practical</span>
            <span style="font-size:0.75rem;color:var(--text-mod);">(${practical.length})</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:0.4rem;">
            ${practical.map(sub => subjectRow(sub, subjects.indexOf(sub))).join('')}
          </div>
        </div>` : ''}

        <button id="cgpaCalcBtn" style="width:100%;padding:0.95rem;font-size:1.05rem;font-weight:700;border:none;border-radius:14px;cursor:pointer;
          background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;box-shadow:0 6px 20px rgba(102,126,234,0.35);margin-top:0.5rem;">
          \u{1F4CA} Calculate GPA
        </button>

        <div id="cgpaResults" style="display:none;margin-top:1.25rem;"></div>
      </div>
    </div>`;

    container.innerHTML = content;

    // Restore grades
    document.querySelectorAll('.cgpa-grade-sel').forEach(sel => {
      const idx = parseInt(sel.dataset.idx);
      sel.value = semGrades[semNum][idx] || '10';
      sel.onchange = () => { 
        semGrades[semNum][idx] = sel.value; 
        saveGrades(); // Persist immediately
      };
    });

    // Back
    document.getElementById('cgpaBackBtn').onclick = () => renderSemesterList();

    // Calculate
    document.getElementById('cgpaCalcBtn').onclick = () => {
      let sc = 0, sw = 0, hasU = false;
      const rows = [];

      subjects.forEach((sub, idx) => {
        const c = sub.credits;
        const g = parseFloat(semGrades[semNum][idx]);
        if (c <= 0) return;
        const gn = GRADE_MAP.find(x => x.points === g)?.grade || '?';
        if (g === 0) { hasU = true; rows.push({ n: sub.name, c, gn, g, w: 0, ex: true }); return; }
        sc += c; sw += c * g;
        rows.push({ n: sub.name, c, gn, g, w: c * g, ex: false });
      });

      if (sc === 0) { UI.toast(hasU ? 'All subjects have U grade.' : 'No valid credits.', 'error'); return; }

      const sgpa = sw / sc;
      const pct = (sgpa - 0.75) * 10;
      const gc = v => v >= 9 ? '#27AE60' : v >= 7 ? '#2F80ED' : v >= 5 ? '#F2994A' : '#EB5757';
      const gl = v => v >= 9 ? 'Outstanding' : v >= 8 ? 'Excellent' : v >= 7 ? 'Very Good' : v >= 6 ? 'Good' : v >= 5 ? 'Satisfactory' : 'Needs Improvement';

      const r = document.getElementById('cgpaResults');
      r.style.display = 'block';
      r.innerHTML = `
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);border-radius:18px;padding:2rem 1.5rem;text-align:center;color:#fff;margin-bottom:1.25rem;
          box-shadow:0 12px 35px rgba(102,126,234,0.35);position:relative;overflow:hidden;">
          <div style="position:absolute;inset:0;background:radial-gradient(circle at 20% 80%,rgba(255,255,255,0.08) 0%,transparent 50%);"></div>
          <div style="position:relative;z-index:1;">
            <div style="font-size:0.82rem;opacity:0.8;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Semester ${SEM_ROMAN[semNum-1]} \u2013 GPA</div>
            <div style="font-size:3.5rem;font-weight:900;line-height:1.1;margin:0.15rem 0;">${sgpa.toFixed(2)}</div>
            <div style="font-size:1rem;opacity:0.9;font-weight:600;">${gl(sgpa)}</div>
            <div style="font-size:0.85rem;opacity:0.7;margin-top:0.2rem;">\u2248 ${pct.toFixed(1)}%</div>
            <div style="display:flex;justify-content:center;gap:2rem;margin-top:1.15rem;">
              <div><div style="font-size:1.3rem;font-weight:800;">${sc}</div><div style="font-size:0.7rem;opacity:0.7;">Credits</div></div>
              <div><div style="font-size:1.3rem;font-weight:800;">${rows.length}</div><div style="font-size:0.7rem;opacity:0.7;">Subjects</div></div>
              <div><div style="font-size:1.3rem;font-weight:800;">${sw}</div><div style="font-size:0.7rem;opacity:0.7;">Points</div></div>
            </div>
          </div>
        </div>

        <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:1.15rem;box-shadow:0 3px 12px rgba(0,0,0,0.04);">
          <h4 style="margin:0 0 0.85rem;font-size:0.95rem;color:var(--text);">\u{1F4CA} Subject Breakdown</h4>
          <div style="display:flex;padding:0.45rem 0.6rem;background:var(--bg);border-radius:7px;margin-bottom:0.35rem;font-size:0.7rem;font-weight:700;color:var(--text-mod);text-transform:uppercase;letter-spacing:0.5px;">
            <span style="flex:2;">Subject</span>
            <span style="width:35px;text-align:center;">C</span>
            <span style="width:42px;text-align:center;">Grade</span>
            <span style="width:30px;text-align:center;">GP</span>
            <span style="width:45px;text-align:right;">C\u00D7GP</span>
          </div>
          ${rows.map(r => `
            <div style="display:flex;align-items:center;padding:0.5rem 0.6rem;border-bottom:1px solid var(--border);${r.ex ? 'opacity:0.45;' : ''}">
              <span style="flex:2;font-size:0.8rem;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${r.n}">${r.n}</span>
              <span style="width:35px;text-align:center;font-weight:700;font-size:0.82rem;color:var(--primary);">${r.c}</span>
              <span style="width:42px;text-align:center;">
                <span style="padding:2px 5px;border-radius:5px;font-size:0.75rem;font-weight:700;background:${r.ex?'rgba(235,87,87,0.1)':`${gc(r.g)}15`};color:${r.ex?'#EB5757':gc(r.g)};">${r.gn}</span>
              </span>
              <span style="width:30px;text-align:center;font-size:0.8rem;color:var(--text-mod);">${r.g}</span>
              <span style="width:45px;text-align:right;font-size:0.82rem;font-weight:700;color:${r.ex?'#EB5757':'var(--text)'};">${r.ex?'\u2014':r.w}</span>
            </div>
          `).join('')}
          <div style="display:flex;align-items:center;padding:0.65rem 0.6rem;margin-top:0.15rem;background:linear-gradient(135deg,rgba(102,126,234,0.06),rgba(118,75,162,0.06));border-radius:7px;font-weight:800;">
            <span style="flex:2;font-size:0.85rem;color:var(--text);">TOTAL</span>
            <span style="width:35px;text-align:center;font-size:0.85rem;color:var(--primary);">${sc}</span>
            <span style="width:42px;"></span>
            <span style="width:30px;"></span>
            <span style="width:45px;text-align:right;font-size:0.85rem;color:var(--text);">${sw}</span>
          </div>
          <div style="margin-top:0.75rem;padding:0.6rem 0.8rem;background:var(--bg);border-radius:7px;border:1px solid var(--border);text-align:center;">
            <span style="font-size:0.82rem;color:var(--text-mod);">GPA = ${sw} \u00F7 ${sc} = </span>
            <span style="font-size:1.05rem;font-weight:800;color:${gc(sgpa)};">${sgpa.toFixed(2)}</span>
          </div>
        </div>
      `;
      r.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
  }

  // Start with semester list
  renderSemesterList();
}

// ── Simple CGPA Calculator ────────────────
function renderSimpleCalculator() {
  const container = document.getElementById('cgpaCalculatorContent');
  if (!container) return;

  // Persistent state for sem count and dropdowns
  if (!window._simpleGPAState) {
    window._simpleGPAState = {
      semCount: 8, // Standard 8 semesters
    };
  }
  const state = window._simpleGPAState;

  function buildUI() {
    container.innerHTML = `
      <div class="admin-page-header" style="margin-bottom: 2rem;">
        <h2>🎯 CGPA Dashboard</h2>
        <p>Curriculum: Regulation 2022 (CSE)</p>
      </div>

      <div class="simple-cgpa-container" style="background: var(--bg); border-radius: 24px; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; min-height: 800px; gap: 2rem;">
        
        <!-- Input Card (Matching Style) -->
        <div class="simple-cgpa-card" style="background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 2.5rem 1.5rem; width: 100%; max-width: 450px; box-shadow: 0 8px 30px rgba(0,0,0,0.05); display: flex; flex-direction: column; gap: 1.5rem; text-align: center;">
          
          <div style="border-bottom: 2px solid var(--bg); padding-bottom: 1rem; margin-bottom: 0.5rem;">
            <h3 style="font-size: 1.1rem; color: var(--text); margin: 0; font-weight: 800;">Semester Wise GPA</h3>
            <p style="font-size: 0.85rem; color: var(--text-mod); margin-top: 5px;">Enter your results to update the dashboard</p>
          </div>

          <div id="simpleSemsList" style="display: flex; flex-direction: column; gap: 1rem;">
            ${Array.from({ length: state.semCount }).map((_, i) => `
              <div class="sem-input-block" style="text-align: left;">
                <label style="display: block; font-weight: 700; color: var(--text); margin-bottom: 0.5rem; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8;">Semester ${i + 1}</label>
                <div style="position: relative;">
                   <input type="number" step="0.01" min="0" max="10" class="sem-gpa-input-val" 
                          style="width: 100%; padding: 14px 14px 14px 45px; border-radius: 12px; border: 2px solid var(--border); background: var(--bg); text-align: left; font-size: 1.1rem; font-weight: 700; color: var(--text); outline: none; transition: border-color 0.2s;" 
                          placeholder="0.00">
                   <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 1rem; opacity: 0.5;">📊</span>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem;">
            <button id="addSemBtn" style="background: var(--bg); color: var(--text); padding: 14px; border-radius: 12px; font-weight: 700; font-size: 0.9rem; border: 1px solid var(--border); cursor: pointer;">Add Semester</button>
            <button id="removeSemBtn" style="background: var(--bg); color: var(--text); padding: 14px; border-radius: 12px; font-weight: 700; font-size: 0.9rem; border: 1px solid var(--border); cursor: pointer;">Remove Semester</button>
            <button id="calculateFinalCGPA" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 18px; border-radius: 14px; font-weight: 800; font-size: 1.1rem; border: none; cursor: pointer; box-shadow: 0 6px 20px rgba(102,126,234,0.3); margin-top: 0.5rem; text-transform: uppercase; letter-spacing: 1px;">
               calculate cgpa
            </button>
          </div>

        </div>

        <!-- Summary Card (Moved to Bottom) -->
        <div id="cgpaSummaryCard" style="background: linear-gradient(135deg, var(--primary), #56CCF2); border-radius: 20px; padding: 2.5rem 2rem; width: 100%; max-width: 450px; text-align: center; color: white; box-shadow: 0 15px 35px rgba(47,128,237,0.25); position: relative; overflow: hidden;">
           <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
           <div style="font-size: 0.85rem; opacity: 0.8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Final CGPA Score</div>
           <div id="cgpaValueHero" style="font-size: 4.5rem; font-weight: 900; margin: 0.5rem 0; line-height: 1;">N/A</div>
           <div id="cgpaCommentHero" style="font-size: 1rem; font-weight: 600; opacity: 0.9;">No data calculated yet</div>
        </div>

      </div>
    `;


    // Action: Add semester
    document.getElementById('addSemBtn').onclick = () => {
      if (state.semCount < 12) {
        state.semCount++;
        buildUI();
      } else {
        UI.toast('Only 12 semesters allowed', 'info');
      }
    };

    // Action: Remove semester
    document.getElementById('removeSemBtn').onclick = () => {
      if (state.semCount > 1) {
        state.semCount--;
        buildUI();
      }
    };

    // Action: Calculate
    document.getElementById('calculateFinalCGPA').onclick = () => {
      const inputs = document.querySelectorAll('.sem-gpa-input-val');
      let total = 0;
      let count = 0;

      inputs.forEach(input => {
        const val = parseFloat(input.value);
        // Only count fields that are not empty and are valid numbers >= 0
        if (!isNaN(val) && input.value.trim() !== '') {
          total += val;
          count++;
        }
      });

      const display = document.getElementById('cgpaValueHero');
      const comment = document.getElementById('cgpaCommentHero');

      if (count > 0) {
        const cgpa = total / count;
        display.textContent = cgpa.toFixed(2);
        
        // Performance comments
        if (cgpa >= 9.0) { comment.textContent = 'Excellent! Outstanding performance.'; }
        else if (cgpa >= 8.0) { comment.textContent = 'Very Good! Keep it up.'; }
        else if (cgpa >= 7.0) { comment.textContent = 'Good! You are on track.'; }
        else if (cgpa >= 6.0) { comment.textContent = 'Satisfactory performance.'; }
        else { comment.textContent = 'Needs intensive improvement.'; }

        // Scroll to the summary card at the bottom
        const card = document.getElementById('cgpaSummaryCard');
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        display.textContent = 'N/A';
        comment.textContent = 'Please enter at least one valid GPA.';
        UI.toast('Please enter valid GPAs', 'error');
      }
    };
  }

  buildUI();
}


