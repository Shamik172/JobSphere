import React from "react";
import { RotateCw, Trash2 } from "lucide-react";

const statusTone = (s) =>
  s === "Accepted" || s === "Completed" ? "is-ok" : s === "Declined" || s === "Rejected" ? "is-danger" : "is-info";

export default function ParticipantRow({
  p,
  isInterviewer,
  isCreateMode,
  isCompleted,
  actionLoadingId,
  handleResend,
  handleRemove,
}) {
  const displayName = p.name || p.user?.name || (isInterviewer ? "Interviewer" : "Candidate");
  const displayEmail = p.email || p.user?.email || "";
  const pic = p.profilePic || p.user?.profilePic;
  const isLive = p.presence === "In Call" && !isCompleted;
  // same rules as the original builder: interviewers can be re-invited only until they accept
  const canResend = !isCompleted && (isInterviewer ? p.status !== "Accepted" : true);
  const busy = actionLoadingId === p.participantId;

  const showResend = !isCreateMode && !isCompleted && canResend;
  const showRemove = !isCreateMode && !isCompleted;

  return (
    <div className="lp-surface is-interactive flex min-h-[60px] items-center gap-2.5 rounded-2xl p-2.5 sm:min-h-[64px] sm:gap-3 sm:p-3">
      {/* Avatar (softly desaturated once the session has concluded) */}
      <div className={`relative shrink-0 ${isCompleted ? "opacity-75 grayscale" : ""}`}>
        {pic ? (
          <img
            src={pic}
            alt={displayName}
            className="h-9 w-9 rounded-full border border-[var(--lp-ok-border)] object-cover sm:h-10 sm:w-10"
          />
        ) : (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-black text-white shadow-sm sm:h-10 sm:w-10 sm:text-sm"
            style={{ background: "var(--accent-grad)" }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        {isLive && (
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--ring-gap)] bg-emerald-500" />
        )}
      </div>

      {/* Name + email: full width of the middle column, truncates cleanly */}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <p
            className="min-w-0 truncate text-[13px] font-black leading-tight text-[var(--lp-text-title)] sm:text-sm"
            title={displayName}
          >
            {displayName}
          </p>
          {isLive && (
            <span className="lp-badge is-ok hidden !px-1.5 !py-0 text-[10px] sm:inline-flex">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" /> Live
            </span>
          )}
        </div>
        <p
          className="mt-0.5 truncate text-[11px] font-medium leading-tight text-[var(--lp-text-muted)] sm:text-xs"
          title={displayEmail}
        >
          {displayEmail}
        </p>
      </div>

      {/* Right cluster:
          phones  -> status badge on top, action buttons underneath (aligned right)
          sm and up -> badge and buttons side by side */}
      <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-1.5">
        {/* Fixed minimum width on phones so "Invited" and "Completed" line up in every row */}
        <span
          className={`lp-badge ${statusTone(p.status)} min-w-[68px] shrink-0 justify-center !px-2 !py-[1px] !text-[10px] sm:min-w-0 sm:!px-2.5 sm:!py-0.5 sm:!text-[11px]`}
        >
          {p.status}
        </span>

        {(showResend || showRemove) && (
          <div className="flex items-center gap-1.5">
            {showResend && (
              <button
                type="button"
                title="Resend Invitation"
                disabled={busy}
                onClick={() => handleResend(p.participantId)}
                className="lp-icon-btn !h-7 !w-7 sm:!h-8 sm:!w-8"
              >
                <RotateCw size={12} className={busy ? "animate-spin" : ""} />
              </button>
            )}

            {showRemove && (
              <button
                type="button"
                title={isInterviewer ? "Remove Interviewer" : "Remove Candidate"}
                onClick={() => handleRemove(p.participantId)}
                className="lp-icon-btn is-danger !h-7 !w-7 sm:!h-8 sm:!w-8"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}