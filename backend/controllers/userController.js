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

exports.activateAccount = async (req, res) => {
  try {
    const { email, tempPassword, newPassword, name } = req.body;

    if (!email || !tempPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Server-side strict password policy
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    const isMatch = await user.comparePassword(tempPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect temporary password" });
    }

    // Update user profile
    const updatedName = name && name.trim() ? name.trim() : user.name;
    user.name = updatedName;
    user.password = newPassword;
    user.isActivated = true;
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



// Verify temporary credentials before unlocking new password inputs
exports.verifyTempPassword = async (req, res) => {
  try {
    const { email, tempPassword } = req.body;

    if (!email || !tempPassword) {
      return res.status(400).json({ message: "Email and temporary password are required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: "Account not found." });
    }

    const isMatch = await user.comparePassword(tempPassword.trim());
    if (!isMatch) {
      return res.status(401).json({ valid: false, message: "Incorrect temporary password." });
    }

    return res.status(200).json({ valid: true, message: "Temporary password verified." });
  } catch (error) {
    console.error("Temp password verification error:", error);
    return res.status(500).json({ message: "Server error verifying password." });
  }
};