// =============================================
// Smart Library – Database Layer (API)
// =============================================

const DB = {
  KEYS: {
    CURRENT_USER: 'sl_current_user',
    DARK_MODE: 'sl_dark_mode',
  },

  cache: {
    books: [],
    students: [],
    transactions: [],
    requests: [],
    papers: []
  },

  getToken() {
    const u = this.getCurrentUser();
    return u ? u.token : '';
  },

  // ── Helpers ───────────────────────────────
  genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); },
  today() { return new Date().toISOString().split('T')[0]; },
  addDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  },
  isOverdue(returnDate) { return new Date(returnDate) < new Date(this.today()); },

  async init() {
    if (!this.getCurrentUser()) return;
    const headers = { 'Authorization': `Bearer ${this.getToken()}` };
    try {
      const [books, tx, reqs, students, papers] = await Promise.all([
        fetch('/api/books', { headers }).then(r => r.json()),
        fetch('/api/transactions', { headers }).then(r => r.json()),
        fetch('/api/requests', { headers }).then(r => r.json()),
        fetch('/api/students', { headers }).then(r => r.json()),
        fetch('/api/papers', { headers }).then(r => r.json())
      ]);
      this.cache.books = Array.isArray(books) ? books : [];
      this.cache.transactions = Array.isArray(tx) ? tx : [];
      this.cache.requests = Array.isArray(reqs) ? reqs : [];
      this.cache.students = Array.isArray(students) ? students : [];
      this.cache.papers = Array.isArray(papers) ? papers : [];
    } catch (e) {
    }
  },

  getPapers() { return this.cache.papers; },

  // ══════════════════════════════════════════
  // AUTH
  // ══════════════════════════════════════════
  getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.CURRENT_USER)); }
    catch { return null; }
  },
  setCurrentUser(user) {
    localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem(this.KEYS.CURRENT_USER);
  },

  // ════════════════════════════════════════
  // STUDENTS
  // ════════════════════════════════════════
  getStudents() { return this.cache.students; },

  async registerStudent({ name, register_number, email, department, phone, password }) {
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, register_number, email, department, phone, password })
    });
    return res.json();
  },

  async loginStudent(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  // ════════════════════════════════════════
  // BOOKS
  // ════════════════════════════════════════
  CATEGORIES: ['Science', 'Technology', 'Engineering', 'Mathematics', 'Literature',
    'History', 'Philosophy', 'Arts', 'Medicine', 'Law', 'Economics', 'Other'],

  getBooks() { return this.cache.books; },
  getBookById(id) { return this.cache.books.find(b => b.book_id === id); },

  async addBook({ title, author, category, description, total_copies }) {
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.getToken()}` },
      body: JSON.stringify({ title, author, category, description, total_copies })
    });
    const book = await res.json();
    this.cache.books.push(book);
    return book;
  },

  async updateBook(book_id, updates) {
    const old = this.getBookById(book_id);
    const updated = { ...old, ...updates };
    await fetch(`/api/books/${book_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.getToken()}` },
      body: JSON.stringify(updated)
    });
    this.cache.books = this.cache.books.map(b => b.book_id === book_id ? updated : b);
  },

  async deleteBook(book_id) {
    await fetch(`/api/books/${book_id}`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    this.cache.books = this.cache.books.filter(b => b.book_id !== book_id);
  },

  searchBooks(query, category) {
    let list = this.getBooks();
    if (category && category !== 'All') list = list.filter(b => b.category === category);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.description || '').toLowerCase().includes(q)
      );
    }
    return list;
  },

  // ════════════════════════════════════════
  // TRANSACTIONS
  // ════════════════════════════════════════
  getTransactions() { return this.cache.transactions; },

  async issueBook(register_number, book_id) {
    const res = await fetch('/api/transactions/issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.getToken()}` },
      body: JSON.stringify({ register_number, book_id })
    });
    const data = await res.json();
    if (data.ok) {
      this.cache.transactions.push(data.transaction);
      const book = this.getBookById(book_id);
      if (book) book.available_copies--;
    }
    return data;
  },

  async returnBook(transaction_id) {
    const res = await fetch(`/api/transactions/return/${transaction_id}`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    const data = await res.json();
    if (data.ok) {
      const tx = this.cache.transactions.find(t => t.transaction_id === transaction_id);
      if (tx) {
        tx.status = 'returned';
        tx.actual_return = this.today();
        const book = this.getBookById(tx.book_id);
        if (book) book.available_copies++;
      }
    }
    return data;
  },

  getStudentTransactions(register_number) {
    return this.cache.transactions.filter(t => t.register_number === register_number);
  },

  async updateOverdueStatuses() {
    await fetch('/api/transactions/update-overdue', {
      method: 'POST', headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    this.cache.transactions.forEach(t => {
      if (t.status === 'issued' && this.isOverdue(t.return_date)) {
        t.status = 'overdue';
      }
    });
  },

  getStats() {
    const txList = this.getTransactions();
    return {
      totalBooks: this.getBooks().length,
      totalcopies: this.getBooks().reduce((s, b) => s + b.total_copies, 0),
      issuedBooks: txList.filter(t => t.status === 'issued' || t.status === 'overdue').length,
      overdueBooks: txList.filter(t => t.status === 'overdue').length,
      totalStudents: this.getStudents().filter(s => s.role !== 'admin').length,
      returnedBooks: txList.filter(t => t.status === 'returned').length,
    };
  },

  // ════════════════════════════════════════
  // REQUESTS
  // ════════════════════════════════════════
  getRequests() { return this.cache.requests; },

  async requestBook(register_number, book_id) {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.getToken()}` },
      body: JSON.stringify({ register_number, book_id })
    });
    const data = await res.json();
    if (data.ok) {
      this.cache.requests.push(data.request);
    }
    return data;
  },

  async approveRequest(request_id) {
    const res = await fetch(`/api/requests/${request_id}/approve`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    const data = await res.json();
    if (data.ok) {
      const req = this.cache.requests.find(r => r.request_id === request_id);
      if (req) req.approval_status = 'approved';
      await this.init();
    }
    return data;
  },

  async rejectRequest(request_id) {
    const res = await fetch(`/api/requests/${request_id}/reject`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    const data = await res.json();
    if (data.ok) {
      const req = this.cache.requests.find(r => r.request_id === request_id);
      if (req) req.approval_status = 'rejected';
    }
    return data;
  },

  getPendingRequests() {
    return this.cache.requests.filter(r => r.approval_status === 'pending');
  },
  getStudentRequests(register_number) {
    return this.cache.requests.filter(r => r.register_number === register_number);
  },

  // ════════════════════════════════════════
  // NOTIFICATIONS
  // ════════════════════════════════════════
  getNotifications(register_number) {
    const txList = this.getStudentTransactions(register_number);
    const notes = [];
    txList.forEach(t => {
      if (t.status === 'overdue') {
        const book = this.getBookById(t.book_id);
        notes.push({ type: 'overdue', msg: `"${book?.title || 'A book'}" is overdue! Please return immediately.`, date: t.return_date, icon: '⚠️' });
      } else if (t.status === 'issued') {
        const daysLeft = Math.ceil((new Date(t.return_date) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 3) {
          const book = this.getBookById(t.book_id);
          notes.push({ type: 'due_soon', msg: `"${book?.title || 'A book'}" is due in ${daysLeft} day(s).`, date: t.return_date, icon: '📅' });
        }
      }
    });
    return notes;
  },

  // ════════════════════════════════════════
  // DARK MODE
  // ════════════════════════════════════════
  getDarkMode() { return localStorage.getItem(this.KEYS.DARK_MODE) === 'true'; },
  setDarkMode(val) { localStorage.setItem(this.KEYS.DARK_MODE, val); },
};
