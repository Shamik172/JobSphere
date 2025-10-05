import React, { useState, useEffect } from "react";
import ProblemDescription from "./codingComponents/ProblemDescription";
import CodeEditor from "./codingComponents/CodeEditor";
import SubmissionControls from "./codingComponents/SubmissionControls";

const CodingPanel = () => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(`// Write your ${language} code here...`);

  useEffect(() => {
    if (language.toLowerCase() === "python") setCode(`# Write your ${language} code here...`);
    else setCode(`// Write your ${language} code here...`);
  }, [language]);

  const sampleProblem = {
    title: "Two Sum",
    description: `
Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
You may assume that each input would have exactly one solution, and you may not use the same element twice.
You can return the answer in any order.`,
    examples: [
      { input: "[2,7,11,15], target=9", output: "[0,1]" },
      { input: "[3,2,4], target=6", output: "[1,2]" },
    ],
  };

  const handleRun = () => console.log("Running code:", code, "Language:", language);
  const handleSubmit = () => console.log("Submitting code:", code, "Language:", language);

  return (
    <div className="flex flex-1 h-full overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
      
      {/* Left Panel - Problem Description */}
      <div className="w-1/3 p-6 bg-white/70 backdrop-blur-md border-r border-indigo-200 rounded-l-2xl overflow-auto">
        <ProblemDescription problem={sampleProblem} />
      </div>

      {/* Right Panel - Code Editor */}
      <div className="w-2/3 flex flex-col bg-white/70 backdrop-blur-md rounded-r-2xl">
        
        {/* Language Selector */}
        <div className="flex items-center justify-between p-4 border-b border-indigo-300 bg-white/60">
          <h2 className="text-sm font-semibold text-indigo-800">Code Editor</h2>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-indigo-700">Language:</label>
            <select
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/80 border border-indigo-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
            </select>
          </div>
        </div>

        {/* Code Editor Area */}
        <div className="flex-1 overflow-hidden border-b border-indigo-200">
          <CodeEditor code={code} setCode={setCode} language={language} />
        </div>

        {/* Run / Submit Buttons */}
        <div className="p-4 bg-white/60 flex justify-end rounded-br-2xl border-t border-indigo-300">
          <SubmissionControls onRun={handleRun} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default CodingPanel;
