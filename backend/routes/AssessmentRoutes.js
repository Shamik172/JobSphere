const express = require("express");
const router = express.Router();
const { createAssessment } = require("../controllers/AssessmentController");

router.post("/create", createAssessment);

module.exports = router;
