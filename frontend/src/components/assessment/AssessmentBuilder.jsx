import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Users, Send, FilePlus2, Link2, Eye } from "lucide-react";
import QuestionPreviewPopup from "./QuestionPreviewPopup"; // NEW popup component

export default function AssessmentBuilder() {
  const [assessment, setAssessment] = useState({
    name: "Frontend Developer Round 1",
    description: "Focus on JavaScript, React, and problem-solving skills.",
  });

  const [interviewers, setInterviewers] = useState([
    { name: "Alex Johnson", status: "Invited" },
    { name: "Priya Sharma", status: "Accepted" },
    { name: "K. Patel", status: "Invited" },
  ]);

  const [candidates, setCandidates] = useState([
    { name: "John Doe", status: "Invited" },
    { name: "Sara Lee", status: "Accepted" },
  ]);

  const [inviteInput, setInviteInput] = useState("");
  const [candidateInput, setCandidateInput] = useState("");
  const [questionUrl, setQuestionUrl] = useState("");
  const [questions, setQuestions] = useState([
    {
      id: 1,
      title: "Two Sum Problem",
      description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.`,
      examples: [{ input: "[2,7,11,15], target=9", output: "[0,1]" }],
      tags: ["Array", "HashMap"],
      difficulty: "Easy",
      addedBy: "Alex Johnson",
    },
    {
      id: 2,
      title: "React Hooks Challenge",
      description: `Create a custom hook to manage form input values.`,
      examples: [{ input: "<FormInput />", output: "Custom hook manages state" }],
      tags: ["React", "Hooks"],
      difficulty: "Medium",
      addedBy: "Priya Sharma",
    },
  ]);

  const [previewQuestion, setPreviewQuestion] = useState(null);

  const handleAddInterviewer = () => {
    if (!inviteInput.trim()) return;
    setInterviewers([...interviewers, { name: inviteInput, status: "Invited" }]);
    setInviteInput("");
  };

  const handleAddCandidate = () => {
    if (!candidateInput.trim()) return;
    setCandidates([...candidates, { name: candidateInput, status: "Invited" }]);
    setCandidateInput("");
  };

  const handleAddQuestion = () => {
    if (!questionUrl.trim()) return;
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        title: `Question from: ${questionUrl}`,
        description: "Description will be fetched later...",
        examples: [],
        tags: [],
        difficulty: "Medium",
        addedBy: "You",
      },
    ]);
    setQuestionUrl("");
  };

  const handlePreviewQuestion = (question) => {
    setPreviewQuestion(question); // Show popup
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 py-10 px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {/* LEFT PANEL - Members */}
        <div className="md:col-span-1 bg-white rounded-2xl shadow-xl p-6 border border-indigo-100 space-y-6">
          {/* Interviewers */}
          <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-r from-indigo-100 to-indigo-200 p-4 rounded-xl">
            <h2 className="text-xl font-bold text-indigo-700 mb-3">Interviewers</h2>
            {interviewers.length ? (
              <ul className="space-y-2">
                {interviewers.map((i, idx) => (
                  <li key={idx} className="flex justify-between items-center p-2 bg-indigo-50 rounded-md text-sm text-indigo-800 shadow-sm">
                    {i.name}
                    <span className={`text-xs font-semibold ${i.status === "Accepted" ? "text-emerald-600" : "text-indigo-400"}`}>{i.status}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-xs text-indigo-300 italic">No interviewers yet</p>}
          </motion.div>

          {/* Candidates */}
          <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-r from-purple-100 to-purple-200 p-4 rounded-xl">
            <h2 className="text-xl font-bold text-purple-700 mb-3">Candidates</h2>
            {candidates.length ? (
              <ul className="space-y-2">
                {candidates.map((c, idx) => (
                  <li key={idx} className="flex justify-between items-center p-2 bg-purple-50 rounded-md text-sm text-purple-800 shadow-sm">
                    {c.name}
                    <span className={`text-xs font-semibold ${c.status === "Accepted" ? "text-emerald-600" : "text-purple-400"}`}>{c.status}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-xs text-purple-300 italic">No candidates yet</p>}
          </motion.div>
        </div>

        {/* RIGHT PANEL - Assessment Form */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-xl p-8 border border-indigo-100 space-y-6">
          <h1 className="text-3xl font-bold text-indigo-800">Create New Assessment</h1>

          {/* Assessment Details */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-indigo-700">Assessment Name</label>
            <input
              type="text"
              value={assessment.name}
              onChange={(e) => setAssessment({ ...assessment, name: e.target.value })}
              placeholder="Frontend Developer Round 1"
              className="w-full border border-indigo-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <label className="block text-sm font-semibold text-indigo-700">Description</label>
            <textarea
              value={assessment.description}
              onChange={(e) => setAssessment({ ...assessment, description: e.target.value })}
              placeholder="Describe the focus, topics, or goals..."
              rows="3"
              className="w-full border border-indigo-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Invite Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Interviewers */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
                <Users size={16} /> Invite Interviewers
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  placeholder="Enter email"
                  className="flex-1 border border-indigo-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleAddInterviewer}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
                >
                  <Send size={14} /> Invite
                </button>
              </div>
            </div>

            {/* Candidates */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-purple-700 flex items-center gap-2">
                <UserPlus size={16} /> Invite Candidates
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={candidateInput}
                  onChange={(e) => setCandidateInput(e.target.value)}
                  placeholder="Enter candidate email"
                  className="flex-1 border border-purple-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleAddCandidate}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
                >
                  <Send size={14} /> Invite
                </button>
              </div>
            </div>
          </div>

          {/* Add Questions */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
              <FilePlus2 size={16} /> Add Questions via URL
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={questionUrl}
                onChange={(e) => setQuestionUrl(e.target.value)}
                placeholder="Paste question URL"
                className="flex-1 border border-indigo-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddQuestion}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
              >
                <Link2 size={14} /> Add
              </button>
            </div>

            {questions.length > 0 && (
              <div className="mt-3 space-y-2">
                {questions.map((q) => (
                  <motion.div
                    key={q.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex justify-between items-center shadow-sm"
                  >
                    <span className="text-sm text-indigo-800 font-medium">{q.title}</span>
                    <button
                      onClick={() => handlePreviewQuestion(q)}
                      className="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      <Eye size={12} /> Preview
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-5 py-3 rounded-xl shadow-lg hover:opacity-90 transition">
              Save Assessment
            </button>
          </div>
        </div>
      </motion.div>

      {/* --- Question Preview Popup --- */}
      {previewQuestion && (
        <QuestionPreviewPopup
          question={previewQuestion}
          onClose={() => setPreviewQuestion(null)}
        />
      )}
    </div>
  );
}