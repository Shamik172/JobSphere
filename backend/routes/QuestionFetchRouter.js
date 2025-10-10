const express = require("express");
const {protect} = require('../middlewares/authMiddleware')
const {addQuestionWithLink, getAllAssessmentQuestions, getQuestionById, addQuestionWithLinkUseAtcoder } = require("../controllers/QuestionFetchController");

const router = express.Router();


router.post("/addQuestionWithLink", protect , addQuestionWithLinkUseAtcoder);
router.get('/assessment/:assessment_id' ,getAllAssessmentQuestions);
router.get('/:questionId', ( req,res,next) => {
  console.log("sumanta byasdi")
  next()
},getQuestionById);

module.exports = router;

