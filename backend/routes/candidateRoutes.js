const express = require("express");
const {signup, login, logout, deleteAccount, verifyAuth ,getMyAssessments} = require("../controllers/candidateController");
const { protectCandidate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup",signup);
router.post("/login",login);
router.post("/logout",logout);
router.delete("/delete",protectCandidate,deleteAccount);
router.get("/my_assessment", protectCandidate, getMyAssessments);

//auth check
router.get("/verify", verifyAuth);

module.exports = router;