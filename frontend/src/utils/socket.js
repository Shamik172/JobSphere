import { io } from "socket.io-client";
const socket = io("http://localhost:8080"); //backend URL
// const socket = io("https://backend-jobsphere.onrender.com"); //backend URL
// const socket = io("https://jobsphere-backend-gnrj.onrender.com"); //backend URL
export default socket;
