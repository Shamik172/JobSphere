const Interviewer = require("../models/Interviewer");
const Assessment = require("../models/Assessment");
const { getProblemFromLink } = require("../utils/leetcoderFetcher");
const { generateTestCases } = require("../services/aiTestcaseGenerator"); // AI or custom generator

const fetchProblem = async (req, res) => {

  console.log("Fetch problem request body:", req.body);
  try {
    const { link, assessmentId } = req.body;
    



    // console.log("Received link to fetch:", link);
    const result = await getProblemFromLink(link);
    console.log("Fetched problem data:", result);
    if (!result?.data?.question) {
      return res.status(400).json({ message: "Problem not found" });
    }


    const q = result.data.question;

    // Generate extra test cases dynamically generateTestCases
    const generatedCases = await generateTestCases(q.title, q.content, q.exampleTestcases);
    console.log("test case", generatedCases);
    // Prepare question object
    const question = {
      title: q.title,
      content: q.content,
      difficulty: q.difficulty,
      // Save all testcases (example + AI-generated) as JSON string
      testcases: JSON.stringify({
        sample: q.exampleTestcases,
        generated: generatedCases,
      }),
    };
    // console.log("Fetched question:", question);
    // Find existing assessment
    // const assessment = await Assessment.findById(assessmentId);
    // if (!assessment) return res.status(404).json({ message: "Assessment not found" });

    // Add question to assessment
    // assessment.questions.push(question);
    // await assessment.save();

    res.json({ message: "Question added successfully!", question });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { fetchProblem };

