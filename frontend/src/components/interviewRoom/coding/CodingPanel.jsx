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
  const [runResult, setRunResult] = useState(null);

  // Resizing state
  const [leftWidth, setLeftWidth] = useState(35); // in %
  const [editorHeight, setEditorHeight] = useState(400); // in px

  // Refs for resizing logic
  const leftRef = useRef(null);
  const codeRef = useRef(null);

  // Collaborative socket context
  const { sessionCode, updateCode } = useCollabSocket();

  // === FETCH QUESTION ===
  useEffect(() => {
    if (!questionId) return;
    const fetchQuestion = async () => {
      setLoading(true);
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

  // === HANDLERS ===
  const handleRun = async () => {
    alert("Run logic not implemented.");
  };

  const handleSubmit = async () => {
    alert("Submit logic not implemented.");
  };

  // === Horizontal resize (Question/Editor panels) ===
  const onMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth;

    const onMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.min(Math.max(startWidth + deltaX / window.innerWidth * 100, 20), 70);
      setLeftWidth(newWidth);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // === Vertical resize (Editor height) ===
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

  if (loading)
    return (
      <div className="p-6 text-center text-indigo-600 font-semibold">
        Loading Question...
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-center text-red-600 font-semibold">{error}</div>
    );

  // === UI ===
  return (
    <div className="flex flex-1 h-full overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
      {/* === Question Panel === */}
      <div
        ref={leftRef}
        style={{ width: `${leftWidth}%` }}
        className="p-6 bg-white/70 backdrop-blur-md border-r border-indigo-200 rounded-l-2xl overflow-auto"
      >
        {question ? (
          <ProblemDescription problem={question} />
        ) : (
          <p>No problem description found.</p>
        )}
      </div>

      {/* === Horizontal Resizer === */}
      <div
        onMouseDown={onMouseDown}
        className="w-1 cursor-col-resize bg-indigo-300 hover:bg-indigo-500 transition"
      ></div>

      {/* === Code Editor Panel === */}
      <div
        style={{ width: `${100 - leftWidth}%` }}
        className="flex flex-col bg-white/70 backdrop-blur-md rounded-r-2xl"
      >
        {/* === Editor Header === */}
        <div className="flex items-center justify-between p-4 border-b border-indigo-300 bg-white/60">
          <h2 className="text-sm font-semibold text-indigo-800">Code Editor</h2>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-indigo-700">
              Language:
            </label>
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

        {/* === Code Editor === */}
        <div
          ref={codeRef}
          style={{ height: `${editorHeight}px` }}
          className="overflow-hidden border-b border-indigo-200"
        >
          <CodeEditor code={sessionCode} setCode={updateCode} language={language} />
        </div>

        {/* === Vertical Resizer === */}
        <div
          onMouseDown={onMouseDownVert}
          className="h-1 cursor-row-resize bg-indigo-300 hover:bg-indigo-500 transition"
        ></div>

        {/* === Submission Controls === */}
        <div className="p-4 bg-white/60 flex justify-end rounded-br-2xl border-t border-indigo-300">
          <SubmissionControls
            onRun={handleRun}
            onSubmit={handleSubmit}
            runResult={runResult}
          />
        </div>
      </div>
    </div>
  );
};

export default CodingPanel;
