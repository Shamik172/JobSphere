const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/AssessmentController');
const { protectInterviewer, protectUser } = require('../middlewares/authMiddleware');

// Interviewer Only routes
router.get('/latest', protectInterviewer, assessmentController.getLatestAssessments);
router.get('/my-assessments', protectInterviewer, assessmentController.getMyAssessments);
router.post('/', protectInterviewer, assessmentController.createAssessment);
router.get('/:id', protectInterviewer, assessmentController.getAssessmentDetails);
router.post('/:id/invite', protectInterviewer, assessmentController.inviteParticipant);
router.post('/:id/resend-invite', protectInterviewer, assessmentController.resendInvite);
router.delete('/:id/participant/:participantId', protectInterviewer, assessmentController.removeParticipant);
router.patch('/:id/acknowledge', protectInterviewer, assessmentController.acknowledgeInvitation);
router.patch('/:id/status', protectInterviewer, assessmentController.updateAssessmentStatus);

// Shared route (Candidates + Interviewers)
router.get('/:id/room/:roomId/verify', protectUser, assessmentController.verifyRoomAccess);

module.exports = router;