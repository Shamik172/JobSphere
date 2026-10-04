import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Search,
  Users,
  ArrowRight,
  Sparkles,
  Video,
  Clock,
  Plus,
  X,
  Code2,
  UserCheck,
  LayoutGrid,
  Radio,
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/common/PageShell.jsx";
import PageLoader from "../../components/common/PageLoader.jsx";

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const handleResponse = async (res) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch assessments");
  }
  return res.json();
};

const statusOf = (a) => {
  if (a.status === "Completed") return "completed";
  if (a.status === "In Call" || a.status === "Active") return "live";
  return "upcoming";
};

const countOf = (a, arrKey, countKey) =>
  Array.isArray(a[arrKey]) ? a[arrKey].length : typeof a[countKey] === "number" ? a[countKey] : 0;

const relLabel = (iso, duration = 60, status) => {
  // If explicitly completed, do not calculate time window
  if (status === "Completed") return null;

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
  if (now < end) return "In progress";
  return `Ended ${fmt(now - end)} ago`;
};

const formatCardDate = (iso) => {
  if (!iso) return "Open schedule";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Open schedule";
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const STATE_RANK = { live: 0, upcoming: 1, completed: 2 };
const timeOf = (a) => new Date(a.scheduledAt || a.createdAt || 0).getTime();

/* ---------- Ultra-Polished Compact Assessment Card ---------- */
function AssessmentCard({ a, onOpen, onEnter }) {
  const state = statusOf(a);
  const isHost = a.__role === "host";
  const candidates = Array.isArray(a.candidates) ? a.candidates : [];
  const first = candidates[0];
  const rel = relLabel(a.scheduledAt, a.duration, a.status);

  const totalCandidates = a.totalCandidates ?? countOf(a, "candidates", "candidateCount");
  const stats = [
    { icon: UserCheck, label: "Candidates", value: totalCandidates },
    { icon: Users, label: "Panelists", value: countOf(a, "interviewers", "interviewerCount") },
    { icon: Code2, label: "Problems", value: countOf(a, "questions", "questionCount") },
  ];

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className={`lp-glass-card lp-card-bar is-${state} group relative flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--lp-surface-border)]/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--lp-link)]/40 hover:shadow-lg`}
    >
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* Top Meta Line: Badges + Responsive Countdown */}
        <div className="flex items-center justify-between gap-1.5 pb-2.5 border-b border-[var(--lp-surface-border)]/50">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`lp-badge ${state === "live" ? "is-ok" : state === "completed" ? "is-warn" : "is-info"
                } !text-[10px] !py-0.5 !px-2 !font-bold`}
            >
              {state === "live" && <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400 mr-1" />}
              {a.status || "Scheduled"}
            </span>
            <span
              className={`lp-badge ${isHost ? "is-ok" : "is-info"
                } !text-[10px] !py-0.5 !px-2 !font-semibold`}
            >
              {isHost ? "Host" : "Panelist"}
            </span>
          </div>

          {/* Time Remaining Pill — Visible on ALL screen sizes */}
          {rel ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--lp-link)]/10 px-2 py-0.5 text-[10px] font-extrabold text-[var(--lp-link)] border border-[var(--lp-link)]/20 shrink-0">
              <Clock size={10} className="shrink-0" />
              <span>{rel}</span>
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-[var(--lp-text-muted)] shrink-0">
              Open Schedule
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div className="mt-2.5 min-w-0">
          <h3 className="truncate text-sm sm:text-base font-extrabold text-[var(--lp-text-title)] tracking-tight transition group-hover:text-[var(--lp-link)]">
            {a.name}
          </h3>
          <p className="mt-0.5 truncate text-[11px] font-medium text-[var(--lp-text-muted)]">
            {a.description?.trim() || "No objectives recorded for this round."}
          </p>
        </div>

        {/* Schedule Sub-Bar */}
        <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-[var(--lp-text-muted)]">
          <div className="flex items-center gap-1 truncate">
            <Calendar size={12} className="text-[var(--lp-link)] shrink-0" />
            <span className="truncate">{formatCardDate(a.scheduledAt)}</span>
          </div>
          <span className="text-[var(--lp-surface-border)] shrink-0">•</span>
          <span className="shrink-0">{a.duration || 60}m</span>
        </div>

        {/* 3-Metrics Grid */}
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="lp-surface flex flex-col items-center justify-center rounded-xl py-1.5 px-1 text-center border border-[var(--lp-surface-border)]/40"
              title={label}
            >
              <div className="flex items-center gap-1">
                <Icon size={11} className="text-[var(--lp-link)] shrink-0" />
                <span className="text-xs font-black text-[var(--lp-text-title)]">{value}</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--lp-text-muted)]">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Footer: Candidate Avatars & Enter Call CTA */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--lp-surface-border)]/50 pt-2.5">
          <div className="flex min-w-0 items-center">
            {candidates.length > 0 ? (
              <>
                <div className="flex shrink-0 -space-x-1.5">
                  {candidates.slice(0, 3).map((c, i) => (
                    <div
                      key={i}
                      title={c.name || c.email}
                      className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-[var(--ring-gap)] text-[9px] font-black text-white"
                      style={{ background: "var(--accent-grad)" }}
                    >
                      {c.profilePic ? (
                        <img src={c.profilePic} alt={c.name} className="h-full w-full object-cover" />
                      ) : (
                        (c.name || c.email || "C").charAt(0).toUpperCase()
                      )}
                    </div>
                  ))}
                </div>
                <span className="ml-2 max-w-[110px] truncate text-[11px] font-bold text-[var(--lp-text-title)]">
                  {first?.name || first?.email}
                  {totalCandidates > 1 ? ` +${totalCandidates - 1}` : ""}
                </span>
              </>
            ) : (
              <span className="truncate text-[10px] font-medium italic text-[var(--lp-text-muted)]">
                No candidates yet
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {a.roomId && state !== "completed" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEnter();
                }}
                className="js-btn-primary flex h-7 sm:h-8 items-center gap-1 rounded-xl px-2.5 text-xs font-bold text-white transition active:scale-95 shadow-md shadow-purple-500/10"
              >
                <Video size={12} />
                <span>Enter</span>
              </button>
            )}
            <span className="lp-icon-btn is-plain !h-7 !w-7 transition group-hover:translate-x-0.5">
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------- Ultra-Compact Summary Tile ---------- */
function SummaryTile({ icon: Icon, label, value, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`lp-emerald-tile flex min-w-0 items-center gap-2 rounded-xl p-2 sm:p-2.5 transition-all ${active ? "is-active ring-1 ring-[var(--lp-link)]" : ""
        }`}
    >
      <div className="lp-icon-chip !h-7 !w-7 sm:!h-8 sm:!w-8 shrink-0">
        <Icon size={14} strokeWidth={2.4} className="sm:h-4 sm:w-4" />
      </div>
      <div className="min-w-0 text-left">
        <p className="text-sm sm:text-base font-black leading-none text-[var(--lp-text-title)]">{value}</p>
        <p className="mt-0.5 truncate text-[10px] sm:text-[11px] font-bold text-[var(--lp-text-muted)]">{label}</p>
      </div>
    </button>
  );
}

/* ---------- Page ---------- */
function DirectoryContent() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessments, setAssessments] = useState({ hosted: [], collaborator: [] });
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [showDates, setShowDates] = useState(false);
  const [tab, setTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchAssessments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/assessments/my-assessments`, {
        method: "GET",
        credentials: "include",
      });
      const data = await handleResponse(res);
      setAssessments({
        hosted: data.hosted || [],
        collaborator: data.collaborator || [],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const tagged = useMemo(
    () => [
      ...assessments.hosted.map((a) => ({ ...a, __role: "host" })),
      ...assessments.collaborator.map((a) => ({ ...a, __role: "collab" })),
    ],
    [assessments]
  );

  const totals = useMemo(() => {
    const t = { all: tagged.length, live: 0, upcoming: 0, completed: 0 };
    tagged.forEach((a) => (t[statusOf(a)] += 1));
    return t;
  }, [tagged]);

  const visible = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const from = dateRange.from ? new Date(`${dateRange.from}T00:00:00`) : null;
    const to = dateRange.to ? new Date(`${dateRange.to}T23:59:59`) : null;

    return tagged
      .filter((a) => {
        if (tab === "host" && a.__role !== "host") return false;
        if (tab === "collab" && a.__role !== "collab") return false;
        if (statusFilter !== "all" && statusOf(a) !== statusFilter) return false;
        if (q && !`${a.name || ""} ${a.description || ""}`.toLowerCase().includes(q)) return false;
        const d = new Date(a.scheduledAt || a.createdAt);
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      })
      .sort((a, b) => {
        const ra = STATE_RANK[statusOf(a)];
        const rb = STATE_RANK[statusOf(b)];
        if (ra !== rb) return ra - rb;
        return statusOf(a) === "completed" ? timeOf(b) - timeOf(a) : timeOf(a) - timeOf(b);
      });
  }, [tagged, tab, statusFilter, searchQuery, dateRange]);

  const hostedCount = assessments.hosted.length;
  const collabCount = assessments.collaborator.length;
  const hasFilters =
    searchQuery || dateRange.from || dateRange.to || statusFilter !== "all" || tab !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setDateRange({ from: "", to: "" });
    setStatusFilter("all");
    setTab("all");
  };

  if (isLoading) {
    return <PageLoader variant="directory" label="Loading assessment directory…" />;
  }

  const toggleStatus = (key) => setStatusFilter((cur) => (cur === key ? "all" : key));

  return (
    <main className="lp-enter mx-auto max-w-7xl space-y-3.5 px-3 pb-16 pt-3 sm:space-y-4 sm:px-6 sm:pt-4 lg:px-8 lg:pt-8">
      {/* Hero */}
      <section className="lp-hero rounded-3xl p-4 sm:p-6">
        <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <span className="lp-badge is-ok">
              <Sparkles size={12} /> Interviewer command hub
            </span>
            <h1 className="mt-2.5 text-xl font-black tracking-tight text-[var(--lp-text-title)] sm:mt-3 sm:text-2xl lg:text-3xl">
              Assessment Directory
            </h1>
            <p className="mt-1 text-xs font-medium text-[var(--lp-text-muted)] sm:text-sm">
              Conduct, monitor, and configure every live and scheduled round.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/create_assessment")}
            className="lp-btn-light flex h-10 w-full shrink-0 items-center justify-center gap-2 px-4 text-xs font-black sm:h-11 sm:w-auto sm:px-5 sm:text-sm"
          >
            <Plus size={16} />
            <span>New assessment</span>
          </button>
        </div>
      </section>

      {/* Filter Tiles: Single row on md+, clean 2x2 on small mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <SummaryTile icon={LayoutGrid} label="Total rounds" value={totals.all} active={statusFilter === "all"} onClick={() => toggleStatus("all")} />
        <SummaryTile icon={Radio} label="Live now" value={totals.live} active={statusFilter === "live"} onClick={() => toggleStatus("live")} />
        <SummaryTile icon={CalendarClock} label="Upcoming" value={totals.upcoming} active={statusFilter === "upcoming"} onClick={() => toggleStatus("upcoming")} />
        <SummaryTile icon={CheckCircle2} label="Completed" value={totals.completed} active={statusFilter === "completed"} onClick={() => toggleStatus("completed")} />
      </div>

      {/* Toolbar: Responsive search text and compact controls */}
      <section className="lp-glass-card space-y-2.5 rounded-2xl p-2.5 sm:p-3.5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          {/* Responsive Search Input */}
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lp-text-muted)]"
              size={14}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or objective..."
              className="glass-input h-9 sm:h-10 w-full rounded-xl pl-8.5 pr-3 text-xs sm:text-sm font-semibold placeholder:text-xs placeholder:text-[var(--lp-text-muted)]"
            />
          </div>

          {/* Segmented Tabs & Date Picker */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="lp-tabs flex min-w-0 flex-1 items-center justify-between [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-none">
              {[
                { key: "all", label: "All", n: tagged.length },
                { key: "host", label: "Hosted", n: hostedCount },
                { key: "collab", label: "Collab", n: collabCount },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`lp-tab flex-1 justify-center px-2 py-1 text-center text-xs sm:flex-none sm:px-2.5 ${tab === t.key ? "is-active" : ""
                    }`}
                >
                  <span className="truncate">{t.label}</span>
                  <span className="lp-tab-count ml-1 shrink-0 text-[10px]">{t.n}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowDates((v) => !v)}
              aria-expanded={showDates}
              title="Filter by date"
              className={`lp-icon-btn !h-9 !w-9 relative shrink-0 ${showDates ? "!border-[var(--lp-accent)] !text-[var(--lp-link)]" : ""}`}
            >
              <Calendar size={14} />
              {(dateRange.from || dateRange.to) && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-[var(--ring-gap)]" />
              )}
            </button>
          </div>
        </div>

        {/* Date Filter Panel */}
        {showDates && (
          <div className="flex flex-col gap-2 border-t border-[var(--lp-surface-border)] pt-2.5 sm:flex-row sm:items-center">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex sm:items-center">
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="glass-input h-8 sm:h-9 w-full min-w-0 rounded-lg px-2 text-xs font-semibold sm:w-auto"
              />
              <span className="text-center text-[11px] font-bold text-[var(--lp-text-muted)]">to</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="glass-input h-8 sm:h-9 w-full min-w-0 rounded-lg px-2 text-xs font-semibold sm:w-auto"
              />
            </div>
            {(dateRange.from || dateRange.to) && (
              <button
                type="button"
                onClick={() => setDateRange({ from: "", to: "" })}
                className="lp-btn-ghost h-8 w-full gap-1 px-2.5 text-xs sm:w-auto"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        )}
      </section>

      {/* Error State */}
      {error && (
        <div className="lp-glass-card flex flex-col items-start gap-3 rounded-3xl p-4 sm:flex-row sm:items-center">
          <div className="lp-icon-chip is-warn">
            <AlertTriangle size={17} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-[var(--lp-text-title)]">Could not load assessments</p>
            <p className="text-xs font-medium text-[var(--lp-text-muted)]">{error}</p>
          </div>
          <button type="button" onClick={fetchAssessments} className="lp-btn-ghost h-10 w-full gap-1.5 px-4 text-xs sm:w-auto">
            <RotateCw size={13} /> Try again
          </button>Filter Tiles
        </div>
      )}

      {/* Grid Results */}
      {!error && (
        <>
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold text-[var(--lp-text-muted)]">
              Showing <span className="font-black text-[var(--lp-text-title)]">{visible.length}</span> of {tagged.length}
            </p>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="text-xs font-black text-[var(--lp-link)] hover:underline">
                Clear filters
              </button>
            )}
          </div>

          {visible.length > 0 ? (
            <div className="grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((a) => (
                <AssessmentCard
                  key={a._id}
                  a={a}
                  onOpen={() => navigate(`/assessments/${a._id}`)}
                  onEnter={() => navigate(`/videocall/${a._id}/${a.roomId}`)}
                />
              ))}
            </div>
          ) : (
            <div className="lp-glass-card rounded-3xl px-4 py-12 text-center sm:px-6 sm:py-14">
              <div className="lp-icon-chip mx-auto !h-12 !w-12">
                <Search size={20} />
              </div>
              <p className="mt-3 text-base font-black text-[var(--lp-text-title)]">
                {tagged.length === 0 ? "No assessments yet" : "Nothing matches these filters"}
              </p>
              <p className="mx-auto mt-1 max-w-sm text-[13px] font-medium text-[var(--lp-text-muted)]">
                {tagged.length === 0
                  ? "Create your first assessment to invite candidates and add problems."
                  : "Try a different search, status or date range."}
              </p>
              <button
                type="button"
                onClick={() => (tagged.length === 0 ? navigate("/create_assessment") : clearFilters())}
                className="js-btn-primary mx-auto mt-4 flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white"
              >
                {tagged.length === 0 ? (
                  <>
                    <Plus size={15} /> New assessment
                  </>
                ) : (
                  "Clear filters"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default function AssessmentsDirectoryPage() {
  return (
    <PageShell>
      <DirectoryContent />
    </PageShell>
  );
}