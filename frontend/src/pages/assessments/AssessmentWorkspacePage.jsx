import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, UserPlus, Code2, Video, ArrowRight } from "lucide-react";
import PageShell from "../../components/common/PageShell.jsx";
import PageLoader from "../../components/common/PageLoader.jsx";
import AssessmentMetadataCard from "../../components/assessment/AssessmentMetadataCard.jsx";
import ParticipantDirectoryPanel from "../../components/assessment/ParticipantDirectoryPanel.jsx";
import QuestionPoolSection from "../../components/assessment/QuestionPoolSection.jsx";
import QuestionPreviewPopup from "../../components/assessment/QuestionPreviewPopup.jsx";
import { notify } from "../../notification/Notification.jsx";
import socket from "../../utils/socket.js";

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

function WorkspaceContent() {
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

  const isCompleted = assessment.status === "Completed";

  const [inviteData, setInviteData] = useState({
    interviewerName: "",
    interviewerEmail: "",
    candidateName: "",
    candidateEmail: "",
  });

  const [questionUrl, setQuestionUrl] = useState("");
  const [previewQuestion, setPreviewQuestion] = useState(null);

  const isCreateMode = !assessmentId;

  const [interviewerStatus, setInterviewerStatus] = useState("idle");
  const [candidateStatus, setCandidateStatus] = useState("idle");

  const lastCheckedInterviewerEmail = useRef("");
  const lastCheckedCandidateEmail = useRef("");

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email?.trim());

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

  const handleCheckEmail = async (role, emailToCheck) => {
    const isInterviewer = role === "interviewer";
    const email = (emailToCheck !== undefined
      ? emailToCheck
      : (isInterviewer ? inviteData.interviewerEmail : inviteData.candidateEmail))?.trim();

    if (!isValidEmail(email)) return;

    const lastChecked = isInterviewer ? lastCheckedInterviewerEmail : lastCheckedCandidateEmail;
    if (lastChecked.current === email) return;

    const setStatus = isInterviewer ? setInterviewerStatus : setCandidateStatus;
    setStatus("checking");

    try {
      const res = await fetch(`${API_BASE_URL}/users/lookup?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      lastChecked.current = email;

      if (data.exists && data.user) {
        setStatus("exists");
        if (isInterviewer) {
          setInviteData((prev) => ({ ...prev, interviewerName: data.user.name }));
        } else {
          setInviteData((prev) => ({ ...prev, candidateName: data.user.name }));
        }
      } else {
        setStatus("not_found");
      }
    } catch {
      setStatus("not_found");
    }
  };

  const handleEmailChange = (role, email) => {
    const isInterviewer = role === "interviewer";
    const setStatus = isInterviewer ? setInterviewerStatus : setCandidateStatus;
    const lastChecked = isInterviewer ? lastCheckedInterviewerEmail : lastCheckedCandidateEmail;

    if (isInterviewer) {
      setInviteData((prev) => ({
        ...prev,
        interviewerEmail: email,
        interviewerName: interviewerStatus === "exists" ? "" : (suggestName(email) || prev.interviewerName),
      }));
    } else {
      setInviteData((prev) => ({
        ...prev,
        candidateEmail: email,
        candidateName: candidateStatus === "exists" ? "" : (suggestName(email) || prev.candidateName),
      }));
    }

    if (lastChecked.current !== email.trim()) setStatus("idle");
    if (isValidEmail(email)) handleCheckEmail(role, email);
  };

  useEffect(() => {
    setAssessmentId(id || null);
  }, [id]);

  useEffect(() => {
    if (!roomId) return;
    if (!socket.connected) socket.connect();

    socket.emit("join-room", { roomId, userId: null });

    const handlePresenceChanged = ({ userId, presence }) => {
      setInterviewers((prev) =>
        prev.map((inv) => (inv.userId?.toString() === userId?.toString() ? { ...inv, presence } : inv))
      );
      setCandidates((prev) =>
        prev.map((cand) => (cand.userId?.toString() === userId?.toString() ? { ...cand, presence } : cand))
      );
    };

    socket.on("participant-presence-changed", handlePresenceChanged);
    return () => socket.off("participant-presence-changed", handlePresenceChanged);
  }, [roomId]);

  // 1. In fetchAssessmentData:
  const fetchAssessmentData = useCallback(async () => {
    if (!assessmentId) return;
    setIsLoading(true);
    try {
      const data = await api.getAssessmentDetails(assessmentId);
      setAssessment({
        name: data.name || "",
        description: data.description || "",
        scheduledAt: data.scheduledAt || "",
        duration: data.duration || 60,
        status: data.status || "Scheduled", // Read status directly from API
      });
      setInterviewers(data.interviewers || []);
      setCandidates(data.candidates || []);
      setQuestions(data.questions || []);
      setRoomId(data.roomId || null);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  // 2. In handleEndAssessment:
  const handleEndAssessment = async () => {
    if (assessment.status === "Completed") {
      notify("This assessment has already been concluded.", "info");
      return;
    }

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

      // Immediately force local state to Completed so UI locks right away
      setAssessment((prev) => ({ ...prev, status: "Completed" }));
      notify("Assessment marked as Completed", "success");
      fetchAssessmentData();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  useEffect(() => {
    if (assessmentId) fetchAssessmentData();
  }, [assessmentId, fetchAssessmentData]);

  useEffect(() => {
    if (assessmentId && !isCreateMode) {
      fetch(`${API_BASE_URL}/assessments/${assessmentId}/acknowledge`, {
        method: "PATCH",
        credentials: "include",
      }).catch((err) => console.debug("Acknowledge skipped or accepted:", err));
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
        setInterviewerStatus("idle");
        lastCheckedInterviewerEmail.current = "";
      } else {
        setInviteData((prev) => ({ ...prev, candidateEmail: "", candidateName: "" }));
        setCandidateStatus("idle");
        lastCheckedCandidateEmail.current = "";
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
    if (!window.confirm("Remove this participant from assessment?")) return;
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

  /* ---------------- UI ---------------- */
  if (isLoading) {
    return <PageLoader variant="workspace" label="Loading assessment workspace…" />;
  }

  const liveCount = [...candidates, ...interviewers].filter((p) => p.presence === "In Call").length;

  const stats = [
    { icon: UserPlus, label: "Candidates", value: candidates.length },
    { icon: Users, label: "Interviewers", value: interviewers.length, tone: "is-info" },
    { icon: Code2, label: "Problems", value: questions.length, tone: "is-warn" },
    { icon: Video, label: "In call now", value: liveCount },
  ];

  const metadataCard = (
    <AssessmentMetadataCard
      assessment={assessment}
      setAssessment={setAssessment}
      isCreateMode={isCreateMode}
      isSubmitting={isSubmitting}
      handleCreateAssessment={handleCreateAssessment}
      handleEndAssessment={handleEndAssessment}
      roomId={roomId}
      assessmentId={assessmentId}
      navigate={navigate}
      stats={isCreateMode ? [] : stats}
      status={assessment.status}
    />
  );

  /* Create mode: one focused form */
  if (isCreateMode) {
    return (
      <main className="lp-enter mx-auto w-full max-w-2xl space-y-3 px-4 pb-16 pt-4 sm:px-6 lg:pt-8">
        {metadataCard}
        <div className="lp-surface flex items-center gap-3 rounded-2xl p-3.5">
          <div className="flex shrink-0 items-center gap-1.5 text-[var(--lp-link)]">
            <UserPlus size={15} />
            <Code2 size={15} />
          </div>
          <p className="text-[13px] font-semibold text-[var(--lp-text-muted)]">
            <span className="font-black text-[var(--lp-text-title)]">Step 2</span> unlocks after you save: invite
            candidates and co-interviewers, then add problems.
          </p>
          <ArrowRight size={14} className="ml-auto hidden shrink-0 text-[var(--lp-text-muted)] sm:block" />
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="lp-enter mx-auto max-w-7xl space-y-4 px-4 pb-16 pt-4 sm:px-6 lg:px-8 lg:pt-8">
        {metadataCard}

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
          {/* People: stacked on phone and desktop, side by side on tablet */}
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            <ParticipantDirectoryPanel
              roleTitle="Invited Candidates"
              roleKey="candidate"
              inviteData={inviteData}
              status={candidateStatus}
              handleEmailChange={handleEmailChange}
              handleCheckEmail={handleCheckEmail}
              setInviteData={setInviteData}
              handleInvite={handleInvite}
              participants={candidates}
              actionLoadingId={actionLoadingId}
              handleResend={handleResend}
              handleRemove={handleRemove}
              isCreateMode={isCreateMode}
              isCompleted={isCompleted}
            />

            <ParticipantDirectoryPanel
              roleTitle="Interviewers Panel"
              roleKey="interviewer"
              inviteData={inviteData}
              status={interviewerStatus}
              handleEmailChange={handleEmailChange}
              handleCheckEmail={handleCheckEmail}
              setInviteData={setInviteData}
              handleInvite={handleInvite}
              participants={interviewers}
              actionLoadingId={actionLoadingId}
              handleResend={handleResend}
              handleRemove={handleRemove}
              isCreateMode={isCreateMode}
              isCompleted={isCompleted}
            />
          </div>

          {/* Problems (sticks while you scroll the people column on desktop) */}
          <div className="min-w-0 lg:sticky lg:top-24 lg:col-span-7">
            <QuestionPoolSection
              questions={questions}
              questionUrl={questionUrl}
              setQuestionUrl={setQuestionUrl}
              handleAddQuestion={handleAddQuestion}
              isAddingQuestion={isAddingQuestion}
              setPreviewQuestion={setPreviewQuestion}
              isCreateMode={isCreateMode}
              isCompleted={isCompleted}
            />
          </div>
        </div>
      </main>

      {previewQuestion && (
        <QuestionPreviewPopup question={previewQuestion} onClose={() => setPreviewQuestion(null)} />
      )}
    </>
  );
}

/* The key remounts the content when you move between /create_assessment and
   /assessments/:id, so "New Round" always starts with a clean form. */
export default function AssessmentWorkspacePage() {
  const { id } = useParams();
  return (
    <PageShell>
      <WorkspaceContent key={id || "new"} />
    </PageShell>
  );
}