import React, { useState } from "react";

const SubmissionControls = ({
  onRun,
  onSubmit,
  runResult,
  runTestCases = [],
  hiddenResults = [],
  running = false,
  runningAction = "",
}) => {
  // 'section' state will control which is visible
  const [activeSection, setActiveSection] = useState("output"); // "output" | "sample" | "hidden"

  // === Render Output ===
  const renderOutput = () => {
    if (!runResult || runResult.flag === 0) return null;

    if (runResult.data?.error) {
      return (
        <div className="p-3 bg-black text-red-400 font-mono text-sm rounded-lg shadow-inner mb-3">
          <h3 className="text-yellow-400 font-semibold mb-1">❌ Error:</h3>
          <pre className="whitespace-pre-wrap break-words">{runResult.data.error}</pre>
        </div>
      );
    }

    if (runResult.data?.results) {
      const allPassed = runResult.data.results.every((r) => r.passed);

      if (!allPassed) {
        const firstFail = runResult.data.results.find((r) => !r.passed);
        return (
          <div className="p-3 bg-black text-red-400 font-mono text-sm rounded-lg shadow-inner mb-3">
            <h3 className="text-yellow-400 font-semibold mb-1">❌ Error in Test Case</h3>
            <p>
              <span className="text-yellow-300 font-semibold">Input:</span> {firstFail.input}
            </p>
            <p>
              <span className="text-blue-400">Expected:</span> {firstFail.expected}
            </p>
            <p>
              <span className="text-purple-400">Your Output:</span> {firstFail.output || "No output"}
            </p>
          </div>
        );
      }

      return (
        <div className="p-3 bg-black text-green-400 font-mono text-sm rounded-lg shadow-inner mb-3">
          <h3 className="text-yellow-400 font-semibold mb-3">✅ All Sample Test Cases Passed!</h3>
          <div className="flex flex-col gap-3">
            {runResult.data.results.map((r, idx) => (
              <div key={idx} className="border p-2 rounded-lg border-green-400">
                <p className="text-yellow-300 font-semibold">Test Case #{idx + 1} — ✅ Passed</p>
                <p>
                  <span className="text-green-400">Input:</span> {r.input}
                </p>
                <p>
                  <span className="text-blue-400">Expected:</span> {r.expected}
                </p>
                <p>
                  <span className="text-purple-400">Output:</span> {r.output}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const error = runResult.data?.stderr?.trim() || runResult.data?.error || "❌ Unknown error.";
    return (
      <div className="p-3 bg-black text-red-400 font-mono text-sm rounded-lg shadow-inner mb-3">
        <h3 className="text-yellow-400 font-semibold mb-1">Error:</h3>
        <pre className="whitespace-pre-wrap break-words">{error}</pre>
      </div>
    );
  };

  // === Sample Test Cases ===
  const renderVisibleTestCases = () => {
    if (!runTestCases.length) return null;
    return (
      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-lg p-3 overflow-auto max-h-80">
        <h3 className="text-lg font-semibold text-yellow-300 mb-2">🧪 Sample Test Cases</h3>
        <div className="flex flex-col gap-2">
          {runTestCases.map((t, idx) => (
            <div
              key={idx}
              className="bg-black text-gray-200 font-mono rounded-lg p-3 border border-gray-600"
            >
              <p className="text-yellow-400 font-semibold mb-1">Test Case #{idx + 1}</p>
              <p>
                <span className="text-green-400">Input:</span> {t.input}
              </p>
              <p>
                <span className="text-blue-400">Expected Output:</span> {t.expected_output}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // === Hidden Test Cases ===
  const renderHiddenTestCases = () => {
    if (!hiddenResults.length) return null;
    return (
      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-lg p-3 overflow-auto max-h-80">
        <h3 className="text-lg font-semibold text-yellow-300 mb-2">🔒 Hidden Test Cases</h3>
        <ul className="list-disc list-inside text-gray-800">
          {hiddenResults.map((r, idx) => (
            <li key={idx} className="flex justify-between items-center gap-2">
              <span>Hidden Test Case #{idx + 1}</span>
              {r.passed ? (
                <span className="text-green-400 font-bold">✅ Passed</span>
              ) : (
                <span className="text-red-400 font-bold">❌ Failed</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full gap-3 p-3 bg-white/10 backdrop-blur-md h-full">
      {/* Top Toggle Buttons */}
      <div className="flex justify-start items-center gap-2 mb-2">
        <button
          onClick={() => setActiveSection("output")}
          className={`px-4 py-1 rounded-lg font-semibold hover:opacity-90 ${
            activeSection === "output" ? "bg-green-500 text-white" : "bg-gray-400 text-black"
          }`}
        >
          Output
        </button>
        <button
          onClick={() => setActiveSection("sample")}
          className={`px-4 py-1 rounded-lg font-semibold hover:opacity-90 ${
            activeSection === "sample" ? "bg-blue-500 text-white" : "bg-gray-400 text-black"
          }`}
        >
          Sample Test Cases
        </button>
        <button
          onClick={() => setActiveSection("hidden")}
          className={`px-4 py-1 rounded-lg font-semibold hover:opacity-90 ${
            activeSection === "hidden" ? "bg-purple-500 text-white" : "bg-gray-400 text-black"
          }`}
        >
          Hidden Test Cases
        </button>
      </div>

      {/* Run/Submit Buttons */}
      <div className="flex gap-3 justify-end mb-2">
        <button
          onClick={onRun}
          disabled={running && runningAction === "run"}
          className={`px-5 py-2 rounded-lg font-semibold text-white shadow-md bg-gradient-to-r from-yellow-500 to-yellow-400 hover:opacity-90 active:scale-[0.98] transition-all ${
            running && runningAction === "run" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {running && runningAction === "run" ? "Running..." : "Run"}
        </button>

        <button
          onClick={onSubmit}
          disabled={running && runningAction === "submit"}
          className={`px-5 py-2 rounded-lg font-semibold text-white shadow-md bg-gradient-to-r from-green-500 to-green-400 hover:opacity-90 active:scale-[0.98] transition-all ${
            running && runningAction === "submit" ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {running && runningAction === "submit" ? "Submitting..." : "Submit"}
        </button>
      </div>

      {/* Sections */}
      <div className="overflow-auto max-h-[60vh]">
        {activeSection === "output" && renderOutput()}
        {activeSection === "sample" && renderVisibleTestCases()}
        {activeSection === "hidden" && renderHiddenTestCases()}
      </div>
    </div>
  );
};

export default SubmissionControls;
