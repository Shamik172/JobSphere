// controllers/interviewerController.js
const Interviewer = require("../models/Interviewer");
const jwt = require("jsonwebtoken");

// 🔹 Helper: Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// @desc Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let interviewer = await Interviewer.findOne({ email });
    if (interviewer) {
      return res.status(400).json({ message: "Email already exists" });
    }

    interviewer = await Interviewer.create({ name, email, password });

    const token = generateToken(interviewer._id);
    res.status(201).json({
      message: "Signup successful",
      token,
      user: { id: interviewer._id, name: interviewer.name, email: interviewer.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const interviewer = await Interviewer.findOne({ email });
    if (!interviewer) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await interviewer.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(interviewer._id);
    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: interviewer._id, name: interviewer.name, email: interviewer.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Logout (handled client-side, but can blacklist token if needed)
exports.logout = async (req, res) => {
  try {
    // Frontend should just delete token. Optionally add token blacklist logic here.
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Delete Account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id; // coming from authMiddleware
    await Interviewer.findByIdAndDelete(userId);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
