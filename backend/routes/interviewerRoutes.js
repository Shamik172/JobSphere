// routes/interviewerRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../config/multer"); // multer for file uploads
const { protectInterviewer } = require("../middlewares/authMiddleware");

const {
  signup,
  login,
  logout,
  deleteAccount,
  verifyAuth,
  getProfile,
  updateProfile,
  uploadProfilePic,
} = require("../controllers/interviewerController");

// ----------------- AUTH -----------------
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify", verifyAuth);

// ----------------- PROFILE -----------------
router.get("/profile",  protectInterviewer, getProfile); // get profile info
router.post("/update",  protectInterviewer, updateProfile); // update profile info


router.post("/profile-pic", protectInterviewer, upload.single("image"), uploadProfilePic); // upload profile pic

// ----------------- DELETE ACCOUNT -----------------
router.delete("/delete", protectInterviewer, deleteAccount);

module.exports = router;
