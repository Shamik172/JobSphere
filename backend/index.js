const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const check = (req, res, next)=>{
  console.log(req);
  next()
}

//local imports
const authRoutes = require("./routes/authRoutes");
const QuestionFetchRouter = require("./routes/QuestionFetchRouter");
const socketHandler = require("./sockets/socketHandler");
const assessmentRoutes = require("./routes/AssessmentRoutes");
const interviewerRoutes = require("./routes/interviewerRoutes");
const candidateRoutes = require("./routes/candidateRoutes");

const codeRoutes = require("./routes/codeRoutes");
const problemRoutes = require('./routes/problemRoutes')
const collabHandler = require("./sockets/collabSocket")


require("dotenv").config();
console.log(process.env.JWT_SECRET);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { 
    origin: "*", 
    methods: ["GET", "POST"], 
    credentials: true,
  },
});

const allowedOrigins = [
  "http://localhost:5173",
  "https://jobsphere-o76y.onrender.com",
  // Your upcoming Vercel domains:
  /https:\/\/.*\.vercel\.app$/, // Allows any vercel preview deployment
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some((allowed) =>
        allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
      );
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/problem', problemRoutes);

app.use("/api/questions", QuestionFetchRouter);
app.use("/api/assessments",assessmentRoutes);
app.use("/api/code",codeRoutes);
app.use("/api/interviewer",interviewerRoutes);
app.use("/api/candidate", candidateRoutes);

// Socket.io
io.on("connection", (socket) => socketHandler(io, socket));
collabHandler(io);

// ✅ Routes
app.use("/api/auth", authRoutes);


// MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));