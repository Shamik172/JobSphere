const express = require("express");
const { signup, login, logout, deleteAccount, verifyAuth, getMyAssessments, fetchAttemptCode, saveAttemptCode } = require("../controllers/candidateController");
const { protectCandidate } = require("../middlewares/authMiddleware");
const candidateProfileController = require("../controllers/candidateProfileController")
const upload = require("../middlewares/upload");
const { acceptCandidateInvite, declineCandidateInvite, } = require("../controllers/AssessmentController");

const router = express.Router();

//auth check
router.get("/verify", verifyAuth);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.delete("/delete", protectCandidate, deleteAccount);
router.get("/my_assessment", protectCandidate, getMyAssessments);

// ----------------- PROFILE -----------------
router.get('/profile', protectCandidate, candidateProfileController.getProfile);
router.post('/profile/update', protectCandidate, candidateProfileController.updateProfile);

// assessment req accept or reject
router.patch("/assessments/:id/accept", protectCandidate, acceptCandidateInvite);
router.delete("/assessments/:id/decline", protectCandidate, declineCandidateInvite);

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

router.post(
  "/saveAttemptCode",
  protectCandidate, // optional: only logged-in candidates
  saveAttemptCode
);

router.post(
  "/fetchAttemptCode",
  protectCandidate, // optional: only logged-in candidates
  fetchAttemptCode
);

module.exports = router;