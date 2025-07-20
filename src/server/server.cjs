const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create users table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});


// Get all users
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Error retrieving users:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve users' });
    }
    
    res.json({ 
      success: true, 
      users: rows
    });
  });
});

// Rate limiting store (simple in-memory for demo)
const rateLimitStore = new Map();

// Register a new user
app.post('/api/register', (req, res) => {
  const { name, phone, score } = req.body;
  
  // Input validation
  if (!name || !phone || score === undefined) {
    return res.status(400).json({ error: 'Name, phone and score are required' });
  }

  // Validate data types and lengths
  if (typeof name !== 'string' || typeof phone !== 'string' || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid data types' });
  }

  if (name.trim().length < 2 || name.trim().length > 50) {
    return res.status(400).json({ error: 'Name must be between 2 and 50 characters' });
  }

  if (phone.trim().length < 10 || phone.trim().length > 15) {
    return res.status(400).json({ error: 'Phone number must be between 10 and 15 characters' });
  }

  if (score < 0 || score > 1000) {
    return res.status(400).json({ error: 'Score must be between 0 and 1000' });
  }

  // Simple rate limiting (max 5 registrations per IP per minute)
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  
  if (!rateLimitStore.has(clientIP)) {
    rateLimitStore.set(clientIP, []);
  }
  
  const requests = rateLimitStore.get(clientIP).filter(time => now - time < windowMs);
  if (requests.length >= 5) {
    return res.status(429).json({ error: 'Too many registration attempts. Please try again later.' });
  }
  
  requests.push(now);
  rateLimitStore.set(clientIP, requests);

  const stmt = db.prepare('INSERT INTO users (name, phone, score) VALUES (?, ?, ?)');
  stmt.run([name.trim(), phone.trim(), score], function(err) {
    if (err) {
      console.error('Error inserting user:', err.message);
      return res.status(500).json({ error: 'Failed to register user' });
    }
    
    res.json({ 
      success: true, 
      message: 'User registered successfully',
    });
  });
  stmt.finalize();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
}); 