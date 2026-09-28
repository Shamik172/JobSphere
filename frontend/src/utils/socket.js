import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  autoConnect: false, // Prevents connecting before the user actually reaches call/collab views
});

export default socket;