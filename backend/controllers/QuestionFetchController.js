const Question = require("../models/Question");
const Assessment = require("../models/Assessment");
const { getProblemFromLink } = require("../utils/leetcoderFetcher");
const { generateTestCases } = require("../services/aiTestcaseGenerator");

/**
 * Add a question to an assessment by fetching from link and saving to DB
 */
const addQuestionWithLink = async (req, res) => {
  try {
    const { link, assessmentId } = req.body;
    console.log(req.body);
    const interviewerId = req.user?._id; // optional if authentication added later
  
    // --- Step 1: Validate Inputs ---
    if (!link || !assessmentId)
      return res
        .status(400)
        .json({ message: "Link and assessmentId are required" });

    // --- Step 2: Ensure Assessment Exists ---
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment)
      return res.status(404).json({ message: "Assessment not found" });

    // --- Step 3: Fetch Problem Data from LeetCode ---
    const result = await getProblemFromLink(link);
    if (!result?.data?.question)
      return res
        .status(404)
        .json({ message: "Problem not found or invalid link" });

    const q = result.data.question;

    // --- Step 4: Generate Test Cases (Visible + Hidden) ---
    const generatedCases = await generateTestCases(
      q.title,
      q.content,
      q.exampleTestcases
    );

    // --- Step 5: Create Question in DB ---
    const question = await Question.create({
      assessment: assessmentId,
      added_by: interviewerId,
      title: q.title,
      description: q.content,
      url: link,
      difficulty: q.difficulty || "Medium",
      runTestCases: generatedCases.visible || [],
      hiddenTestCases: generatedCases.hidden || [],
    });

    // --- Step 6: Link Question with Assessment ---
    assessment.questions.push(question._id);
    await assessment.save();

    // --- Step 7: Return Response ---
    return res.status(201).json({
      message: "Question fetched and added successfully!",
      question,
    });
  } catch (err) {
    console.error("Error in addQuestionWithLink:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/**
 * 🔹 Get all questions for a given assessment
 */
const getQuestionsByAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    if (!assessmentId)
      return res.status(400).json({ message: "Assessment ID required" });

    const questions = await Question.find({ assessment: assessmentId })
      .populate("added_by", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ questions });
  } catch (err) {
    console.error("Error in getQuestionsByAssessment:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * 🔹 Delete a specific question
 */
const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const deleted = await Question.findByIdAndDelete(questionId);
    if (!deleted)
      return res.status(404).json({ message: "Question not found" });

    return res.status(200).json({ message: "Question deleted successfully" });
  } catch (err) {
    console.error("Error in deleteQuestion:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * 🔹 Optional: Run candidate code against testcases
 * (For later - when you integrate code execution service)
 */
const runCandidateCode = async (req, res) => {
  try {
    const { questionId, code, language } = req.body;

    // TODO: Integrate with code execution API (like Judge0 or your own sandbox)
    // For now, just send a dummy response
    return res.status(200).json({
      message: "Code executed successfully (mocked)",
      result: "All test cases passed ✅",
    });
  } catch (err) {
    console.error("Error in runCandidateCode:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  addQuestionWithLink,
  getQuestionsByAssessment,
  deleteQuestion,
  runCandidateCode,
};
