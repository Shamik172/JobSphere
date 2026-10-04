const { User } = require("../models/User");
const AssessmentParticipant = require("../models/AssessmentParticipant");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/mailSender");
const { getAccountActivatedTemplate } = require("../services/emailTemplates");

exports.lookupUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email query is required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select("name email role isActivated");

    if (user) {
      return res.status(200).json({
        exists: true,
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          isActivated: user.isActivated,
        },
      });
    }

    return res.status(200).json({ exists: false });
  } catch (error) {
    console.error("Lookup user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Verify temporary credentials before unlocking new password inputs
exports.verifyTempPassword = async (req, res) => {
  try {
    const { email, tempPassword } = req.body;

    if (!email || !tempPassword) {
      return res.status(400).json({ message: "Email and temporary password are required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanKey = tempPassword.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: "Account not found." });
    }

    if (user.isActivated) {
      return res.status(400).json({ message: "Account is already activated. Please log in directly." });
    }

    // Match against any active, unexpired token in the array
    const validToken = (user.activationTokens || []).find(
      (t) => t.token.toLowerCase() === cleanKey && new Date(t.expiresAt) > new Date()
    );

    if (!validToken) {
      return res.status(401).json({ valid: false, message: "Invalid or expired key." });
    }

    return res.status(200).json({ valid: true, message: "Access key confirmed." });
  } catch (error) {
    console.error("Temp password verification error:", error);
    return res.status(500).json({ message: "Server error verifying password." });
  }
};

exports.activateAccount = async (req, res) => {
  try {
    const { email, tempPassword, newPassword, name } = req.body;

    if (!email || !tempPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Server-side strict password policy
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanKey = tempPassword.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: "Account not found." });
    }

    // Match against any active token
    const tokenIndex = (user.activationTokens || []).findIndex(
      (t) => t.token.toLowerCase() === cleanKey && new Date(t.expiresAt) > new Date()
    );

    if (tokenIndex === -1) {
      return res.status(401).json({ message: "Invalid or expired temporary key." });
    }

    // Update user profile and activate
    const updatedName = name && name.trim() ? name.trim() : user.name;
    user.name = updatedName;
    user.password = newPassword; // Will be hashed by pre-save hook
    user.isActivated = true;
    user.activationTokens = []; // Clear all activation tokens
    await user.save();

    // Synchronize name change to all existing participant records
    try {
      await AssessmentParticipant.updateMany(
        { user: user._id },
        { $set: { name: updatedName } }
      );
    } catch (syncErr) {
      console.warn("Participant name sync notice:", syncErr.message);
    }

    // Set authentication cookie
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "7d" }
    );

    const cookieName = user.role === "interviewer" ? "token" : "candidateToken";
    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send confirmation email asynchronously
    try {
      const emailHtml = getAccountActivatedTemplate({ name: updatedName });
      sendEmail(cleanEmail, "Your JobSphere Account is Active", emailHtml);
    } catch (emailErr) {
      console.warn("Activation confirmation email failed to send:", emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Account activated successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Activation error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};