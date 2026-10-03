import React, { useState } from "react";
import { Calendar, Clock, Video, Power, Edit3, ArrowRight, ChevronDown } from "lucide-react";

/* "Starts in 3h" / "Ended 1d ago" */
const relLabel = (iso, duration = 60) => {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const MIN = 60000;
  const HOUR = 3600000;
  const DAY = 86400000;
  const fmt = (ms) => {
    const abs = Math.abs(ms);
    if (abs < HOUR) return `${Math.max(1, Math.round(abs / MIN))}m`;
    if (abs < DAY) return `${Math.round(abs / HOUR)}h`;
    return `${Math.round(abs / DAY)}d`;
  };
  const now = Date.now();
  if (t > now) return `Starts in ${fmt(t - now)}`;
  const end = t + (Number(duration) || 60) * MIN;
  if (now < end) return "In progress window";
  return `Ended ${fmt(now - end)} ago`;
};

const shortDate = (iso) =>
  new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const longDate = (iso) => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

export default function AssessmentMetadataCard({
  assessment,
  setAssessment,
  isCreateMode,
  isSubmitting,
  handleCreateAssessment,
  handleEndAssessment,
  roomId,
  assessmentId,
  navigate,
  stats = [],
}) {
  const [expanded, setExpanded] = useState(false);

  /* ---------------- Active workspace hero ---------------- */
  if (!isCreateMode) {
    const desc = assessment.description?.trim() || "";
    const canExpand = desc.length > 110 || (assessment.name || "").length > 34;
    const rel = relLabel(assessment.scheduledAt, assessment.duration);
    const chip = "!gap-1 !px-2 !py-0.5 !text-[11px] sm:!gap-1.5 sm:!px-2.5 sm:!py-1 sm:!text-xs";

    return (
      <section className="lp-hero min-w-0 rounded-3xl p-4 sm:p-6">
        {/* Row 1: Title (Top Left) & Join / End Actions (Top Right) */}
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <h1
              className={`text-xl font-black leading-tight tracking-tight text-[var(--lp-text-title)] sm:text-2xl lg:text-3xl ${
                expanded ? "break-words" : "truncate"
              }`}
            >
              {assessment.name}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:self-start">
            {roomId && (
              <button
                type="button"
                onClick={() => navigate(`/videocall/${assessmentId}/${roomId}`)}
                className="lp-btn-light flex h-10 flex-1 items-center justify-center gap-2 px-4 text-xs font-black sm:h-10 sm:flex-none sm:px-5 sm:text-sm"
              >
                <Video size={15} />
                <span>Join room</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleEndAssessment}
              title="Conclude assessment"
              aria-label="Conclude assessment"
              className="lp-btn-danger h-10 w-10 shrink-0"
            >
              <Power size={16} />
            </button>
          </div>
        </div>

        {/* Row 2: Collapsible Description Section */}
        <div className="mt-2.5 sm:mt-3">
          <p
            className={`max-w-4xl text-[13px] font-medium leading-relaxed text-[var(--lp-text-muted)] sm:text-sm ${
              expanded ? "whitespace-pre-wrap break-words" : "line-clamp-2"
            }`}
          >
            {desc || "No objectives recorded for this round."}
          </p>

          {canExpand && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="mt-1.5 inline-flex items-center gap-1 text-xs font-black text-[var(--lp-link)] hover:underline"
            >
              {expanded ? "Show less" : "Show more"}
              <ChevronDown size={14} className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>

        {/* Row 3: Metadata Badges (Active Status, Date, Duration, Countdown) */}
        <div className="lp-noscrollbar -mx-1 mt-4 flex min-w-0 flex-nowrap items-center gap-1.5 overflow-x-auto px-1 sm:mx-0 sm:mt-5 sm:flex-wrap sm:gap-2 sm:overflow-visible sm:px-0">
          <span className={`lp-badge is-ok shrink-0 ${chip}`}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
            </span>
            <span className="sm:hidden">Active</span>
            <span className="hidden sm:inline">Active workspace</span>
          </span>

          <span className={`lp-chip shrink-0 ${chip}`}>
            <Calendar size={12} />
            {assessment.scheduledAt ? (
              <>
                <span className="sm:hidden">{shortDate(assessment.scheduledAt)}</span>
                <span className="hidden sm:inline">{longDate(assessment.scheduledAt)}</span>
              </>
            ) : (
              "Open schedule"
            )}
          </span>

          <span className={`lp-chip shrink-0 ${chip}`}>
            <Clock size={12} />
            {assessment.duration || 60}
            <span className="sm:hidden">m</span>
            <span className="hidden sm:inline"> min</span>
          </span>

          {rel && <span className={`lp-chip shrink-0 ${chip}`}>{rel}</span>}
        </div>

        {/* Row 4: Stats Grid */}
        {stats.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-4 sm:gap-3">
            {stats.map(({ icon: Icon, label, value, tone }) => (
              <div key={label} className="lp-surface flex min-w-0 items-center gap-2.5 rounded-2xl p-2.5 sm:p-3">
                <div className={`lp-icon-chip !h-8 !w-8 sm:!h-9 sm:!w-9 ${tone || ""}`}>
                  <Icon size={15} strokeWidth={2.4} />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-black leading-none text-[var(--lp-text-title)] sm:text-lg">{value}</p>
                  <p className="mt-1 truncate text-[11px] font-bold text-[var(--lp-text-muted)] sm:text-xs">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  /* ---------------- Create form ---------------- */
  return (
    <section className="lp-glass-card min-w-0 overflow-hidden rounded-3xl">
      <div className="lp-card-head is-split">
        <div className="flex min-w-0 items-center gap-3">
          <div className="lp-icon-chip">
            <Edit3 size={17} strokeWidth={2.4} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-black leading-tight text-[var(--lp-text-title)] sm:text-lg">
              Create new assessment
            </h1>
            <p className="hidden text-xs font-semibold text-[var(--lp-text-muted)] sm:block">
              Name the round, describe what you will evaluate, and pick a time.
            </p>
          </div>
        </div>
        <span className="lp-badge is-ok shrink-0">Step 1 of 2</span>
      </div>

      <div className="lp-card-body space-y-3.5">
        <div>
          <label className="lp-label">Assessment title</label>
          <input
            type="text"
            value={assessment.name}
            onChange={(e) => setAssessment((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Senior Frontend Architect Interview"
            className="glass-input h-11 w-full rounded-xl px-3.5 text-sm font-semibold"
          />
        </div>

        <div>
          <label className="lp-label">Description and objectives</label>
          <textarea
            rows={3}
            value={assessment.description}
            onChange={(e) => setAssessment((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Key topics, frameworks, and what you want to evaluate..."
            className="glass-input w-full resize-none rounded-xl px-3.5 py-2.5 text-sm font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-[1fr_10rem]">
          <div className="min-w-0">
            <label className="lp-label">
              <Calendar size={13} className="text-[var(--lp-link)]" /> Date and time
            </label>
            <input
              type="datetime-local"
              value={assessment.scheduledAt}
              onChange={(e) => setAssessment((prev) => ({ ...prev, scheduledAt: e.target.value }))}
              className="glass-input h-11 w-full min-w-0 rounded-xl px-3 text-sm font-semibold"
            />
          </div>

          <div className="min-w-0">
            <label className="lp-label">
              <Clock size={13} className="text-[var(--lp-link)]" /> Duration (min)
            </label>
            <input
              type="number"
              min="15"
              max="300"
              value={assessment.duration}
              onChange={(e) => setAssessment((prev) => ({ ...prev, duration: Number(e.target.value) }))}
              className="glass-input h-11 w-full min-w-0 rounded-xl px-3 text-sm font-semibold"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreateAssessment}
          disabled={isSubmitting}
          className="js-btn-primary flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white active:scale-[0.99]"
        >
          <span>{isSubmitting ? "Saving..." : "Save and unlock invites"}</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </section>
  );
}