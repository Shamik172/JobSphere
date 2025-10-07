const express = require("express");
const {protect} = require('../middlewares/authMiddleware')
const {addQuestionWithLink } = require("../controllers/QuestionFetchController");

const router = express.Router();


router.post("/addQuestionWithLink", protect , addQuestionWithLink);
module.exports = router;

