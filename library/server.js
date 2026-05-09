require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('./js/db');   // MySQL pool

// ── Multer (image upload) ──────────────────────────────
const uploadDir = path.join(__dirname, 'uploads', 'papers');
const ebookUploadDir = path.join(__dirname, 'uploads', 'ebooks');
if (!fs.existsSync(ebookUploadDir)) fs.mkdirSync(ebookUploadDir, { recursive: true });
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.random().toString(36).slice(2, 7) + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  }
});
// Allow up to 10 files per paper
const uploadPaperImages = upload.array('images', 10);

// Multer for ebook files (PDF/EPUB/DOC up to 50 MB)
const ebookStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ebookUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.random().toString(36).slice(2, 7) + ext);
  }
});
const uploadEbook = multer({
  storage: ebookStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  // No fileFilter: multer v2 cb(null,false) silently drops file → req.file undefined
  // Browser accept attribute handles file type restriction on client side
}).single('file');

const app = express();
const PORT = 8080;
const SECRET_KEY = process.env.JWT_SECRET || 'super_secret_smart_library_key';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/ebooks', express.static(ebookUploadDir));

// ── Helpers ──────────────────────────────────────────────
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const today = () => new Date().toISOString().split('T')[0];
const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

// ── Create tables & seed data on start ──────────────────
async function initDB() {
  await db.execute(`CREATE TABLE IF NOT EXISTS admins (
    username VARCHAR(50) PRIMARY KEY,
    name TEXT,
    email VARCHAR(100) UNIQUE,
    password TEXT
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS students (
    register_number VARCHAR(50) PRIMARY KEY,
    name TEXT,
    email VARCHAR(100) UNIQUE,
    department TEXT,
    phone TEXT,
    password TEXT,
    joined TEXT
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS books (
    book_id VARCHAR(32) PRIMARY KEY,
    title TEXT,
    author TEXT,
    category TEXT,
    description TEXT,
    total_copies INT,
    available_copies INT,
    added_date TEXT
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS transactions (
    transaction_id VARCHAR(32) PRIMARY KEY,
    register_number VARCHAR(50),
    book_id VARCHAR(32),
    issue_date TEXT,
    return_date TEXT,
    status VARCHAR(20),
    actual_return TEXT
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS requests (
    request_id VARCHAR(32) PRIMARY KEY,
    register_number VARCHAR(50),
    book_id VARCHAR(32),
    request_date TEXT,
    approval_status VARCHAR(20)
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS question_papers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    exam_type VARCHAR(20) DEFAULT 'SEM',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS paper_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paper_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (paper_id) REFERENCES question_papers(id) ON DELETE CASCADE
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS ebooks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT DEFAULT 0,
    source_type VARCHAR(10) DEFAULT 'upload',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Migrate source_type column if missing
  try {
    const [ebCols] = await db.query(`SHOW COLUMNS FROM ebooks LIKE 'source_type'`);
    if (!ebCols.length) {
      await db.execute(`ALTER TABLE ebooks ADD COLUMN source_type VARCHAR(10) DEFAULT 'upload'`);
      console.log('✅ Added source_type column to ebooks.');
    }
  } catch (_) { }

  // Migrate exam_type column if missing
  try {
    const [cols] = await db.query(`SHOW COLUMNS FROM question_papers LIKE 'exam_type'`);
    if (!cols.length) {
      await db.execute('ALTER TABLE question_papers ADD COLUMN exam_type VARCHAR(20) DEFAULT "SEM"');
      console.log('✅ Added exam_type column to question_papers.');
    }
  } catch (_) { }

  // Migrate old image_path column if it exists (safe – ignores error if already done)
  try {
    const [cols] = await db.query(`SHOW COLUMNS FROM question_papers LIKE 'image_path'`);
    if (cols.length) {
      // Move any existing image_paths into paper_images table
      const [old] = await db.query('SELECT id, image_path FROM question_papers WHERE image_path IS NOT NULL AND image_path != ""');
      for (const row of old) {
        await db.execute('INSERT IGNORE INTO paper_images (paper_id, image_path, sort_order) VALUES (?,?,0)', [row.id, row.image_path]);
      }
      await db.execute('ALTER TABLE question_papers DROP COLUMN image_path');
      console.log('✅ Migrated image_path → paper_images table.');
    }
  } catch (_) { /* column already removed */ }

  // Seed only if books table is empty
  const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM books');
  if (count === 0) {
    const t = today();
    const seedBooks = [
      [genId(), 'Introduction to Algorithms', 'Thomas H. Cormen', 'Technology', 'A comprehensive textbook on algorithms.', 6, 6, t],
      [genId(), 'Clean Code', 'Robert C. Martin', 'Technology', 'A handbook of agile software craftsmanship.', 4, 4, t],
      [genId(), 'The Great Gatsby', 'F. Scott Fitzgerald', 'Literature', 'A classic American novel exploring themes of wealth.', 5, 5, t],
    ];
    for (const b of seedBooks) {
      await db.execute(
        'INSERT INTO books (book_id,title,author,category,description,total_copies,available_copies,added_date) VALUES (?,?,?,?,?,?,?,?)',
        b
      );
    }
    await db.execute(
      'INSERT IGNORE INTO admins (username,name,email,password) VALUES (?,?,?,?)',
      ['admin', 'Library Admin', 'admin@library.edu', 'Admin@123']
    );
    await db.execute(
      'INSERT IGNORE INTO students (register_number,name,email,department,phone,password,joined) VALUES (?,?,?,?,?,?,?)',
      ['732224cs223', 'Rahul', 'student@demo.edu', 'Computer Science', '9876543210', 'Student@123', t]
    );
    console.log('✅ Database seeded with sample data.');
  }

  console.log('✅ MySQL tables ready.');
}

// ── Auth middleware ──────────────────────────────────────
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);
  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ════════════════════════════════════════════════════════
// API ROUTES
// ════════════════════════════════════════════════════════

// ── Auth ─────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { name, email, department, phone, password, register_number } = req.body;
  try {
    if (!register_number || !register_number.trim()) {
      return res.status(400).json({ ok: false, msg: 'Register Number is required.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO students (register_number,name,email,department,phone,password,joined) VALUES (?,?,?,?,?,?,?)',
      [register_number.trim(), name, email, department, phone, hashed, today()]
    );
    res.json({ ok: true, student: { register_number: register_number.trim(), name, email, department, phone, role: 'student', joined: today() } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.message.includes('register_number') || err.message.includes('PRIMARY')) return res.status(400).json({ ok: false, msg: 'This Register Number is already in use.' });
      return res.status(400).json({ ok: false, msg: 'Email already registered.' });
    }
    res.status(500).json({ ok: false, msg: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check admins table first
    const [adminRows] = await db.execute('SELECT * FROM admins WHERE email = ?', [email]);
    if (adminRows.length) {
      const admin = adminRows[0];
      const isMatch = admin.password.startsWith('$2')
        ? await bcrypt.compare(password, admin.password)
        : admin.password === password;
      if (!isMatch) return res.status(400).json({ ok: false, msg: 'Incorrect password.' });
      delete admin.password;
      admin.role = 'admin';
      const token = jwt.sign(admin, SECRET_KEY, { expiresIn: '24h' });
      return res.json({ ok: true, user: admin, token });
    }
    // Check students table
    const [rows] = await db.execute('SELECT * FROM students WHERE email = ?', [email]);
    if (!rows.length) return res.status(400).json({ ok: false, msg: 'User not found.' });
    const row = rows[0];
    const isMatch = row.password.startsWith('$2')
      ? await bcrypt.compare(password, row.password)
      : row.password === password;
    if (!isMatch) return res.status(400).json({ ok: false, msg: 'Incorrect password.' });
    delete row.password;
    row.role = 'student';
    const token = jwt.sign(row, SECRET_KEY, { expiresIn: '24h' });
    res.json({ ok: true, user: row, token });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// ── Students ─────────────────────────────────────────────
app.get('/api/students', authenticateJWT, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT register_number,name,email,department,phone,joined FROM students');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Books ─────────────────────────────────────────────────
app.get('/api/books', authenticateJWT, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM books');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/books', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { title, author, category, description, total_copies } = req.body;
  const book_id = genId();
  try {
    await db.execute(
      'INSERT INTO books (book_id,title,author,category,description,total_copies,available_copies,added_date) VALUES (?,?,?,?,?,?,?,?)',
      [book_id, title, author, category, description, total_copies, total_copies, today()]
    );
    res.json({ book_id, title, author, category, description, total_copies, available_copies: total_copies, added_date: today() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/books/:id', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { title, author, category, description, total_copies, available_copies } = req.body;
  try {
    await db.execute(
      'UPDATE books SET title=?,author=?,category=?,description=?,total_copies=?,available_copies=? WHERE book_id=?',
      [title, author, category, description, total_copies, available_copies, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/books/:id', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  try {
    await db.execute('DELETE FROM books WHERE book_id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Transactions ──────────────────────────────────────────
app.get('/api/transactions', authenticateJWT, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM transactions');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions/issue', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { register_number, book_id } = req.body;
  try {
    const [books] = await db.execute('SELECT available_copies FROM books WHERE book_id=?', [book_id]);
    if (!books.length || books[0].available_copies < 1)
      return res.json({ ok: false, msg: 'Book not available.' });

    const transaction_id = genId();
    const ret_date = addDays(14);
    await db.execute(
      'INSERT INTO transactions (transaction_id,register_number,book_id,issue_date,return_date,status,actual_return) VALUES (?,?,?,?,?,?,?)',
      [transaction_id, register_number, book_id, today(), ret_date, 'issued', null]
    );
    await db.execute('UPDATE books SET available_copies = available_copies - 1 WHERE book_id=?', [book_id]);
    res.json({ ok: true, transaction: { transaction_id, register_number, book_id, status: 'issued', issue_date: today(), return_date: ret_date } });
  } catch (err) {
    res.json({ ok: false, msg: err.message });
  }
});

app.post('/api/transactions/return/:id', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const transaction_id = req.params.id;
  try {
    const [rows] = await db.execute('SELECT book_id FROM transactions WHERE transaction_id=?', [transaction_id]);
    if (!rows.length) return res.json({ ok: false, msg: 'Transaction not found.' });
    await db.execute(
      'UPDATE transactions SET status=?, actual_return=? WHERE transaction_id=?',
      ['returned', today(), transaction_id]
    );
    await db.execute('UPDATE books SET available_copies = available_copies + 1 WHERE book_id=?', [rows[0].book_id]);
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false, msg: err.message });
  }
});

app.post('/api/transactions/update-overdue', authenticateJWT, async (req, res) => {
  try {
    await db.execute('UPDATE transactions SET status="overdue" WHERE status="issued" AND return_date < ?', [today()]);
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false, msg: err.message });
  }
});

// ── Requests ──────────────────────────────────────────────
app.get('/api/requests', authenticateJWT, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM requests');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/requests', authenticateJWT, async (req, res) => {
  const { register_number, book_id } = req.body;
  try {
    const [existing] = await db.execute(
      'SELECT request_id FROM requests WHERE register_number=? AND book_id=? AND approval_status="pending"',
      [register_number, book_id]
    );
    if (existing.length) return res.json({ ok: false, msg: 'You already have a pending request for this book.' });

    const request_id = genId();
    await db.execute(
      'INSERT INTO requests (request_id,register_number,book_id,request_date,approval_status) VALUES (?,?,?,?,?)',
      [request_id, register_number, book_id, today(), 'pending']
    );
    res.json({ ok: true, request: { request_id, register_number, book_id, request_date: today(), approval_status: 'pending' } });
  } catch (err) {
    res.json({ ok: false, msg: err.message });
  }
});

app.post('/api/requests/:id/approve', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const request_id = req.params.id;
  try {
    const [reqs] = await db.execute('SELECT * FROM requests WHERE request_id=?', [request_id]);
    if (!reqs.length) return res.json({ ok: false, msg: 'Request not found.' });
    const reqData = reqs[0];

    const [books] = await db.execute('SELECT available_copies FROM books WHERE book_id=?', [reqData.book_id]);
    if (!books.length || books[0].available_copies < 1)
      return res.json({ ok: false, msg: 'Book not available.' });

    await db.execute('UPDATE requests SET approval_status="approved" WHERE request_id=?', [request_id]);
    const transaction_id = genId();
    const ret_date = addDays(14);
    await db.execute(
      'INSERT INTO transactions (transaction_id,register_number,book_id,issue_date,return_date,status,actual_return) VALUES (?,?,?,?,?,?,?)',
      [transaction_id, reqData.register_number, reqData.book_id, today(), ret_date, 'issued', null]
    );
    await db.execute('UPDATE books SET available_copies = available_copies - 1 WHERE book_id=?', [reqData.book_id]);
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false, msg: err.message });
  }
});

app.post('/api/requests/:id/reject', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  try {
    await db.execute('UPDATE requests SET approval_status="rejected" WHERE request_id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false, msg: err.message });
  }
});

// ══ Question Papers ═══════════════════════════════════════

// GET all papers with their images
app.get('/api/papers', authenticateJWT, async (req, res) => {
  try {
    const [papers] = await db.query('SELECT * FROM question_papers ORDER BY semester, code');
    const [images] = await db.query('SELECT * FROM paper_images ORDER BY paper_id, sort_order');
    // Attach images array to each paper
    const papersWithImages = papers.map(p => ({
      ...p,
      images: images.filter(img => img.paper_id === p.id)
    }));
    res.json(papersWithImages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST – upload new paper with up to 4 images (admin only)
app.post('/api/papers', authenticateJWT, uploadPaperImages, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { code, title, semester, exam_type = 'SEM' } = req.body;
  if (!code || !title || !semester) return res.status(400).json({ ok: false, msg: 'code, title and semester are required.' });
  try {
    const [result] = await db.execute(
      'INSERT INTO question_papers (code, title, semester, exam_type) VALUES (?,?,?,?)',
      [code, title, semester, exam_type]
    );
    const paperId = result.insertId;
    const files = req.files || [];
    for (let i = 0; i < files.length; i++) {
      await db.execute(
        'INSERT INTO paper_images (paper_id, image_path, sort_order) VALUES (?,?,?)',
        [paperId, '/uploads/papers/' + files[i].filename, i]
      );
    }
    const [images] = await db.query('SELECT * FROM paper_images WHERE paper_id=?', [paperId]);
    res.status(201).json({ ok: true, id: paperId, code, title, semester, exam_type, images });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// PUT – update paper details and add more images (admin only)
app.put('/api/papers/:id', authenticateJWT, uploadPaperImages, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { code, title, semester, exam_type = 'SEM' } = req.body;
  const id = req.params.id;
  try {
    await db.execute(
      'UPDATE question_papers SET code=?, title=?, semester=?, exam_type=? WHERE id=?',
      [code, title, semester, exam_type, id]
    );
    // Append any newly uploaded images
    const files = req.files || [];
    if (files.length) {
      const [existing] = await db.query('SELECT MAX(sort_order) as maxOrd FROM paper_images WHERE paper_id=?', [id]);
      let nextOrd = (existing[0].maxOrd ?? -1) + 1;
      for (const file of files) {
        await db.execute(
          'INSERT INTO paper_images (paper_id, image_path, sort_order) VALUES (?,?,?)',
          [id, '/uploads/papers/' + file.filename, nextOrd++]
        );
      }
    }
    const [images] = await db.query('SELECT * FROM paper_images WHERE paper_id=? ORDER BY sort_order', [id]);
    res.json({ ok: true, images });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// DELETE – remove a single image from a paper (admin only)
app.delete('/api/papers/:id/images/:imgId', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  try {
    const [rows] = await db.execute('SELECT image_path FROM paper_images WHERE id=? AND paper_id=?', [req.params.imgId, req.params.id]);
    if (rows.length && rows[0].image_path) {
      const filePath = path.join(__dirname, rows[0].image_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await db.execute('DELETE FROM paper_images WHERE id=?', [req.params.imgId]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// DELETE – remove paper and all its image files (admin only)
app.delete('/api/papers/:id', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  try {
    // Delete physical image files first
    const [imgs] = await db.execute('SELECT image_path FROM paper_images WHERE paper_id=?', [req.params.id]);
    for (const img of imgs) {
      const filePath = path.join(__dirname, img.image_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    // CASCADE delete handles paper_images rows
    await db.execute('DELETE FROM question_papers WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// ══ E-Books ════════════════════════════════════════════════

// GET all ebooks (students & admins)
app.get('/api/ebooks', authenticateJWT, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ebooks ORDER BY uploaded_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST – add new ebook: supports URL mode OR file upload mode (admin only)
app.post('/api/ebooks', authenticateJWT, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);

  // Try to parse body first (URL mode: no file upload, JSON/form body)
  // We run multer but allow it to complete even with no file
  uploadEbook(req, res, async (err) => {
    if (err) return res.status(400).json({ ok: false, msg: err.message });
    const { title, author, category, description, book_url } = req.body;
    if (!title || !author || !category) return res.status(400).json({ ok: false, msg: 'title, author and category are required.' });

    try {
      let file_path, file_name, file_size, source_type;

      if (book_url && book_url.trim()) {
        // ── URL mode ──
        file_path  = book_url.trim();
        file_name  = book_url.trim().split('/').pop().split('?')[0] || 'ebook-link';
        file_size  = 0;
        source_type = 'url';
      } else if (req.file) {
        // ── File upload mode ──
        file_path  = '/uploads/ebooks/' + req.file.filename;
        file_name  = req.file.originalname;
        file_size  = req.file.size;
        source_type = 'upload';
      } else {
        return res.status(400).json({ ok: false, msg: 'Provide either a book URL or upload a file.' });
      }

      const [result] = await db.execute(
        'INSERT INTO ebooks (title, author, category, description, file_path, file_name, file_size, source_type) VALUES (?,?,?,?,?,?,?,?)',
        [title, author, category, description || '', file_path, file_name, file_size, source_type]
      );
      res.status(201).json({ ok: true, id: result.insertId, title, author, category, description, file_path, file_name, file_size, source_type });
    } catch (dbErr) {
      res.status(500).json({ ok: false, msg: dbErr.message });
    }
  });
});

// PUT – update ebook metadata (admin only, supports URL change OR file replace)
app.put('/api/ebooks/:id', authenticateJWT, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  uploadEbook(req, res, async (err) => {
    if (err) return res.status(400).json({ ok: false, msg: err.message });
    const { title, author, category, description, book_url } = req.body;
    const id = req.params.id;
    try {
      const [existing] = await db.execute('SELECT file_path, source_type FROM ebooks WHERE id=?', [id]);
      if (!existing.length) return res.status(404).json({ ok: false, msg: 'E-book not found.' });

      if (book_url && book_url.trim()) {
        // ── Switching to / updating URL mode ──
        // If old record was a file upload, delete the file
        if (existing[0].source_type === 'upload' && existing[0].file_path) {
          const old = path.join(__dirname, existing[0].file_path);
          if (fs.existsSync(old)) fs.unlinkSync(old);
        }
        const file_path = book_url.trim();
        const file_name = book_url.trim().split('/').pop().split('?')[0] || 'ebook-link';
        await db.execute(
          'UPDATE ebooks SET title=?,author=?,category=?,description=?,file_path=?,file_name=?,file_size=0,source_type="url" WHERE id=?',
          [title, author, category, description || '', file_path, file_name, id]
        );
      } else if (req.file) {
        // ── New file upload replacing old ──
        if (existing[0].source_type === 'upload' && existing[0].file_path) {
          const old = path.join(__dirname, existing[0].file_path);
          if (fs.existsSync(old)) fs.unlinkSync(old);
        }
        const file_path = '/uploads/ebooks/' + req.file.filename;
        await db.execute(
          'UPDATE ebooks SET title=?,author=?,category=?,description=?,file_path=?,file_name=?,file_size=?,source_type="upload" WHERE id=?',
          [title, author, category, description || '', file_path, req.file.originalname, req.file.size, id]
        );
      } else {
        // ── Metadata-only update ──
        await db.execute(
          'UPDATE ebooks SET title=?,author=?,category=?,description=? WHERE id=?',
          [title, author, category, description || '', id]
        );
      }
      res.json({ ok: true });
    } catch (dbErr) {
      res.status(500).json({ ok: false, msg: dbErr.message });
    }
  });
});

// DELETE – remove ebook and its file (admin only)
app.delete('/api/ebooks/:id', authenticateJWT, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  try {
    const [rows] = await db.execute('SELECT file_path FROM ebooks WHERE id=?', [req.params.id]);
    if (rows.length && rows[0].file_path) {
      const filePath = path.join(__dirname, rows[0].file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await db.execute('DELETE FROM ebooks WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// ══ AI Chat (Gemini) ════════════════════════════════════════
const https = require('https');

// Helper: call Gemini via Node https (avoids fetch() issues)
function callGemini(apiKey, model, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch (e) { reject(new Error('Parse error: ' + data.slice(0, 200))); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

app.post('/api/chat', authenticateJWT, async (req, res) => {
  const { messages } = req.body;
  const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

  if (!GEMINI_KEY || GEMINI_KEY.includes('YOUR_KEY')) {
    return res.json({ reply: '⚠️ Gemini API key not configured.\n\nAdd your free key to **.env**:\n```\nGEMINI_API_KEY=AIzaSy...\n```\nGet one free at: https://aistudio.google.com/app/apikey' });
  }

  try {
    // Live library context from DB
    const [books]    = await db.query('SELECT title, author, category, available_copies, total_copies FROM books LIMIT 50');
    const [students] = await db.query('SELECT COUNT(*) as cnt FROM students');
    const regNum = req.user.register_number || '';
    let issuedBooks = [], overdueBooks = [];
    if (regNum) {
      const [txRows] = await db.query(
        'SELECT b.title, t.return_date, t.status FROM transactions t JOIN books b ON t.book_id=b.book_id WHERE t.register_number=? AND t.status IN ("issued","overdue")',
        [regNum]
      );
      issuedBooks = txRows.filter(t => t.status === 'issued');
      overdueBooks = txRows.filter(t => t.status === 'overdue');
    }

    const bookList = books.map(b =>
      `- "${b.title}" by ${b.author} [${b.category}] — ${b.available_copies}/${b.total_copies} available`
    ).join('\n');

    const systemPrompt = `You are LibraBot, a smart and friendly AI assistant for the Smart Library Management System.

## Library Info
- Total books: ${books.length} | Students: ${students[0]?.cnt || 0}
- Loan: 14 days | Fine: ₹5/day overdue

## Book Collection
${bookList || 'No books yet.'}

## Student
- Name: ${req.user.name} | Reg: ${req.user.register_number}
- Dept: ${req.user.department} | Email: ${req.user.email}
- Issued: ${issuedBooks.map(t => `"${t.title}" due ${t.return_date}`).join(', ') || 'None'}
- Overdue: ${overdueBooks.map(t => `"${t.title}"`).join(', ') || 'None'}

## Portal Sections
Dashboard, My Books, Search, History, E-Books, CGPA Calculator, Question Papers, Free Courses, Daily News, Motivation Videos

## Rules
1. Answer ANY question (general knowledge, science, coding, math, etc.)
2. For library questions, use the live data above.
3. Be friendly, concise, use markdown formatting.
4. Today: ${new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}`;

    // Build Gemini-format contents
    const contents = (messages || []).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const geminiPayload = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { temperature: 0.75, maxOutputTokens: 800, topP: 0.95 },
    };

    // Try models in order: lite first (faster/higher quota), then full
    const MODELS = ['gemini-flash-lite-latest', 'gemini-flash-latest', 'gemini-2.0-flash'];
    let reply = null;

    for (const model of MODELS) {
      try {
        const result = await callGemini(GEMINI_KEY, model, geminiPayload);
        if (result.status === 200) {
          reply = result.data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) break;
        } else if (result.status === 429) {
          continue; // Rate limit — try next model
        } else {
          console.error(`Gemini ${model} error ${result.status}:`, JSON.stringify(result.data).slice(0, 200));
          continue;
        }
      } catch (e) {
        console.error(`Gemini ${model} exception:`, e.message);
        continue;
      }
    }

    if (!reply) {
      return res.json({ reply: '⚠️ AI is temporarily busy (rate limit). Please wait a moment and try again.\n\n💡 **Tip**: Free tier allows ~15 requests/minute.' });
    }

    res.json({ reply });
  } catch (err) {
    console.error('Chat endpoint error:', err.message);
    res.json({ reply: '⚠️ Something went wrong on the server. Please try again.' });
  }
});

// ── Catch-all: serve frontend ─────────────────────────────
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start server after DB is ready ───────────────────────
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Smart Library running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to initialise database:', err.message);
    process.exit(1);
  });
