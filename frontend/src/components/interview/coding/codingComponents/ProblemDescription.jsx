import React from "react";

const ProblemDescription = ({ problem }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{problem.title}</h2>
      <p className="mb-4 whitespace-pre-line">{problem.description}</p>

      <h3 className="font-semibold">Examples:</h3>
      {problem.examples.map((ex, i) => (
        <div key={i} className="mb-2 p-2 bg-white rounded shadow-sm">
          <div><strong>Input:</strong> {ex.input}</div>
          <div><strong>Output:</strong> {ex.output}</div>
        </div>
      ))}
    </div>
  );
};

export default ProblemDescription;
