const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const Database = require('better-sqlite3');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'super-secret-key'; // Intentionally weak

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Initialize SQLite database
const db = new Database(':memory:');

// Setup database with vulnerable data
db.exec(`CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  email TEXT,
  role TEXT,
  secret_data TEXT
)`);

db.exec(`CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  price REAL,
  description TEXT
)`);

db.exec(`CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  product_id INTEGER,
  status TEXT
)`);

// Insert sample data
const insertUser = db.prepare('INSERT INTO users (username, password, email, role, secret_data) VALUES (?, ?, ?, ?, ?)');
const users = [
  ['admin', 'admin123', 'admin@demo.com', 'admin', 'FLAG{admin_secret_data}'],
  ['user1', 'password', 'user1@demo.com', 'user', 'User1 private info'],
  ['user2', 'pass123', 'user2@demo.com', 'user', 'User2 private info']
];
users.forEach(user => insertUser.run(...user));

const insertProduct = db.prepare('INSERT INTO products (name, price, description) VALUES (?, ?, ?)');
const products = [
  ['Laptop', 999.99, 'High-performance laptop'],
  ['Phone', 599.99, 'Latest smartphone'],
  ['Tablet', 399.99, 'Portable tablet']
];
products.forEach(product => insertProduct.run(...product));

// ======================
// VULNERABLE ENDPOINTS
// ======================

// 1. SQL INJECTION VULNERABILITY
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Vulnerable to SQL injection - directly concatenating user input
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  try {
    const user = db.prepare(query).get();
    
    if (user) {
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY);
      res.json({ 
        success: true, 
        token, 
        user: { id: user.id, username: user.username, role: user.role }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});
// 2. XSS VULNERABILITY (Example endpoint)
app.get('/api/search', (req, res) => {
  const searchTerm = req.query.q || '';
  try {
    const products = db.prepare(`SELECT * FROM products WHERE name LIKE '%${searchTerm}%'`).all();
    res.json({
      searchTerm: searchTerm, // XSS vulnerability - not sanitized
      results: products || [],
      message: `Search results for: ${searchTerm}`
    });
  } catch (err) {
    res.status(500).json({ error: 'Search error', details: err.message });
  }
});

// 3. SENSITIVE DATA EXPOSURE
app.get('/api/user/:id', (req, res) => {
  const userId = req.params.id;
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (user) {
      // Leaking sensitive information
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        secret_data: user.secret_data
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});
// 4. BROKEN AUTHENTICATION - Weak JWT verification
app.get('/api/admin', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    // Vulnerable: accepts 'none' algorithm
    const decoded = jwt.decode(token);
    
    // Weak check - only verifies role from decoded token without proper verification
    if (decoded && decoded.role === 'admin') {
      const users = db.prepare('SELECT username, email, role FROM users').all();
      res.json({ 
        message: 'Admin access granted!', 
        flag: 'FLAG{broken_auth_bypass}',
        allUsers: users
      });
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
});

// 5. INFORMATION DISCLOSURE
app.get('/api/config', (req, res) => {
  // Exposing sensitive configuration
  res.json({
    database: 'sqlite://memory',
    secret_key: SECRET_KEY,
    admin_panel: '/admin',
    debug_mode: true,
    api_keys: {
      stripe: 'sk_test_fake_key',
      aws: 'AKIAIOSFODNN7EXAMPLE'
    }
  });
});

// 6. MASS ASSIGNMENT VULNERABILITY
app.post('/api/register', (req, res) => {
  const { username, password, email } = req.body;
  
  // Vulnerable: doesn't validate input, allows role assignment
  const role = req.body.role || 'user'; // User can set their own role!
  
  try {
    const result = db.prepare(
      'INSERT INTO users (username, password, email, role, secret_data) VALUES (?, ?, ?, ?, ?)'
    ).run(username, password, email, role, 'New user data');
    
    res.json({ 
      success: true, 
      userId: result.lastInsertRowid,
      message: 'User registered successfully',
      role: role
    });
  } catch (err) {
    res.status(400).json({ error: 'User already exists or invalid data' });
  }
});

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Vulnerable Security Demo App running on http://localhost:${PORT}`);
  console.log('WARNING: This application contains intentional vulnerabilities for educational purposes only!');
});
