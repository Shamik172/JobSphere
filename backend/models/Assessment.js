const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String, // HTML content
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Easy",
  },
  testcases: {
    type: String, // JSON or plain string
    default: "",
  },
}, { _id: false }); // each question won't have its own _id

const AssessmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  questions: [QuestionSchema], // array of questions
}, { timestamps: true });

module.exports = mongoose.model("Assessment", AssessmentSchema);
