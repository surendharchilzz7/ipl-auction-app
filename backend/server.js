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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  // Note: Self-ping removed to preserve Render free tier hours
  // If you want always-on, use UptimeRobot to ping /health every 5 mins
});
