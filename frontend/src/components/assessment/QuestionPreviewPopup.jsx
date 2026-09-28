import React from "react";
import { X, Code2, CheckCircle2 } from "lucide-react";

export default function QuestionPreviewPopup({ question, onClose }) {
  if (!question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Glass Modal */}
      <div
        className="relative bg-slate-900/90 border border-slate-800 backdrop-blur-2xl rounded-2xl shadow-2xl max-w-3xl w-full z-10 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <Code2 size={20} className="text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">{question.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-300 text-sm leading-relaxed">
          {/* Difficulty Badge */}
          {question.difficulty && (
            <div>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  question.difficulty === "Easy"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : question.difficulty === "Medium"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {question.difficulty}
              </span>
            </div>
          )}

          {/* Description */}
          <div
            className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: question.description }}
          />

          {/* Examples */}
          {question.examples && question.examples.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Examples</h3>
              <div className="space-y-2.5">
                {question.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono text-xs space-y-1.5"
                  >
                    <div>
                      <span className="text-indigo-400 font-semibold">Input: </span>
                      <span className="text-slate-200">{ex.input}</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 font-semibold">Output: </span>
                      <span className="text-slate-200">{ex.output}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Added By Footer */}
          {question.addedBy && (
            <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-indigo-400" />
              <span>Added by: <strong className="text-slate-300">{question.addedBy}</strong></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}