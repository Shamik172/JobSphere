const Interviewer = require("../models/Interviewer");
const Assessment = require("../models/Assessment");

// Create a new assessment for an interviewer
const createAssessment = async (req, res) => {
  try {
    const { interviewerId, name } = req.body;

    if (!interviewerId || !name) {
      return res.status(400).json({ message: "Interviewer ID and Assessment name are required" });
    }

    // Find interviewer
    const interviewer = await Interviewer.findById(interviewerId);
    if (!interviewer) return res.status(404).json({ message: "Interviewer not found" });

    // Create new assessment
    const assessment = new Assessment({ name, questions: [] });
    await assessment.save();

    // Add assessment reference to interviewer
    interviewer.assessments.push(assessment._id);
    await interviewer.save();

    res.status(201).json({
      message: "Assessment created successfully!",
      assessment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createAssessment };
