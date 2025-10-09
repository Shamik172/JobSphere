const express = require("express");
const {protect} = require('../middlewares/authMiddleware')
const {addQuestionWithLink, getQuestionsByAssessment } = require("../controllers/QuestionFetchController");

const router = express.Router();


router.post("/addQuestionWithLink", protect , addQuestionWithLink);
router.get('/getQuestionsByAssessment/:assessment_id' , (req,res,next) => {
  console.log("jfladjfls")
  next()
} ,getQuestionsByAssessment);

module.exports = router;

