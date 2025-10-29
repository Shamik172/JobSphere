import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Users,
  Send,
  FilePlus2,
  Link2,
  Eye,
  Loader2,
  Video,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import QuestionPreviewPopup from "./QuestionPreviewPopup";
import {notify} from "../../notification/Notification"

// --- API Configuration ---
const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Something went wrong with the API request"
    );
  }
  return response.json();
};

const api = {
  createAssessment: async (assessmentData) => {
    const response = await fetch(`${API_BASE_URL}/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assessmentData),
      credentials: "include",
    });
    return handleResponse(response);
  },

  getAssessmentDetails: async (assessmentId) => {
    const response = await fetch(`${API_BASE_URL}/assessments/${assessmentId}`, {
      method: "GET",
      credentials: "include",
    });
    console.log("res: ", response)
    return handleResponse(response);
  },

  inviteParticipant: async (assessmentId, inviteData) => {
    const response = await fetch(`${API_BASE_URL}/assessments/${assessmentId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inviteData),
      credentials: "include",
    });
    return handleResponse(response);
  },

  addQuestion: async (assessmentId, link) => {
    const response = await fetch(`${API_BASE_URL}/questions/addQuestionWithLink`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ link, assessmentId }),
      credentials: "include",
    });
    return handleResponse(response);
  },
};

// --- React Component ---
export default function AssessmentBuilder() {
  const { id } = useParams();
  // console.log("PARAM ID : ", id)
  const navigate = useNavigate();

  const [assessmentId, setAssessmentId] = useState(id || null);
  const [assessment, setAssessment] = useState({ name: "", description: "" });
  const [interviewers, setInterviewers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [roomId, setRoomId] = useState(id, null);

  const [isLoading, setIsLoading] = useState(!!id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [error, setError] = useState(null);

  const [inviteInput, setInviteInput] = useState("");
  const [candidateInput, setCandidateInput] = useState("");
  const [questionUrl, setQuestionUrl] = useState("");
  const [previewQuestion, setPreviewQuestion] = useState(null);

  // --- Fetch Assessment ---
  const fetchAssessmentData = useCallback(async () => {
    console.log("Assessment id : ", assessmentId)
    if (!assessmentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAssessmentDetails(assessmentId);
      console.log("data in assessment : ", data)
      setAssessment({ name: data.name, description: data.description });
      setInterviewers(data.interviewers);
      setCandidates(data.candidates);
      setQuestions(data.questions);
      setRoomId(data.roomId);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch assessment details:", err);
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    fetchAssessmentData();
  }, [fetchAssessmentData]);

  // --- Create Assessment ---
  const handleCreateAssessment = async () => {
    if (!assessment.name.trim() || !assessment.description.trim()) {
      notify("Please provide a name and description.","success");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const newAssessment = await api.createAssessment({
        name: assessment.name,
        description: assessment.description,
      });
      navigate(`/assessment/${newAssessment._id}`);
      setAssessmentId(newAssessment._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Invite Function ---
  const handleInvite = async (email, role) => {
    if (!email.trim() || !assessmentId) return;
    try {
      await api.inviteParticipant(assessmentId, { email, role });
      if (role === "interviewer") setInviteInput("");
      if (role === "candidate") setCandidateInput("");
      fetchAssessmentData();
    } catch (err) {
      notify(`Error: ${err.message}`,"error");
    }
  };

  // --- Add Question via URL ---
  const handleAddQuestion = async () => {
    if (!questionUrl.trim() || !assessmentId) return;
    setIsAddingQuestion(true);
    try {
      const result = await api.addQuestion(assessmentId, questionUrl);
      if (result.question) {
        setPreviewQuestion(result.question);
        setQuestionUrl("");
        await fetchAssessmentData();
        notify("Question added successfully!","success");
      }
    } catch (err) {
      notify(`Error: ${err.message}`,"error");
    } finally {
      setIsAddingQuestion(false);
    }
  };

  const isCreateMode = !assessmentId;

  // --- Loading & Error UI ---
  if (isLoading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-indigo-50">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="ml-4 text-indigo-700 font-semibold">
          Loading Assessment...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex justify-center items-center bg-red-50 text-red-700 font-semibold text-lg">
        Error: {error}
      </div>
    );

  // --- MAIN UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 py-10 px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {/* LEFT PANEL */}
        <div className="md:col-span-1 bg-white rounded-2xl shadow-xl p-6 border border-indigo-100 space-y-6">
          {/* Interviewers */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-indigo-100 to-indigo-200 p-4 rounded-xl"
          >
            <h2 className="text-xl font-bold text-indigo-700 mb-3">
              Interviewers
            </h2>
            {interviewers.length > 0 ? (
              <ul className="space-y-2">
                {interviewers.map((i, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center p-2 bg-indigo-50 rounded-md text-sm text-indigo-800 shadow-sm"
                  >
                    {i.name}
                    <span
                      className={`text-xs font-semibold ${i.status === "Accepted"
                          ? "text-emerald-600"
                          : "text-indigo-400"
                        }`}
                    >
                      {i.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-indigo-400 italic">
                No interviewers invited yet.
              </p>
            )}
          </motion.div>

          {/* Candidates */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-purple-100 to-purple-200 p-4 rounded-xl"
          >
            <h2 className="text-xl font-bold text-purple-700 mb-3">
              Candidates
            </h2>
            {candidates.length > 0 ? (
              <ul className="space-y-2">
                {candidates.map((c, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center p-2 bg-purple-50 rounded-md text-sm text-purple-800 shadow-sm"
                  >
                    {c.name}
                    <span
                      className={`text-xs font-semibold ${c.status === "Accepted"
                          ? "text-emerald-600"
                          : "text-purple-400"
                        }`}
                    >
                      {c.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-purple-400 italic">
                No candidates invited yet.
              </p>
            )}
          </motion.div>
        </div>

        {/* RIGHT PANEL */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-xl p-8 border border-indigo-100 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-indigo-800">
              {isCreateMode ? "Create New Assessment" : assessment.name}
            </h1>

            {!isCreateMode && (
              <button
                onClick={() => navigate(`/videocall/${assessmentId}/${roomId}`)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-5 py-2 rounded-xl shadow-md hover:opacity-90 transition"
              >
                <Video size={18} />
                Join Video Call
              </button>
            )}
          </div>

          {/* Assessment Info */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-indigo-700">
              Assessment Name
            </label>
            <input
              type="text"
              value={assessment.name}
              onChange={(e) =>
                setAssessment({ ...assessment, name: e.target.value })
              }
              placeholder="e.g., Frontend Developer Round 1"
              disabled={!isCreateMode}
              className="w-full border border-indigo-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />

            <label className="block text-sm font-semibold text-indigo-700">
              Description
            </label>
            <textarea
              value={assessment.description}
              onChange={(e) =>
                setAssessment({ ...assessment, description: e.target.value })
              }
              placeholder="Describe the focus, topics, or goals..."
              rows="3"
              disabled={!isCreateMode}
              className="w-full border border-indigo-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Invite + Question */}
          <fieldset disabled={isCreateMode} className="disabled:opacity-50">
            {/* Invite Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    onClick={() => handleInvite(inviteInput, "interviewer")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
                  >
                    <Send size={14} /> Invite
                  </button>
                </div>
              </div>

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
                    onClick={() => handleInvite(candidateInput, "candidate")}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
                  >
                    <Send size={14} /> Invite
                  </button>
                </div>
              </div>
            </div>

            {/* Add Question */}
            <div className="space-y-2 pt-4">
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
                  disabled={isAddingQuestion}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${isAddingQuestion
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                >
                  {isAddingQuestion ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Adding...
                    </>
                  ) : (
                    <>
                      <Link2 size={14} /> Add
                    </>
                  )}
                </button>
              </div>

              {questions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {questions.map((q) => (
                    <motion.div
                      key={q._id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex justify-between items-center shadow-sm"
                    >
                      <span className="text-sm text-indigo-800 font-medium">
                        {q.title}
                      </span>
                      <button
                        onClick={() => setPreviewQuestion(q)}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        <Eye size={12} /> Preview
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </fieldset>

          {/* Save Assessment */}
          {isCreateMode && (
            <div className="pt-4">
              <button
                onClick={handleCreateAssessment}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-5 py-3 rounded-xl shadow-lg hover:opacity-90 transition disabled:opacity-75 flex justify-center items-center"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Save and Continue"}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Preview Modal */}
      {previewQuestion && (
        <QuestionPreviewPopup
          question={previewQuestion}
          onClose={() => setPreviewQuestion(null)}
        />
      )}
    </div>
  );
}
