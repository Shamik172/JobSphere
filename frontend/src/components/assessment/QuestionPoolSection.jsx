import React, { useMemo, useState } from "react";
import { FilePlus2, Eye, Loader2, Sparkles, Link2, ChevronRight, Lock } from "lucide-react";
import ListModal from "./ListModal.jsx";

const PREVIEW_COUNT = 4;
const diffTone = (d) => (d === "Easy" ? "is-ok" : d === "Medium" ? "is-warn" : "is-danger");

/* "!" beats the 16px phone rule in theme.css, so text and placeholders stay compact on phones */
const inputBase =
  "glass-input h-10 w-full rounded-xl text-ellipsis font-semibold !text-[13px] placeholder:!text-[12px] placeholder:font-medium sm:h-11 sm:!text-sm sm:placeholder:!text-[13px]";

function QuestionRow({ q, onInspect }) {
  return (
    <div className="lp-surface is-interactive flex min-w-0 items-center justify-between gap-2.5 rounded-2xl p-2.5 sm:gap-3 sm:p-3">
      <div className="min-w-0">
        <p className="truncate text-xs font-black text-[var(--lp-text-title)] sm:text-sm">{q.title}</p>
        <span className={`lp-badge mt-1 !px-2 !py-0.5 !text-[10px] sm:mt-1.5 sm:!text-[11px] ${diffTone(q.difficulty)}`}>
          {q.difficulty || "Standard"}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onInspect(q)}
        className="lp-btn-ghost h-8 shrink-0 px-2.5 text-[11px] sm:h-9 sm:px-3 sm:text-xs"
      >
        <Eye size={13} />
        <span>Inspect</span>
      </button>
    </div>
  );
}

export default function QuestionPoolSection({
  questions,
  questionUrl,
  setQuestionUrl,
  handleAddQuestion,
  isAddingQuestion,
  setPreviewQuestion,
  isCreateMode,
  isCompleted,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");

  const preview = questions.slice(0, PREVIEW_COUNT);
  const hiddenCount = questions.length - preview.length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return questions;
    return questions.filter(
      (x) =>
        (x.title || "").toLowerCase().includes(q) || (x.difficulty || "").toLowerCase().includes(q)
    );
  }, [questions, query]);

  return (
    <section
      className={`lp-glass-card min-w-0 overflow-hidden rounded-3xl transition-opacity ${
        isCreateMode ? "pointer-events-none opacity-50" : "opacity-100"
      }`}
    >
      {/* Header band */}
      <div className="lp-card-head !px-3 !py-2.5 sm:!px-4 sm:!py-3.5">
        <div className="lp-icon-chip is-warn !h-8 !w-8 sm:!h-9 sm:!w-9">
          <FilePlus2 size={16} strokeWidth={2.4} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xs font-black text-[var(--lp-text-title)] sm:text-sm">Assessment questions</h2>
          <p className="text-[11px] font-bold text-[var(--lp-text-muted)] sm:text-xs">{questions.length} problems loaded</p>
        </div>
        {isCompleted && (
          <span className="lp-badge is-warn shrink-0" title="This assessment has concluded">
            <Lock size={11} /> Locked
          </span>
        )}
      </div>

      <div className="lp-card-body space-y-2.5 !p-3 sm:space-y-3 sm:!p-4">
        {/* Add problem, or a locked notice once concluded */}
        {isCompleted ? (
          <div className="lp-surface flex items-center gap-3 rounded-2xl p-3">
            <div className="lp-icon-chip is-warn !h-8 !w-8 sm:!h-9 sm:!w-9">
              <Lock size={15} strokeWidth={2.4} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-[var(--lp-text-title)] sm:text-[13px]">Problem pool locked</p>
              <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-[var(--lp-text-muted)] sm:text-xs">
                This assessment has concluded, so problems can no longer be added.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Link2
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lp-link)]"
              />
              <input
                type="text"
                value={questionUrl}
                onChange={(e) => setQuestionUrl(e.target.value)}
                placeholder="Paste AtCoder problem URL"
                className={`${inputBase} pl-9 pr-3`}
              />
            </div>
            <button
              type="button"
              onClick={handleAddQuestion}
              disabled={isAddingQuestion || !questionUrl.trim()}
              className="js-btn-primary flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-bold text-white active:scale-95 disabled:opacity-60 sm:h-11 sm:px-5 sm:text-sm"
            >
              {isAddingQuestion ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span>{isAddingQuestion ? "Appending..." : "Append"}</span>
            </button>
          </div>
        )}

        {/* Preview */}
        {questions.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
            {preview.map((q) => (
              <QuestionRow key={q._id} q={q} onInspect={setPreviewQuestion} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--lp-surface-border)] px-3 py-6 text-center sm:px-4 sm:py-9">
            <div className="lp-icon-chip is-warn mx-auto mb-2 !h-8 !w-8 sm:!h-9 sm:!w-9">
              <FilePlus2 size={15} />
            </div>
            <p className="text-xs font-black text-[var(--lp-text-title)] sm:text-sm">No problems added yet</p>
            <p className="mx-auto mt-1 max-w-xs text-[11px] font-medium text-[var(--lp-text-muted)] sm:text-[13px]">
              {isCompleted
                ? "No problems were added before this round concluded."
                : "Paste a problem link above to load it into the workspace pool."}
            </p>
          </div>
        )}

        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="lp-btn-ghost h-9 w-full justify-between px-3 text-xs sm:h-10 sm:px-4"
          >
            <span>View all {questions.length} problems</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {modalOpen && (
        <ListModal
          title="Assessment questions"
          subtitle={`${questions.length} problems loaded`}
          icon={FilePlus2}
          onClose={() => {
            setModalOpen(false);
            setQuery("");
          }}
          search={query}
          onSearch={setQuery}
          searchPlaceholder="Search by title or difficulty…"
          isEmpty={filtered.length === 0}
        >
          {filtered.map((q) => (
            <QuestionRow
              key={q._id}
              q={q}
              onInspect={(x) => {
                setModalOpen(false);
                setQuery("");
                setPreviewQuestion(x);
              }}
            />
          ))}
        </ListModal>
      )}
    </section>
  );
}