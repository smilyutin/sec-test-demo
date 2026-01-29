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
  
  // Input validation
  if (!username || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  
  if (!email || email.trim().length === 0) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  // Password validation
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  if (password.includes(' ')) {
    return res.status(400).json({ error: 'Password cannot contain spaces' });
  }
  
  // Email validation
  if (email.length > 100) {
    return res.status(400).json({ error: 'Email address is too long' });
  }
  
  // Username validation
  if (username.length > 50) {
    return res.status(400).json({ error: 'Username is too long' });
  }
  
  // Username format validation - only allow alphanumeric characters and underscores
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
  }
  
  // Prevent XSS - check for script tags and HTML in username
  const xssPattern = /<script|<\/script|javascript:|on\w+\s*=|<iframe|<object|<embed/i;
  if (xssPattern.test(username)) {
    return res.status(400).json({ error: 'Username contains invalid characters' });
  }
  
  // Vulnerable: doesn't validate input, allows role assignment
  const role = req.body.role || 'user'; // User can set their own role!
  
  try {
    const result = db.prepare(
      'INSERT INTO users (username, password, email, role, secret_data) VALUES (?, ?, ?, ?, ?)'
    ).run(username.trim(), password, email.trim(), role, 'New user data');
    
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

// ====================================
// ML ANOMALY DETECTION MOCK ENDPOINTS
// ====================================

// Mock ML input validation endpoint
app.post('/api/ml/validate-input', (req, res) => {
  const { input } = req.body;
  
  const validation = {
    isValid: true,
    inputLength: input ? input.length : 0,
    hasSpecialChars: input && (/[<>\"'&]/.test(input)),
    encoding: 'utf-8',
    sanitized: input ? input.replace(/[<>\"'&]/g, '') : ''
  };
  
  // Simulate validation failures for edge cases
  if (!input || input.length === 0) {
    validation.isValid = false;
  }
  if (input && input.length > 5000) {
    validation.isValid = false;
  }
  
  res.json({
    success: validation.isValid,
    data: validation,
    timestamp: Date.now()
  });
});

// Mock feature extraction endpoint
app.post('/api/ml/extract-features', (req, res) => {
  const { request } = req.body;
  
  // Parse request string to extract features
  const features = {
    method: 'GET',
    endpoint: '/unknown',
    payloadSize: 0,
    hasScript: false,
    hasSqlKeywords: false,
    hasSpecialChars: false,
    timestamp: Date.now()
  };
  
  if (request) {
    const parts = request.split(' ');
    if (parts.length >= 2) {
      features.method = parts[0];
      features.endpoint = parts[1];
    }
    
    const requestLower = request.toLowerCase();
    features.hasScript = requestLower.includes('<script>') || requestLower.includes('javascript:');
    features.hasSqlKeywords = /\b(select|union|insert|delete|drop|or|and|where)\b/i.test(request);
    features.hasSpecialChars = /[<>\"'&;]/.test(request);
    features.payloadSize = request.length;
  }
  
  res.json({
    success: true,
    features,
    featureVector: [
      features.payloadSize,
      features.hasScript ? 1 : 0,
      features.hasSqlKeywords ? 1 : 0,
      features.hasSpecialChars ? 1 : 0
    ]
  });
});

// Mock ML prediction endpoint
app.post('/api/ml/predict', (req, res) => {
  const { input, threshold = 0.5 } = req.body;
  
  let anomalyScore = 0;
  
  if (input) {
    const inputLower = input.toLowerCase();
    
    // Simulate ML scoring based on suspicious patterns
    if (inputLower.includes('<script>') || inputLower.includes('javascript:')) anomalyScore += 0.8;
    if (inputLower.includes("' or '") || inputLower.includes('union select')) anomalyScore += 0.9;
    if (inputLower.includes('admin') && inputLower.includes('password')) anomalyScore += 0.3;
    if (/\b(drop|delete|insert)\b/i.test(input)) anomalyScore += 0.7;
    if (input.length > 1000) anomalyScore += 0.2;
    if (/[<>\"'&;]/.test(input)) anomalyScore += 0.1;
  }
  
  // Cap at 1.0 and add some randomness
  anomalyScore = Math.min(1.0, anomalyScore + (Math.random() - 0.5) * 0.1);
  
  res.json({
    success: true,
    score: Math.round(anomalyScore * 1000) / 1000,
    prediction: anomalyScore > threshold ? 'anomaly' : 'normal',
    confidence: Math.round((anomalyScore > threshold ? anomalyScore : 1 - anomalyScore) * 1000) / 1000,
    threshold,
    timestamp: Date.now()
  });
});

// Mock ML classification endpoint
app.post('/api/ml/classify', (req, res) => {
  const { input } = req.body;
  
  let prediction = 'normal';
  let confidence = 0.5;
  
  if (input) {
    const inputLower = input.toLowerCase();
    
    // Classification logic
    if (inputLower.includes('<script>') || inputLower.includes('alert(')) {
      prediction = 'attack';
      confidence = 0.95;
    } else if (inputLower.includes("' or '") || inputLower.includes('--')) {
      prediction = 'attack';
      confidence = 0.92;
    } else if (inputLower.includes('admin') || inputLower.includes('root')) {
      prediction = 'attack';
      confidence = 0.7;
    } else if (inputLower.includes('normal') || inputLower.includes('login') || inputLower.includes('search')) {
      prediction = 'normal';
      confidence = 0.85;
    }
  }
  
  res.json({
    success: true,
    prediction,
    confidence: Math.round(confidence * 1000) / 1000,
    categories: {
      normal: prediction === 'normal' ? confidence : 1 - confidence,
      attack: prediction === 'attack' ? confidence : 1 - confidence
    },
    timestamp: Date.now()
  });
});

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Vulnerable Security Demo App running on http://localhost:${PORT}`);
  console.log('WARNING: This application contains intentional vulnerabilities for educational purposes only!');
});
