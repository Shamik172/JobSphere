import React, { useEffect, useMemo, useState } from "react";
import {
  UserCheck,
  Loader2,
  Send,
  Users,
  UserPlus,
  Mail,
  User,
  Plus,
  X,
  ChevronRight,
  Lock,
} from "lucide-react";
import ParticipantRow from "./ParticipantRow.jsx";
import ListModal from "./ListModal.jsx";

const PREVIEW_COUNT = 3;

/* "!" beats the 16px phone rule in theme.css, so text and placeholders stay compact on phones */
const inputBase =
  "glass-input h-10 w-full rounded-xl text-ellipsis font-semibold !text-[13px] placeholder:!text-[12px] placeholder:font-medium sm:h-11 sm:!text-sm sm:placeholder:!text-[13px]";

export default function ParticipantDirectoryPanel({
  roleTitle,
  roleKey, // "interviewer" | "candidate"
  inviteData,
  status, // "idle" | "checking" | "exists" | "not_found"
  handleEmailChange,
  handleCheckEmail,
  setInviteData,
  handleInvite,
  participants,
  actionLoadingId,
  handleResend,
  handleRemove,
  isCreateMode,
  isCompleted,
}) {
  const isInterviewer = roleKey === "interviewer";
  const emailVal = isInterviewer ? inviteData.interviewerEmail : inviteData.candidateEmail;
  const nameVal = isInterviewer ? inviteData.interviewerName : inviteData.candidateName;

  const [showForm, setShowForm] = useState(participants.length === 0 && !isCompleted);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");

  // keep the form open while a lookup runs or shows feedback
  useEffect(() => {
    if (status !== "idle" && !isCompleted) setShowForm(true);
  }, [status, isCompleted]);

  const preview = participants.slice(0, PREVIEW_COUNT);
  const hiddenCount = participants.length - preview.length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter((p) => {
      const n = (p.name || p.user?.name || "").toLowerCase();
      const e = (p.email || p.user?.email || "").toLowerCase();
      return n.includes(q) || e.includes(q);
    });
  }, [participants, query]);

  const nameClass =
    status === "checking" ? "is-checking animate-pulse" : status === "exists" ? "is-locked" : "";

  const rowProps = {
    isInterviewer,
    isCreateMode,
    isCompleted,
    actionLoadingId,
    handleResend,
    handleRemove,
  };

  return (
    <section className="lp-glass-card min-w-0 overflow-hidden rounded-3xl">
      {/* Header band */}
      <div className="lp-card-head !px-3 !py-2.5 sm:!px-4 sm:!py-3.5">
        <div className={`lp-icon-chip !h-8 !w-8 sm:!h-9 sm:!w-9 ${isInterviewer ? "is-info" : ""}`}>
          {isInterviewer ? (
            <Users size={16} strokeWidth={2.4} />
          ) : (
            <UserPlus size={16} strokeWidth={2.4} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-xs font-black text-[var(--lp-text-title)] sm:text-sm">{roleTitle}</h3>
          <p className="text-[11px] font-bold text-[var(--lp-text-muted)] sm:text-xs">{participants.length} enrolled</p>
        </div>

        {isCompleted ? (
          <span className="lp-badge is-warn shrink-0" title="This assessment has concluded">
            <Lock size={11} /> Locked
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            disabled={isCreateMode}
            aria-expanded={showForm}
            title={showForm ? "Close invite form" : "Invite participant"}
            className="lp-btn-ghost h-8 shrink-0 gap-1 px-2.5 text-xs sm:h-9 sm:px-3"
          >
            {showForm ? <X size={13} /> : <Plus size={13} />}
            <span>{showForm ? "Close" : "Invite"}</span>
          </button>
        )}
      </div>

      <div className="lp-card-body space-y-2.5 !p-3 sm:space-y-3 sm:!p-4">
        {/* Invite form (collapsible, never shown once concluded) */}
        {!isCompleted && showForm && (
          <div className="lp-surface space-y-2 rounded-2xl p-2.5 sm:space-y-2.5 sm:p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-[var(--lp-text-title)] sm:text-[13px]">
                Add {isInterviewer ? "co-interviewer" : "candidate"}
              </span>

              {status === "checking" && (
                <span className="lp-badge is-warn animate-pulse !px-1.5 !py-0.5 !text-[10px] sm:!text-[11px]">
                  <Loader2 size={10} className="animate-spin" /> Checking…
                </span>
              )}
              {status === "exists" && (
                <span className="lp-badge is-ok !px-1.5 !py-0.5 !text-[10px] sm:!text-[11px]">
                  <UserCheck size={10} /> Registered
                </span>
              )}
              {status === "not_found" && (
                <span className="lp-badge !px-1.5 !py-0.5 !text-[10px] sm:!text-[11px]">New user</span>
              )}
            </div>

            {/* Email */}
            <div className="relative">
              <Mail
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lp-link)]"
              />
              <input
                type="email"
                placeholder={isInterviewer ? "interviewer@company.com" : "candidate@gmail.com"}
                value={emailVal}
                onChange={(e) => handleEmailChange(roleKey, e.target.value)}
                onBlur={() => handleCheckEmail(roleKey)}
                className={`${inputBase} pl-9 pr-9`}
              />
              {status === "checking" && (
                <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-amber-500" />
              )}
              {status === "exists" && (
                <UserCheck size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--lp-ok-text)]" />
              )}
            </div>

            {/* Name */}
            <div className="relative">
              <User
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lp-text-muted)]"
              />
              <input
                type="text"
                placeholder={
                  status === "checking"
                    ? "Checking records..."
                    : isInterviewer
                    ? "Interviewer name"
                    : "Candidate full name"
                }
                disabled={status === "checking" || status === "exists"}
                value={nameVal}
                onChange={(e) =>
                  setInviteData((prev) => ({
                    ...prev,
                    [isInterviewer ? "interviewerName" : "candidateName"]: e.target.value,
                  }))
                }
                className={`${inputBase} pl-9 pr-3 ${nameClass}`}
              />
            </div>

            {status === "exists" && (
              <p className="text-[11px] font-bold text-[var(--lp-ok-text)] sm:text-xs">
                ✓ Filled from an existing JobSphere profile (read-only)
              </p>
            )}

            <button
              type="button"
              onClick={() => handleInvite(roleKey)}
              disabled={status === "checking" || !emailVal.trim()}
              className="js-btn-primary flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-white active:scale-[0.98] disabled:opacity-60 sm:h-11 sm:gap-2 sm:text-sm"
            >
              {status === "checking" ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Verifying email...
                </>
              ) : (
                <>
                  <Send size={13} /> Send {isInterviewer ? "interviewer" : "candidate"} invite
                </>
              )}
            </button>
          </div>
        )}

        {/* Preview */}
        <div className="space-y-1.5 sm:space-y-2">
          {preview.length > 0 ? (
            preview.map((p) => (
              <ParticipantRow key={p.participantId || p.userId || p._id} p={p} {...rowProps} />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--lp-surface-border)] px-3 py-5 text-center sm:px-4 sm:py-6">
              <p className="text-xs font-bold text-[var(--lp-text-muted)] sm:text-[13px]">
                No {isInterviewer ? "co-interviewers" : "candidates"} added yet.
              </p>
            </div>
          )}
        </div>

        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="lp-btn-ghost h-9 w-full justify-between px-3 text-xs sm:h-10 sm:px-4"
          >
            <span>
              View all {participants.length} {isInterviewer ? "interviewers" : "candidates"}
            </span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {modalOpen && (
        <ListModal
          title={roleTitle}
          subtitle={`${participants.length} enrolled`}
          icon={isInterviewer ? Users : UserPlus}
          onClose={() => {
            setModalOpen(false);
            setQuery("");
          }}
          search={query}
          onSearch={setQuery}
          searchPlaceholder="Search by name or email…"
          isEmpty={filtered.length === 0}
        >
          {filtered.map((p) => (
            <ParticipantRow key={p.participantId || p.userId || p._id} p={p} {...rowProps} />
          ))}
        </ListModal>
      )}
    </section>
  );
}