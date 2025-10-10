import React from "react";

const ProblemDescription = ({ problem }) => {
  console.log(problem)
  return (
    <div className="space-y-5">
      {/* Title */}
      <h2 className="text-2xl font-bold text-indigo-800">
        {problem.title}
      </h2>

      {/* Difficulty */}
      {/* <div className="text-sm font-medium text-indigo-600">
        Difficulty: <span className="text-indigo-800">{problem.difficulty}</span>
      </div> */}

      {/* Description (HTML rendered safely) */}
      <div
        className="prose prose-indigo max-w-none text-gray-800"
        dangerouslySetInnerHTML={{ __html: problem.description }}
      />

      {/* Examples */}
      {problem.examples?.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-indigo-700">Examples:</h3>
          {problem.examples.map((ex, i) => (
            <div
              key={i}
              className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg"
            >
              <p>
                <strong>Input:</strong> {ex.input}
              </p>
              <p>
                <strong>Output:</strong> {ex.output}
              </p>
              {ex.explanation && (
                <p>
                  <strong>Explanation:</strong> {ex.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProblemDescription;
