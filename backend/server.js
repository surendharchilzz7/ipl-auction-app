const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* ✅ HANDLE FAVICON */
app.get("/favicon.ico", (req, res) => res.status(204).end());

/* HEALTH CHECK - Used by UptimeRobot or self-ping */
app.get("/", (req, res) => {
  res.json({ status: "Backend running", uptime: process.uptime() });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

const server = http.createServer(app);
require("./socket")(server);

// --- Contact Us Backend ---
const fs = require('fs');
const path = require('path');
const MESSAGES_FILE = path.join(__dirname, 'data', 'messages.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// POST /api/contact - Save message
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newMessage = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      name,
      email,
      subject: subject || 'General',
      message
    };

    // 1. Log to Console (Reliable on Render)
    console.log('\n--- NEW CONTACT MESSAGE ---');
    console.log(`From: ${name} <${email}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    console.log('---------------------------\n');

    // 2. Save to File (Best effort storage)
    let messages = [];
    if (fs.existsSync(MESSAGES_FILE)) {
      try {
        messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
      } catch (e) { console.error("Error reading messages file:", e); }
    }
    messages.push(newMessage);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));

    res.json({ success: true, message: 'Message received' });
  } catch (error) {
    console.error('Contact API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/messages - Admin view (Simple protection via query param)
app.get('/api/messages', (req, res) => {
  const { key } = req.query;
  // Simple "password" query param: ?key=admin123
  if (key !== 'admin123') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (fs.existsSync(MESSAGES_FILE)) {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
    res.json(JSON.parse(data));
  } else {
    res.json([]);
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  // Note: Self-ping removed to preserve Render free tier hours
  // If you want always-on, use UptimeRobot to ping /health every 5 mins
});
