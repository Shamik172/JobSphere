import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ProblemDescription from "./codingComponents/ProblemDescription";
import CodeEditor from "./codingComponents/CodeEditor";
import SubmissionControls from "./codingComponents/SubmissionControls";
import { useCollabSocket } from "../../../context/CollabSocketContext";

const CodingPanel = ({ questionId }) => {
  const [language, setLanguage] = useState("javascript");
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [runResult, setRunResult] = useState({ flag: 0 });
  const [hiddenResults, setHiddenResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [runningAction, setRunningAction] = useState(""); // "run" or "submit"

  const [leftWidth, setLeftWidth] = useState(40); // % width
  const [editorHeight, setEditorHeight] = useState(400); // px

  const leftRef = useRef(null);
  const codeRef = useRef(null);

  const { sessionCode, updateCode } = useCollabSocket();

  // === Fetch Question ===
  useEffect(() => {
    if (!questionId) return;
    setLoading(true);
    const fetchQuestion = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/questions/${questionId}`,
          { withCredentials: true }
        );
        setQuestion(res.data.question);
      } catch (err) {
        console.error(err);
        setError("Failed to load the question.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [questionId]);

  // === Handle Run (Sample Test Cases) ===
  const handleRun = async () => {
    if (!question?.runTestCases?.length) {
      setRunResult({ data: { error: "No sample test cases." }, flag: 1 });
      return;
    }

    setRunning(true);
    setRunningAction("run");
    setRunResult({ flag: 0 });

    try {
      const results = [];
      for (const test of question.runTestCases) {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/code/run`,
          { code: sessionCode, language, input: test.input },
          { withCredentials: true }
        );


         if (!res.data.success) {
          setRunResult({
            data: {
              error:
                res.data.stderr?.trim() ||
                res.data.error ||
                "❌ Runtime/Compile Error",
            },
            flag: 1,
          });
          return;
        }


        const output = res.data.stdout?.trim() || "";
        const expected = test.expected_output?.trim() || "";
        const passed = output === expected && !res.data.stderr && !res.data.error;

        results.push({ input: test.input, expected, output, passed });
      }

      setRunResult({ data: { results }, flag: 1 });
    } catch (err) {
      console.error(err);
      setRunResult({
        data: { error: "Run failed. Please check your code or server." },
        flag: 1,
      });
    } finally {
      setRunning(false);
      setRunningAction("");
    }
  };

  // === Handle Submit (Hidden Test Cases) ===
  const handleSubmit = async () => {
    if (!question?.hiddenTestCases?.length) {
      alert("No hidden test cases.");
      return;
    }

    setRunning(true);
    setRunningAction("submit");
    setHiddenResults([]);

    try {
      const results = [];
      for (const test of question.hiddenTestCases) {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/code/run`,
          { code: sessionCode, language, input: test.input },
          { withCredentials: true }
        );

        if (!res.data.success) {
          setRunResult({
            data: {
              error:
                res.data.stderr?.trim() ||
                res.data.error ||
                "❌ Runtime/Compile Error",
            },
            flag: 1,
          });
          return;
        }

        const output = res.data.stdout?.trim() || "";
        const expected = test.expected_output?.trim() || "";
        const passed = output === expected && !res.data.stderr && !res.data.error;

        results.push({ input: test.input, expected, output, passed });
      }

      setHiddenResults(results);
      // alert("Submission complete!");
    } catch (err) {
      console.error(err);
      // alert("Submission failed.");
    } finally {
      setRunning(false);
      setRunningAction("");
    }
  };

  // === Horizontal resize ===
  const onMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth;
    const onMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.min(Math.max(startWidth + (deltaX / window.innerWidth) * 100, 20), 70);
      setLeftWidth(newWidth);
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // === Vertical resize ===
  const onMouseDownVert = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = editorHeight;
    const onMouseMove = (e) => {
      const deltaY = e.clientY - startY;
      const newHeight = Math.min(Math.max(startHeight + deltaY, 150), 800);
      setEditorHeight(newHeight);
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  if (loading) return <div className="p-6 text-center text-indigo-600 font-semibold">Loading Question...</div>;
  if (error) return <div className="p-6 text-center text-red-600 font-semibold">{error}</div>;

  return (
    <div className="flex flex-1 h-full overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
      {/* Left Panel */}
      <div
        ref={leftRef}
        style={{ width: `${leftWidth}%` }}
        className="p-6 bg-white/70 backdrop-blur-md border-r border-indigo-200 rounded-l-2xl overflow-auto"
      >
        {question ? <ProblemDescription problem={question} /> : <p>No problem description found.</p>}
      </div>

      {/* Horizontal Divider */}
      <div onMouseDown={onMouseDown} className="w-1 cursor-col-resize bg-indigo-300 hover:bg-indigo-500 transition"></div>

      {/* Right Panel */}
      <div style={{ width: `${100 - leftWidth}%` }} className="flex flex-col bg-white/70 backdrop-blur-md rounded-r-2xl">
        {/* Header */}
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

        {/* Editor + Output */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div ref={codeRef} style={{ height: `${editorHeight}px` }} className="overflow-hidden border-b border-indigo-200">
            <CodeEditor code={sessionCode} setCode={updateCode} language={language} />
          </div>

          <div onMouseDown={onMouseDownVert} className="h-1 cursor-row-resize bg-indigo-300 hover:bg-indigo-500 transition"></div>

          <div className="flex-1 overflow-y-auto">
            <SubmissionControls
              onRun={handleRun}
              onSubmit={handleSubmit}
              runResult={runResult}
              runTestCases={question.runTestCases}
              hiddenTestCases={question.hiddenTestCases}
              hiddenResults={hiddenResults}
              running={running}
              runningAction={runningAction}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingPanel;