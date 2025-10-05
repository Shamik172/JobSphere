// routes/interviewerRoutes.js
const express = require("express");
const { signup, login, logout, deleteAccount } = require("../controllers/interviewerController");
const { protectInterviewer } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.delete("/delete", protectInterviewer, deleteAccount);

module.exports = router;
