// controllers/interviewerController.js
const Interviewer = require("../models/Interviewer");
const jwt = require("jsonwebtoken");

// 🔹 Helper: Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// @desc Signup
// @desc Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await Interviewer.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    await Interviewer.create({ name, email, password });

    res.status(201).json({ message: "Signup successful! Please login to continue." });
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

    // ✅ Send token as HttpOnly cookie instead of JSON
    res.cookie("token", token, {
      httpOnly: true,      // JS can't read
      secure: true,        // only https
      sameSite: "strict",  // CSRF protection
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// @desc Logout (clear the HttpOnly cookie)
exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Delete Account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id; // set by authMiddleware
    await Interviewer.findByIdAndDelete(userId);

    // also clear token cookie after account deletion
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




//auth check

exports.verifyAuth = async (req, res) => {
  try {
    const token = req.cookies.token; // cookie me token

    if (!token) {
      return res.json({ loggedIn: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Interviewer.findById(decoded.id);

    if (!user) {
      return res.json({ loggedIn: false });
    }

    res.json({ loggedIn: true }); // sirf boolean
  } catch (err) {
    res.json({ loggedIn: false });
  }
};