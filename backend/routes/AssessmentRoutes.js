const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/AssessmentController');

// --- Routes for Assessments ---

// @route   POST api/assessments
// @desc    Create a new assessment
// @access  Private (requires authentication)
router.post('/', assessmentController.createAssessment);

// @route   GET api/assessments/:id
// @desc    Get full details for a single assessment
// @access  Private
router.get('/:id', assessmentController.getAssessmentDetails);

// @route   POST api/assessments/:id/invite
// @desc    Invite a participant (interviewer or candidate) to an assessment
// @access  Private
router.post('/:id/invite', assessmentController.inviteParticipant);

// @route   POST api/assessments/:id/questions
// @desc    Add a question to an assessment
// @access  Private
router.post('/:id/questions', assessmentController.addQuestion);


module.exports = router;
