// controllers/candidateController.js
const Candidate = require("../models/Candidate");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// @desc Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone, skills, experience } = req.body;

    let candidate = await Candidate.findOne({ email });
    if (candidate) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const profileData = {};
    if (phone) profileData.phone = phone;
    if (skills) profileData.skills = skills;
    if (experience) profileData.experience = experience;

    candidate = await Candidate.create({ 
      name, 
      email, 
      password,
      profile: profileData
    });

    const token = generateToken(candidate._id);
    res.status(201).json({
      message: "Signup successful",
      token,
      user: { 
        id: candidate._id, 
        name: candidate.name, 
        email: candidate.email,
        role: "candidate",
        profile: candidate.profile
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const candidate = await Candidate.findOne({ email });
    if (!candidate) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await candidate.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(candidate._id);
    res.status(200).json({
      message: "Login successful",
      token,
      user: { 
        id: candidate._id, 
        name: candidate.name, 
        email: candidate.email,
        role: "candidate",
        profile: candidate.profile
      },
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
    await Candidate.findByIdAndDelete(userId);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, skills, experience, resume } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData['profile.phone'] = phone;
    if (skills) updateData['profile.skills'] = skills;
    if (experience) updateData['profile.experience'] = experience;
    if (resume) updateData['profile.resume'] = resume;

    const candidate = await Candidate.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: candidate
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Get Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const candidate = await Candidate.findById(userId).select("-password");
    
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json({
      message: "Profile retrieved successfully",
      user: candidate
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
