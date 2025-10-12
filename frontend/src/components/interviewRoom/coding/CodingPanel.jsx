import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ProblemDescription from "./codingComponents/ProblemDescription";
import CodeEditor from "./codingComponents/CodeEditor";
import SubmissionControls from "./codingComponents/SubmissionControls";
import { useCollabSocket } from "../../../context/CollabSocketContext";

const CodingPanel = ({ questionId, initialCode }) => {
  const [language, setLanguage] = useState("javascript");
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState(initialCode || `// Write your ${language} code here...`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [runResult, setrunResult] = useState(null); //manunaly created

  const debounceTimeout = useRef(null);
  const socket = useCollabSocket();
  const lastSentCode = useRef("");

  // --- Horizontally Resizable Panels ---
  const leftRef = useRef(null);
  const [leftWidth, setLeftWidth] = useState(35); // initial % for question panel
  const isDragging = useRef(false);

  const onMouseDown = () => { isDragging.current = true; };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    const containerWidth = leftRef.current.parentElement.offsetWidth;
    let newLeftWidth = (e.clientX / containerWidth) * 100;
    if (newLeftWidth < 20) newLeftWidth = 20;
    if (newLeftWidth > 80) newLeftWidth = 80;
    setLeftWidth(newLeftWidth);
  };
  const onMouseUp = () => { isDragging.current = false; };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // --- Vertically Resizable Code Editor ---
  const codeRef = useRef(null);
  const [editorHeight, setEditorHeight] = useState(400);
  const isDraggingVert = useRef(false);

  const onMouseDownVert = () => { isDraggingVert.current = true; };
  const onMouseMoveVert = (e) => {
    if (!isDraggingVert.current) return;
    const containerTop = codeRef.current.getBoundingClientRect().top;
    let newHeight = e.clientY - containerTop;
    if (newHeight < 200) newHeight = 200;
    if (newHeight > window.innerHeight - 200) newHeight = window.innerHeight - 200;
    setEditorHeight(newHeight);
  };
  const onMouseUpVert = () => { isDraggingVert.current = false; };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMoveVert);
    window.addEventListener("mouseup", onMouseUpVert);
    return () => {
      window.removeEventListener("mousemove", onMouseMoveVert);
      window.removeEventListener("mouseup", onMouseUpVert);
    };
  }, []);

  // --- Set initial code ---
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      lastSentCode.current = initialCode;
    }
  }, [initialCode]);

  // --- Fetch question ---
  const [call, setCall] = useState(false);
  if (!call && questionId) {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        setError(null);
        setCall(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/questions/${questionId}`,
          { withCredentials: true }
        );
        setQuestion(res.data.question);
      } catch (err) {
        console.error(err);
        setError("Failed to load question. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }

  // --- Reset code when language changes ---
  useEffect(() => {
    if (!code || code.startsWith("// Write") || code.startsWith("# Write")) {
      const commentSyntax = language.toLowerCase() === "python" ? "#" : "//";
      setCode(`${commentSyntax} Write your ${language} code here...`);
    }
  }, [language]);

  // --- Socket: receive code updates ---
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

  // --- Local code changes ---
  const handleCodeChange = (value) => {
    setCode(value);
    if (!socket) return;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      if (value !== lastSentCode.current) {
        lastSentCode.current = value;
        socket.emit("code-change", { code: value, questionId });
      }
    }, 300);
  };

  // --- Run code ---
  const handleRun = async () => {
    try {
      const testCases = question.runTestCases;
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

          return { index: idx + 1, input: tc.input, expected_output, computed_output, passed: errorMsg ? false : passed, error: errorMsg };
        })
      );

      console.table(
        results.map(r => ({ TestCase: r.index, Passed: r.passed, "Expected Output": r.expected_output, "Computed Output": r.computed_output, Error: r.error }))
      );

      setrunResult({results, flag: 0}); //manualy created

      const passedCount = results.filter(r => r.passed).length;
      alert(`${passedCount} / ${results.length} test cases passed!`);

      const failedCases = results.filter(r => r.error);
      if (failedCases.length > 0) {
        let errMsg = "Errors in following test cases:\n";
        failedCases.forEach(r => { errMsg += `Test ${r.index}: ${r.error}\n`; });
        alert(errMsg);
      }

    } catch (err) {
      console.error("Run error:", err);
      setrunResult({err, flag: 1});//manualy set
      alert("Error executing one or more test cases.");
    }
  };

  // --- Submit code ---
  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/questions/submit`,
        { code, language, questionId },
        { withCredentials: true }
      );
      alert(res.data.message || "Code submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Error submitting code.");
    }
  };

  if (loading) return <div className="p-6 text-indigo-600">Loading question...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="flex flex-1 h-full overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
      {/* Question Panel */}
      <div
        ref={leftRef}
        style={{ width: `${leftWidth}%` }}
        className="p-6 bg-white/70 backdrop-blur-md border-r border-indigo-200 rounded-l-2xl overflow-auto"
      >
        <ProblemDescription problem={question} />
      </div>

      {/* Horizontal Resizer */}
      <div
        onMouseDown={onMouseDown}
        className="w-1 cursor-col-resize bg-indigo-300 hover:bg-indigo-500 transition"
      ></div>

      {/* Code Editor Panel */}
      <div style={{ width: `${100 - leftWidth}%` }} className="flex flex-col bg-white/70 backdrop-blur-md rounded-r-2xl">
        {/* Editor Header */}
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

        {/* Resizable Code Editor */}
        <div
          ref={codeRef}
          style={{ height: `${editorHeight}px` }}
          className="overflow-hidden border-b border-indigo-200"
        >
          <CodeEditor code={code} setCode={handleCodeChange} language={language} />
        </div>

        {/* Vertical Resizer */}
        <div
          onMouseDown={onMouseDownVert}
          className="h-1 cursor-row-resize bg-indigo-300 hover:bg-indigo-500 transition"
        ></div>

        {/* Submission Controls */}
        <div className="p-4 bg-white/60 flex justify-end rounded-br-2xl border-t border-indigo-300">
          <SubmissionControls onRun={handleRun} onSubmit={handleSubmit} runResult={runResult} />
        </div>
      </div>
    </div>
  );
};

export default CodingPanel;
