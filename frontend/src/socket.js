import { io } from "socket.io-client";

// Use environment variable for backend URL, fallback to localhost for dev
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const socket = io(BACKEND_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"] // Ensure stable connection
});
