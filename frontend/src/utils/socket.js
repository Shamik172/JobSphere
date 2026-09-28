// import { io } from "socket.io-client";
// // const socket = io("http://localhost:8080"); //backend URL
// const socket = io("https://jobsphere-backend-gnrj.onrender.com"); //backend URL
// export default socket;


import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://jobsphere-backend-gnrj.onrender.com";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

export default socket;