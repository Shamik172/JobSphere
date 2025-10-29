const express = require("express");
const {signup, login, logout, deleteAccount, verifyAuth ,getMyAssessments} = require("../controllers/candidateController");
const { protectCandidate } = require("../middlewares/authMiddleware");

const router = express.Router();

const candidateProfileController = require("../controllers/candidateProfileController")
const upload = require("../middlewares/upload");

router.post("/signup",signup);
router.post("/login",login);
router.post("/logout",logout);
router.delete("/delete",protectCandidate,deleteAccount);
router.get("/my_assessment", protectCandidate, getMyAssessments);

//auth check
router.get("/verify", verifyAuth);

// ----------------- PROFILE -----------------
router.get('/profile', protectCandidate, candidateProfileController.getProfile);
router.post('/profile/update', protectCandidate, candidateProfileController.updateProfile);
// Upload files using multer
router.post(
  "/profile/upload",
  protectCandidate,
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  candidateProfileController.uploadFiles
);

module.exports = router;