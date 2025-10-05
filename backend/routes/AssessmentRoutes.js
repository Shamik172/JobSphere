const express = require("express");
const router = express.Router();
const { createAssessment } = require("../controllers/assessmentController");

router.post("/create", createAssessment);

module.exports = router;
