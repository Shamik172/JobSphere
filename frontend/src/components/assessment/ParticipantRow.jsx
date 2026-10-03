import React from "react";
import { RotateCw, Trash2 } from "lucide-react";

const statusTone = (s) =>
  s === "Accepted" || s === "Completed" ? "is-ok" : s === "Declined" || s === "Rejected" ? "is-danger" : "is-info";

export default function ParticipantRow({
  p,
  isInterviewer,
  isCreateMode,
  actionLoadingId,
  handleResend,
  handleRemove,
}) {
  const displayName = p.name || p.user?.name || (isInterviewer ? "Interviewer" : "Candidate");
  const displayEmail = p.email || p.user?.email || "";
  const pic = p.profilePic || p.user?.profilePic;
  const isLive = p.presence === "In Call";
  // same rules as the original builder: interviewers can be re-invited only until they accept
  const canResend = isInterviewer ? p.status !== "Accepted" : true;
  const busy = actionLoadingId === p.participantId;

  const badge = (extra = "") => (
    <span
      className={`lp-badge ${statusTone(p.status)} shrink-0 !px-2 !py-[1px] !text-[10px] sm:!px-2.5 sm:!py-0.5 sm:!text-[11px] ${extra}`}
    >
      {p.status}
    </span>
  );

  return (
    <div className="lp-surface is-interactive flex min-h-[58px] items-center gap-2.5 rounded-2xl p-2.5 sm:min-h-[64px] sm:gap-3 sm:p-3">
      {/* Avatar */}
      <div className="relative shrink-0">
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

      {/* Name + status (phones) / email */}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="min-w-0 truncate text-[13px] font-black leading-tight text-[var(--lp-text-title)] sm:text-sm">
            {displayName}
          </p>
          {isLive && (
            <span className="lp-badge is-ok hidden !px-1.5 !py-0 text-[10px] sm:inline-flex">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" /> Live
            </span>
          )}
          {/* On phones the status lives on the name line so every row has the same height */}
          <span className="sm:hidden">{badge()}</span>
        </div>
        <p className="mt-0.5 truncate text-[11px] font-medium leading-tight text-[var(--lp-text-muted)] sm:text-xs">
          {displayEmail}
        </p>
      </div>

      {/* Controls */}
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="hidden sm:inline-flex">{badge()}</span>

        {!isCreateMode && canResend && (
          <button
            type="button"
            title="Resend Invitation"
            disabled={busy}
            onClick={() => handleResend(p.participantId)}
            className="lp-icon-btn !h-8 !w-8"
          >
            <RotateCw size={13} className={busy ? "animate-spin" : ""} />
          </button>
        )}

        {!isCreateMode && (
          <button
            type="button"
            title={isInterviewer ? "Remove Interviewer" : "Remove Candidate"}
            onClick={() => handleRemove(p.participantId)}
            className="lp-icon-btn is-danger !h-8 !w-8"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}