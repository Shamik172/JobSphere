import React, { useState, useEffect } from "react";
import ProblemDescription from "./codingComponents/ProblemDescription";
import CodeEditor from "./codingComponents/CodeEditor";
import SubmissionControls from "./codingComponents/SubmissionControls";

const CodingPanel = () => {
    const [language, setLanguage] = useState("javascript"); // default language
    const [code, setCode] = useState(`// Write your ${language} code here...`);

    // Update the comment whenever language changes
    useEffect(() => {
        if(language == 'Python')
        setCode(`# Write your ${language} code here...`);

        else
        setCode(`// Write your ${language} code here...`);
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
    <div className="flex flex-1 overflow-hidden border rounded shadow-md">
      {/* Left Panel: Problem Description */}
      <div className="w-1/3 bg-white p-4 overflow-auto border-r rounded-l">
        <ProblemDescription problem={sampleProblem} />
      </div>

      {/* Right Panel: Code Editor + Language + Submission */}
      <div className="w-2/3 flex flex-col">
        {/* Language Selector */}
        <div className="p-2 border-b bg-gray-100 flex items-center justify-end gap-2">
          <label className="text-sm font-medium text-gray-700">Language:</label>
          <select
            className="border rounded px-2 py-1 text-sm"
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

        {/* Editor takes all remaining space */}
        <div className="flex-1 overflow-auto">
          <CodeEditor code={code} setCode={setCode} language={language} />
        </div>

        {/* Submission buttons always visible */}
        <div className="p-2 border-t bg-gray-100">
          <SubmissionControls onRun={handleRun} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default CodingPanel;
