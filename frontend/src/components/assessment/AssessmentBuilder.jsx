import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Users,
  Send,
  FilePlus2,
  Link2,
  Eye,
  Loader2,
  Video,
  Trash2,
  RotateCw,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import QuestionPreviewPopup from "./QuestionPreviewPopup";
import { notify } from "../../notification/Notification";
import socket from "../../utils/socket";

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Request failed");
  }
  return response.json();
};

const api = {
  createAssessment: (data) =>
    fetch(`${API_BASE_URL}/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    }).then(handleResponse),

  getAssessmentDetails: (id) =>
    fetch(`${API_BASE_URL}/assessments/${id}`, {
      method: "GET",
      credentials: "include",
    }).then(handleResponse),

  inviteParticipant: (assessmentId, data) =>
    fetch(`${API_BASE_URL}/assessments/${assessmentId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    }).then(handleResponse),

  resendInvite: (assessmentId, participantId) =>
    fetch(`${API_BASE_URL}/assessments/${assessmentId}/resend-invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId }),
      credentials: "include",
    }).then(handleResponse),

  removeParticipant: (assessmentId, participantId) =>
    fetch(`${API_BASE_URL}/assessments/${assessmentId}/participant/${participantId}`, {
      method: "DELETE",
      credentials: "include",
    }).then(handleResponse),

  addQuestion: (assessmentId, link) =>
    fetch(`${API_BASE_URL}/questions/addQuestionWithLink`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ link, assessmentId }),
      credentials: "include",
    }).then(handleResponse),
};

export default function AssessmentBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assessmentId, setAssessmentId] = useState(id || null);
  const [assessment, setAssessment] = useState({
    name: "",
    description: "",
    scheduledAt: "",
    duration: 60,
  });
  const [interviewers, setInterviewers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [roomId, setRoomId] = useState(null);

  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState(null);

  // Invite states with automatic name prefill
  const [inviteData, setInviteData] = useState({
    interviewerName: "",
    interviewerEmail: "",
    candidateName: "",
    candidateEmail: "",
  });

  const [questionUrl, setQuestionUrl] = useState("");
  const [previewQuestion, setPreviewQuestion] = useState(null);

  const isCreateMode = !assessmentId;

  // Clean name suggester: e.g. "alex.smith_99@gmail.com" -> "Alex Smith"
  const suggestName = (email) => {
    if (!email || !email.includes("@")) return "";
    const prefix = email.split("@")[0];
    return prefix
      .replace(/[._0-9-]+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  useEffect(() => {
    setAssessmentId(id || null);
  }, [id]);


  useEffect(() => {
    if (!roomId) return;

    if (!socket.connected) {
      socket.connect();
    }

    // Join the room channel so this hub receives live updates
    socket.emit("join-room", { roomId, userId: null });

    const handlePresenceChanged = ({ userId, presence }) => {
      setInterviewers((prev) =>
        prev.map((inv) =>
          inv.userId?.toString() === userId?.toString()
            ? { ...inv, presence }
            : inv
        )
      );
      setCandidates((prev) =>
        prev.map((cand) =>
          cand.userId?.toString() === userId?.toString()
            ? { ...cand, presence }
            : cand
        )
      );
    };

    socket.on("participant-presence-changed", handlePresenceChanged);

    return () => {
      socket.off("participant-presence-changed", handlePresenceChanged);
    };
  }, [roomId]);

  const fetchAssessmentData = useCallback(async () => {
    if (!assessmentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAssessmentDetails(assessmentId);
      setAssessment({
        name: data.name || "",
        description: data.description || "",
        scheduledAt: data.scheduledAt ? data.scheduledAt.substring(0, 16) : "",
        duration: data.duration || 60,
      });
      setInterviewers(data.interviewers || []);
      setCandidates(data.candidates || []);
      setQuestions(data.questions || []);
      setRoomId(data.roomId || null);
    } catch (err) {
      setError(err.message);
      notify(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    if (assessmentId) fetchAssessmentData();
  }, [assessmentId, fetchAssessmentData]);

  // Automatically flips an invited co-interviewer's status to 'Accepted' upon visiting
  useEffect(() => {
    if (assessmentId && !isCreateMode) {
      fetch(`${API_BASE_URL}/assessments/${assessmentId}/acknowledge`, {
        method: "PATCH",
        credentials: "include",
      }).catch((err) => console.debug("Acknowledge skipped or already accepted:", err));
    }
  }, [assessmentId, isCreateMode]);

  const handleCreateAssessment = async () => {
    if (!assessment.name.trim() || !assessment.description.trim()) {
      notify("Please provide assessment title and objective.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const newAssessment = await api.createAssessment(assessment);
      setAssessmentId(newAssessment._id);
      notify("Assessment workspace initiated!", "success");
      navigate(`/assessments/${newAssessment._id}`);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvite = async (role) => {
    const isInterviewer = role === "interviewer";
    const email = isInterviewer ? inviteData.interviewerEmail : inviteData.candidateEmail;
    const name = isInterviewer ? inviteData.interviewerName : inviteData.candidateName;

    if (!email.trim() || !assessmentId) return;

    try {
      await api.inviteParticipant(assessmentId, { email, role, name });
      notify(`Invitation delivered to ${email}`, "success");
      if (isInterviewer) {
        setInviteData((prev) => ({ ...prev, interviewerEmail: "", interviewerName: "" }));
      } else {
        setInviteData((prev) => ({ ...prev, candidateEmail: "", candidateName: "" }));
      }
      fetchAssessmentData();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleResend = async (participantId) => {
    setActionLoadingId(participantId);
    try {
      await api.resendInvite(assessmentId, participantId);
      notify("Invitation re-sent successfully!", "success");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemove = async (participantId) => {
    if (!window.confirm("Remove this participant from the assessment?")) return;
    setActionLoadingId(participantId);
    try {
      await api.removeParticipant(assessmentId, participantId);
      notify("Participant removed", "success");
      fetchAssessmentData();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAddQuestion = async () => {
    if (!questionUrl.trim() || !assessmentId) return;
    setIsAddingQuestion(true);
    try {
      const res = await api.addQuestion(assessmentId, questionUrl);
      if (res.question) {
        setPreviewQuestion(res.question);
        setQuestionUrl("");
        await fetchAssessmentData();
        notify("Question added to workspace pool!", "success");
      }
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setIsAddingQuestion(false);
    }
  };

  // Add this handler inside AssessmentBuilder component
  const handleEndAssessment = async () => {
    if (!window.confirm("Are you sure you want to end this assessment? This will mark the assessment as completed for all participants.")) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/assessments/${assessmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update assessment status");

      notify("Assessment marked as Completed", "success");
      fetchAssessmentData();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col justify-center items-center text-slate-300">
        <Loader2 className="animate-spin text-indigo-500 mb-3" size={40} />
        <p className="text-sm font-medium tracking-wide text-slate-400">Loading Assessment Workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* TOP STATUS BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">Assessment Hub</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
              {isCreateMode ? "Create New Assessment" : assessment.name}
            </h1>
          </div>

          {!isCreateMode && roomId && (
            <button
              onClick={() => navigate(`/videocall/${assessmentId}/${roomId}`)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95"
            >
              <Video size={18} />
              Launch Live Interview
            </button>
          )}
        </div>

        {/* WORKSPACE MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: PARTICIPANTS DIRECTORY (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Interviewers Card */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-indigo-400" />
                  <h3 className="font-bold text-sm tracking-wide text-slate-200 uppercase">Interviewers Panel</h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                  {interviewers.length}
                </span>
              </div>

              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {interviewers.length > 0 ? (
                  interviewers.map((inv) => (
                    <div
                      key={inv.participantId || inv.userId}
                      className="group flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 transition-all"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-slate-100 truncate">{inv.name}</p>
                          {inv.presence === "In Call" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                              Live
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">{inv.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${inv.status === "Accepted"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            }`}
                        >
                          {inv.status}
                        </span>
                        {!isCreateMode && inv.status !== "Accepted" && (
                          <button
                            title="Resend Invitation"
                            disabled={actionLoadingId === inv.participantId}
                            onClick={() => handleResend(inv.participantId)}
                            className="p-1 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-700/50 transition"
                          >
                            <RotateCw size={14} className={actionLoadingId === inv.participantId ? "animate-spin" : ""} />
                          </button>
                        )}
                        {!isCreateMode && (
                          <button
                            title="Remove Interviewer"
                            onClick={() => handleRemove(inv.participantId)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-3 text-center italic">No co-interviewers added yet.</p>
                )}
              </div>
            </div>

            {/* Candidates Card */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UserPlus size={18} className="text-purple-400" />
                  <h3 className="font-bold text-sm tracking-wide text-slate-200 uppercase">Invited Candidates</h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                  {candidates.length}
                </span>
              </div>

              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {candidates.length > 0 ? (
                  candidates.map((cand) => (
                    <div
                      key={cand.participantId || cand.userId}
                      className="group flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 transition-all"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-slate-100 truncate">{cand.name}</p>
                          {cand.presence === "In Call" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                              Live
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">{cand.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${cand.status === "Accepted"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            }`}
                        >
                          {cand.status}
                        </span>
                        {!isCreateMode && (
                          <>
                            <button
                              title="Resend Invitation"
                              disabled={actionLoadingId === cand.participantId}
                              onClick={() => handleResend(cand.participantId)}
                              className="p-1 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-slate-700/50 transition"
                            >
                              <RotateCw size={14} className={actionLoadingId === cand.participantId ? "animate-spin" : ""} />
                            </button>
                            <button
                              title="Remove Candidate"
                              onClick={() => handleRemove(cand.participantId)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-3 text-center italic">No candidates enrolled yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: WORKSPACE CORE (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Assessment Details & Scheduling */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-6 shadow-xl space-y-5">
              <h2 className="text-base font-semibold text-slate-200 border-b border-slate-800 pb-3">
                Assessment Metadata & Parameters
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Assessment Title
                  </label>
                  <input
                    type="text"
                    value={assessment.name}
                    onChange={(e) => setAssessment({ ...assessment, name: e.target.value })}
                    disabled={!isCreateMode}
                    placeholder="e.g. Senior Frontend Architect Interview"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Description & Objectives
                  </label>
                  <textarea
                    rows={2}
                    value={assessment.description}
                    onChange={(e) => setAssessment({ ...assessment, description: e.target.value })}
                    disabled={!isCreateMode}
                    placeholder="Briefly state key topics, frameworks, and target evaluations..."
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Calendar size={13} className="text-indigo-400" /> Scheduled Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={assessment.scheduledAt}
                      onChange={(e) => setAssessment({ ...assessment, scheduledAt: e.target.value })}
                      disabled={!isCreateMode}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Clock size={13} className="text-purple-400" /> Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      min="15"
                      max="300"
                      value={assessment.duration}
                      onChange={(e) => setAssessment({ ...assessment, duration: Number(e.target.value) })}
                      disabled={!isCreateMode}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              {isCreateMode && (
                <button
                  onClick={handleCreateAssessment}
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Save & Unlock Hub Controls"}
                </button>
              )}
            </div>

            {/* INVITATION & QUESTION FORMS (Enabled after creation) */}
            <div className={`space-y-6 transition-opacity ${isCreateMode ? "opacity-35 pointer-events-none" : "opacity-100"}`}>
              {/* Participant Invitation Card */}
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-6 shadow-xl space-y-6">
                <h2 className="text-base font-semibold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" /> Invite Participants
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Invite Co-Interviewer */}
                  <div className="space-y-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                      Add Co-Interviewer
                    </span>

                    <input
                      type="email"
                      placeholder="interviewer@company.com"
                      value={inviteData.interviewerEmail}
                      onChange={(e) => {
                        const email = e.target.value;
                        setInviteData((prev) => ({
                          ...prev,
                          interviewerEmail: email,
                          interviewerName: prev.interviewerName || suggestName(email),
                        }));
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />

                    <input
                      type="text"
                      placeholder="Interviewer Name"
                      value={inviteData.interviewerName}
                      onChange={(e) => setInviteData({ ...inviteData, interviewerName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />

                    <button
                      onClick={() => handleInvite("interviewer")}
                      className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow"
                    >
                      <Send size={13} /> Send Interviewer Invite
                    </button>
                  </div>

                  {/* Invite Candidate */}
                  <div className="space-y-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                      Add Candidate
                    </span>

                    <input
                      type="email"
                      placeholder="candidate@gmail.com"
                      value={inviteData.candidateEmail}
                      onChange={(e) => {
                        const email = e.target.value;
                        setInviteData((prev) => ({
                          ...prev,
                          candidateEmail: email,
                          candidateName: prev.candidateName || suggestName(email),
                        }));
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />

                    <input
                      type="text"
                      placeholder="Candidate Full Name"
                      value={inviteData.candidateName}
                      onChange={(e) => setInviteData({ ...inviteData, candidateName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />

                    <button
                      onClick={() => handleInvite("candidate")}
                      className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition shadow"
                    >
                      <Send size={13} /> Send Candidate Invite
                    </button>
                  </div>
                </div>
              </div>

              {/* Questions Pool Card */}
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                    <FilePlus2 size={16} className="text-indigo-400" /> Assessment Questions
                  </h2>
                  <span className="text-xs text-slate-400">{questions.length} problems loaded</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={questionUrl}
                    onChange={(e) => setQuestionUrl(e.target.value)}
                    placeholder="Paste problem URL or identifier..."
                    className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleAddQuestion}
                    disabled={isAddingQuestion}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow disabled:opacity-50 transition"
                  >
                    {isAddingQuestion ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                    Append
                  </button>
                </div>

                {questions.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {questions.map((q) => (
                      <div
                        key={q._id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-sm font-semibold text-slate-200 truncate">{q.title}</p>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${q.difficulty === "Easy"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : q.difficulty === "Medium"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-rose-500/10 text-rose-400"
                              }`}
                          >
                            {q.difficulty || "Standard"}
                          </span>
                        </div>
                        <button
                          onClick={() => setPreviewQuestion(q)}
                          className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
                        >
                          <Eye size={12} /> Inspect
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {previewQuestion && (
        <QuestionPreviewPopup question={previewQuestion} onClose={() => setPreviewQuestion(null)} />
      )}
    </div>
  );
}