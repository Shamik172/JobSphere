const express = require("express");
const {protectInterviewer} = require('../middlewares/authMiddleware')
const {addQuestionWithLink, getAllAssessmentQuestions, getQuestionById, addQuestionWithLinkUseAtcoder } = require("../controllers/QuestionFetchController");

const router = express.Router();


router.post("/addQuestionWithLink", protectInterviewer , addQuestionWithLinkUseAtcoder);
router.get('/assessment/:assessment_id' ,getAllAssessmentQuestions);
router.get('/:questionId',getQuestionById);

module.exports = router;

