const express = require("express");
const {fetchProblem } = require("../controllers/questionFetchController");

const router = express.Router();


router.post("/fetch-question", fetchProblem);
module.exports = router;

