const jwt = require("jsonwebtoken");
const { Candidate, Interviewer, User } = require("../models/User");

// Middleware for Candidate
exports.protectCandidate = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authorized, no token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Candidate.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "Candidate not found" });

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Middleware for Interviewer
exports.protectInterviewer = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authorized, no token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Interviewer.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "Interviewer not found" });

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Unified middleware for either Interviewer OR Candidate (for video calls & common APIs)
exports.protectUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authorized, please log in" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User account not found" });

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Session expired or invalid token" });
  }
};