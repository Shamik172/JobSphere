const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
// const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const socketHandler = require("./sockets/socketHandler");

require("dotenv").config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

// app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

// Socket.io
io.on("connection", (socket) => socketHandler(io, socket));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
