import React from "react";

const ProblemDescription = ({ problem }) => {
  return (
    <div className="h-full p-4 overflow-auto bg-white/30 backdrop-blur-md border border-white/30 rounded-l-2xl text-gray-900">
      {/* Problem Title */}
      <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
        {problem.title}
      </h2>

      {/* Problem Description */}
      <p className="mb-5 whitespace-pre-line text-gray-800">
        {problem.description}
      </p>

      {/* Examples */}
      <h3 className="font-semibold text-gray-900 mb-2">Examples:</h3>
      {problem.examples.map((ex, i) => (
        <div
          key={i}
          className="mb-3 p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 shadow-inner"
        >
          <div className="mb-1">
            <span className="font-medium text-indigo-700">Input:</span> {ex.input}
          </div>
          <div>
            <span className="font-medium text-blue-700">Output:</span> {ex.output}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProblemDescription;
