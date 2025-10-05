// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const Interviewer = require("../models/Interviewer");
const Candidate = require("../models/Candidate");

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to find user in both Interviewer and Candidate collections
    let user = await Interviewer.findById(decoded.id).select("-password");
    if (user) {
      req.user = user;
      req.userType = "interviewer";
    } else {
      user = await Candidate.findById(decoded.id).select("-password");
      if (user) {
        req.user = user;
        req.userType = "candidate";
      }
    }

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Middleware to protect interviewer-only routes
exports.protectInterviewer = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Interviewer.findById(decoded.id).select("-password");
    
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized as interviewer" });
    }
    
    req.userType = "interviewer";
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Middleware to protect candidate-only routes
exports.protectCandidate = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Candidate.findById(decoded.id).select("-password");
    
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized as candidate" });
    }
    
    req.userType = "candidate";
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
