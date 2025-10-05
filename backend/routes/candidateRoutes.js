// routes/candidateRoutes.js
const express = require("express");
const { 
  signup, 
  login, 
  logout, 
  deleteAccount, 
  updateProfile, 
  getProfile 
} = require("../controllers/candidateController");
const { protectCandidate } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes
router.get("/profile", protectCandidate, getProfile);
router.put("/profile", protectCandidate, updateProfile);
router.delete("/delete", protectCandidate, deleteAccount);

module.exports = router;
