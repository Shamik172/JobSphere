const express = require("express");
const {protect} = require('../middlewares/authMiddleware')
const {addQuestionWithLink, getAllAssessmentQuestions, getQuestionById } = require("../controllers/QuestionFetchController");

const router = express.Router();


router.post("/addQuestionWithLink", protect , addQuestionWithLink);
router.get('/assessment/:assessment_id' ,getAllAssessmentQuestions);
router.get('/:questionId',getQuestionById);

module.exports = router;

