import React, { useState, useEffect } from "react";
import axios from "axios";
import ProblemDescription from "./codingComponents/ProblemDescription";
import CodeEditor from "./codingComponents/CodeEditor";
import SubmissionControls from "./codingComponents/SubmissionControls";

const CodingPanel = ({ questionId }) => {
  console.log("CodingPanel received questionId:", questionId);

  const [language, setLanguage] = useState("javascript");
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState(`// Write your ${language} code here...`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [call, setCall] = useState(false);
  if(!call && questionId){
       const fetchQuestion = async () => {
      console.log("question fetch", questionId)
      try {
        setLoading(true);
        setError(null);setCall(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/questions/${questionId}`,
          { withCredentials: true }
        );
        setQuestion(res.data.question);
        setCall(true);
        console.log("Fetched question:", res.data.question);
      } catch (err) {
        console.error("Failed to fetch question:", err);
        setError("Failed to load question. Please try again.");
      } finally {
        setCall(true);
        setLoading(false);
      }
    };
    console.log("me call karu")
    fetchQuestion();
  }


  //   console.log("mera chal")
  // })
  // 🔹 Fetch question details by ID
  // useEffect(() => {
  //   const fetchQuestion = async () => {
  //     console.log("question fetch", questionId)
  //     try {
  //       setLoading(true);
  //       setError(null);
  //       const res = await axios.get(
  //         `${import.meta.env.VITE_BACKEND_URL}/api/questions/${questionId}`,
  //         { withCredentials: true }
  //       );
  //       setQuestion(res.data.question);
  //       console.log("Fetched question:", res.data.question);
  //     } catch (err) {
  //       console.error("Failed to fetch question:", err);
  //       setError("Failed to load question. Please try again.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   console.log("me call karu")
  //   fetchQuestion();
  // }, [questionId]);

  // 🔹 Update code placeholder based on language
  useEffect(() => {
    const commentSyntax = language.toLowerCase() === "python" ? "#" : "//";
    setCode(`${commentSyntax} Write your ${language} code here...`);
  }, [language]);

  // 🔹 Handle code execution and submission (mock for now)
  const handleRun = async () => {
    console.log("Running code:", code, "Language:", language);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/questions/run`,
        { code, language, questionId },
        { withCredentials: true }
      );
      alert(res.data.result || "Code executed!");
    } catch (err) {
      console.error("Run error:", err);
      alert("Error executing code.");
    }
  };

  const handleSubmit = async () => {
    console.log("Submitting code:", code, "Language:", language);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/questions/submit`,
        { code, language, questionId },
        { withCredentials: true }
      );
      alert(res.data.message || "Code submitted successfully!");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Error submitting code.");
    }
  };

  // 🔹 Loading / Error States
  if (loading) return <div className="p-6 text-indigo-600">Loading question...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="flex flex-1 h-full overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
      
      {/* Left Panel - Problem Description */}
      <div className="w-1/3 p-6 bg-white/70 backdrop-blur-md border-r border-indigo-200 rounded-l-2xl overflow-auto">
        <ProblemDescription problem={question} />
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
