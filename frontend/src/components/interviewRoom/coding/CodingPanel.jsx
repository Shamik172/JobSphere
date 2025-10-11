import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ProblemDescription from "./codingComponents/ProblemDescription";
import CodeEditor from "./codingComponents/CodeEditor";
import SubmissionControls from "./codingComponents/SubmissionControls";
import { useCollabSocket } from "../../../context/CollabSocketContext";

const CodingPanel = ({ questionId }) => {
  const [language, setLanguage] = useState("javascript");
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState("// Loading code...");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const socket = useCollabSocket();
  const lastSentCode = useRef(""); // prevent loops of re-emits
  const [attemptId, setAttemptId] = useState(null);

  // Fetch question and attempt state
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
  // useEffect(() => {
  //   const fetchQuestionAndAttempt = async () => {
  //     try {
  //       setLoading(true);
  //       const questionRes = await axios.get(
  //         `${import.meta.env.VITE_BACKEND_URL}/api/questions/${questionId}`,
  //         { withCredentials: true }
  //       );
  //       setQuestion(questionRes.data.question);

  //       // Fetch existing attempt (to restore code)
  //       const attemptRes = await axios.get(
  //         `${import.meta.env.VITE_BACKEND_URL}/api/attempts/${questionId}`,
  //         { withCredentials: true }
  //       );
  //       if (attemptRes.data?.attempt) {
  //         setAttemptId(attemptRes.data.attempt._id);
  //         setCode(attemptRes.data.attempt.final_code || "");
  //       } else {
  //         setCode("// Start coding...");
  //       }
  //     } catch (err) {
  //       console.error("Error loading question/attempt:", err);
  //       setError("Failed to load question. Please try again.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (questionId) fetchQuestionAndAttempt();
  // }, [questionId]);

  // 🧠 Listen for incoming code updates from socket
  useEffect(() => {
    if (!socket) return;

    const handleRemoteCodeUpdate = ({ newCode }) => {
      // Avoid feedback loop
      if (newCode !== lastSentCode.current) {
        setCode(newCode);
      }
    };

    socket.on("code-update", handleRemoteCodeUpdate);
    return () => socket.off("code-update", handleRemoteCodeUpdate);
  }, [socket]);

  // Handle local edits -> broadcast via socket
  const handleCodeChange = (value) => {
    setCode(value);
    if (!socket || !value) return;

    // prevent flooding (optional: debounce later)
    if (value !== lastSentCode.current) {
      lastSentCode.current = value;
      socket.emit("code-update", { newCode: value, questionId });
    }
  };

  // Auto-save attempt on interval (every 5s)
  useEffect(() => {
    if (!attemptId) return;
    const interval = setInterval(async () => {
      try {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/attempts/${attemptId}`,
          { final_code: code },
          { withCredentials: true }
        );
      } catch (err) {
        console.warn("Autosave failed:", err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [attemptId, code]);

  const handleRun = async () => {
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

  if (loading) return <div className="p-6 text-indigo-600">Loading question...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="flex flex-1 h-full overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
      <div className="w-1/3 p-6 bg-white/70 backdrop-blur-md border-r border-indigo-200 rounded-l-2xl overflow-auto">
        <ProblemDescription problem={question} />
      </div>

      <div className="w-2/3 flex flex-col bg-white/70 backdrop-blur-md rounded-r-2xl">
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

        <div className="flex-1 overflow-hidden border-b border-indigo-200">
          <CodeEditor code={code} setCode={handleCodeChange} language={language} />
        </div>

        <div className="p-4 bg-white/60 flex justify-end rounded-br-2xl border-t border-indigo-300">
          <SubmissionControls onRun={handleRun} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default CodingPanel;
