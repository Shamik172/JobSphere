const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const QuestionFetchRouter = require("./routes/QuestionFetchRouter");
const socketHandler = require("./sockets/socketHandler");
const assessmentRoutes = require("./routes/AssessmentRoutes");
const interviewerRoutes = require("./routes/interviewerRoutes");
const candidateRoutes = require("./routes/candidateRoutes");


const bodyParser = require("body-parser");
const codeRoutes = require("./routes/codeRoutes");


require("dotenv").config();
console.log(process.env.JWT_SECRET);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use("/api/auth", authRoutes);
// app.get("/", (req,res) => {
//   res.send("hello")
// });

app.use("/api/rooms", roomRoutes);
app.use("/api/questions", QuestionFetchRouter);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/interviewer", interviewerRoutes);
app.use("/api/candidate", candidateRoutes);



// Socket.io
io.on("connection", (socket) => socketHandler(io, socket));

// ✅ Routes
app.use("/api/auth", authRoutes);

// MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
