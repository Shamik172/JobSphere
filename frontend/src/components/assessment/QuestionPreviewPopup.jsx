import React from "react";

export default function QuestionPreviewPopup({ question, onClose }) {
  if (!question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurry background overlay */}
      <div
        className="absolute inset-0 backdrop-blur-sm bg-black/30"
        onClick={onClose} // close modal when clicked outside
      ></div>

      {/* Glass-like modal */}
      <div
        className="relative bg-white bg-opacity-70 backdrop-blur-md p-6 rounded-2xl shadow-2xl max-w-3xl w-full z-10 border border-white border-opacity-30 overflow-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-indigo-800">{question.title}</h2>
          <button
            className="text-gray-600 hover:text-red-500"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Tags / Difficulty */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* {question.tags?.map((tag, idx) => (
            <span
              key={idx}
              className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-semibold"
            >
              {tag}
            </span>
          ))} */}
          {question.difficulty && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${question.difficulty === "Easy"
                  ? "bg-emerald-100 text-emerald-700"
                  : question.difficulty === "Medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
            >
              {question.difficulty}
            </span>
          )}
        </div>

        {/* Description */}

        <div
          className="text-gray-700 mb-4 whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: question.description }}
        />
        {/* Examples */}
        {question.examples?.length > 0 && (
          <div className="mb-4">
            <h3 className="text-indigo-700 font-semibold mb-2">Examples:</h3>
            <div className="space-y-2">
              {question.examples.map((ex, idx) => (
                <div key={idx} className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                  <p className="text-sm">
                    <span className="font-semibold">Input:</span> {ex.input}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Output:</span> {ex.output}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Added By */}
        {question.addedBy && (
          <div className="mt-4 border-t border-indigo-100 pt-2 text-sm text-gray-500">
            Added by: <span className="font-medium">{question.addedBy}</span>
          </div>
        )}
      </div>
    </div>
  );
}