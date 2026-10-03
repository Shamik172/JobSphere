import React from "react";
import { X, Code2, CheckCircle2 } from "lucide-react";

export default function QuestionPreviewPopup({ question, onClose }) {
  if (!question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Glass Modal Window */}
      <div
        className="relative lp-glass-card rounded-2xl shadow-2xl max-w-3xl w-full z-10 overflow-hidden max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--lp-pill-border)]">
          <div className="flex items-center gap-3">
            <Code2 size={20} className="text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base sm:text-lg font-black text-[var(--lp-text-title)] tracking-tight">
              {question.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm leading-relaxed text-[var(--lp-text-body)]">
          {question.difficulty && (
            <div>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  question.difficulty === "Easy"
                    ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                    : question.difficulty === "Medium"
                    ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30"
                    : "bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30"
                }`}
              >
                {question.difficulty}
              </span>
            </div>
          )}

          {/* Description */}
          <div
            className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: question.description }}
          />

          {/* Examples */}
          {question.examples && question.examples.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--lp-text-title)]">Test Cases & Examples</h3>
              <div className="space-y-2">
                {question.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs space-y-1 text-slate-100"
                  >
                    <div>
                      <span className="text-emerald-400 font-bold">Input: </span>
                      <span>{ex.input}</span>
                    </div>
                    <div>
                      <span className="text-teal-400 font-bold">Output: </span>
                      <span>{ex.output}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Metadata */}
          {question.addedBy && (
            <div className="pt-3 border-t border-[var(--lp-pill-border)] text-xs text-[var(--lp-text-muted)] flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Added by: <strong className="text-[var(--lp-text-title)]">{question.addedBy}</strong></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}