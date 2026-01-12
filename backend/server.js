const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* ✅ HANDLE FAVICON */
app.get("/favicon.ico", (req, res) => res.status(204).end());

/* OPTIONAL HEALTH CHECK */
app.get("/", (req, res) => {
  res.json({ status: "Backend running" });
});

const server = http.createServer(app);
require("./socket")(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
