import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ProblemDescription from "./codingComponents/ProblemDescription";
import CodeEditor from "./codingComponents/CodeEditor";
import SubmissionControls from "./codingComponents/SubmissionControls";
import { useCollabSocket } from "../../../context/CollabSocketContext";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const CodingPanel = ({ questionId, initialCode }) => {
  const [language, setLanguage] = useState("javascript");
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState(initialCode || `// Write your ${language} code here...`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceTimeout = useRef(null);
  const socket = useCollabSocket();
  const lastSentCode = useRef(initialCode || ""); // prevent loops

  const { assessmentId } = useParams();
  const { user } = useAuth?.() || {};
  const candidateId = user?._id || "68dbad15fb53a87ba397bcca";

  // Fetch question from backend
  // useEffect(() => {
  //   if (!questionId) return;

  //   const fetchQuestion = async () => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const res = await axios.get(
  //         `${import.meta.env.VITE_BACKEND_URL}/api/questions/${questionId}`,
  //         { withCredentials: true }
  //       );
  //       setQuestion(res.data.question);
  //     } catch (err) {
  //       console.error("Failed to fetch question:", err);
  //       setError("Failed to load question. Please try again.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchQuestion();
  // }, [questionId]);

  // Fetch question and attempt state
  const [call, setCall] = useState(false);
  if(!call && questionId){
      const fetchQuestion = async () => {
      console.log("question fetch", questionId)
      try {
        setLoading(true);
        setError(null); setCall(true);
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

  // Ensure placeholder code matches language
  useEffect(() => {
    if (!code || code.startsWith("// Write") || code.startsWith("# Write")) {
      const commentSyntax = language.toLowerCase() === "python" ? "#" : "//";
      setCode(`${commentSyntax} Write your ${language} code here...`);
    }
  }, [language]);

  // --- NEW: Subscribe to join-room initial state ---
  useEffect(() => {
    if (!socket) return;
    socket.emit("join-room", { assessmentId, candidateId, questionId });
  }, [socket, assessmentId, candidateId, questionId]);

  // --- Listen for load-initial-state from server ---
  useEffect(() => {
    if (!socket) return;

    const handleInitialState = (data) => {
      const newCode = data?.code ?? "";
      if (newCode && newCode !== code) {
        setCode(newCode);
        lastSentCode.current = newCode;
      }
    };

    socket.on("load-initial-state", handleInitialState);
    return () => socket.off("load-initial-state", handleInitialState);
  }, [socket, code]);

  // Listen for remote code updates
  useEffect(() => {
    if (!socket) return;

    const handleRemoteCodeUpdate = ({ code: newCode }) => {
      if (newCode !== lastSentCode.current) {
        setCode(newCode);
      }
    };

    socket.on("code-update", handleRemoteCodeUpdate);
    return () => socket.off("code-update", handleRemoteCodeUpdate);
  }, [socket]);

  // Handle local code changes -> emit via socket (debounced)
  const handleCodeChange = (value) => {
    setCode(value);
    if (!socket) return;

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      if (value !== lastSentCode.current) {
        lastSentCode.current = value;
        socket.emit("code-change", { code: value, questionId, assessment: assessmentId, candidate: candidateId });
      }
    }, 300);
  };

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, []);

  // Run & Submit handlers (unchanged)
  const handleRun = async () => {
    if (!question) return alert("Question not loaded");

    try {
      const testCases = question.runTestCases || [];

      const results = await Promise.all(
        testCases.map(async (tc, idx) => {
          const res = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/code/run`,
            { code, language, input: tc.input, expected_output: tc.output },
            { withCredentials: true }
          );

          const computed_output = (res.data.stdout || "").trim();
          const expected_output = (tc.expected_output || "").trim();
          const passed = computed_output === expected_output;
          const errorMsg = res.data.error || res.data.stderr || null;

          return {
            index: idx + 1,
            input: tc.input,
            expected_output,
            computed_output,
            passed: errorMsg ? false : passed,
            error: errorMsg,
          };
        })
      );

      const passedCount = results.filter((r) => r.passed).length;
      alert(`${passedCount} / ${results.length} test cases passed!`);

      const failedCases = results.filter((r) => r.error);
      if (failedCases.length > 0) {
        let errMsg = "Errors in following test cases:\n";
        failedCases.forEach((r) => {
          errMsg += `Test ${r.index}: ${r.error}\n`;
        });
        alert(errMsg);
      }
    } catch (err) {
      console.error("Run error:", err);
      alert("Error executing one or more test cases.");
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
