import React, { useState, useEffect } from "react";
import axios from "axios";
import ProblemDescription from "./codingComponents/ProblemDescription";
import CodeEditor from "./codingComponents/CodeEditor";
import SubmissionControls from "./codingComponents/SubmissionControls";
import { useCollabSocket } from "../../../context/CollabSocketContext"; // Ensure path is correct

const CodingPanel = ({ questionId }) => {
  const [language, setLanguage] = useState("javascript");
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Read the CURRENT session state and updater function from the context
  const { sessionCode, updateCode } = useCollabSocket();

  // Data fetching for the problem description
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
        setError("Failed to load the question.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [questionId]);

  // Handlers for running/submitting code (add your logic here)
  const handleRun = async () => { alert("Run logic not implemented."); };
  const handleSubmit = async () => { alert("Submit logic not implemented."); };
  
  if (loading) return <div className="p-6 text-center text-indigo-600 font-semibold">Loading Question...</div>;
  if (error) return <div className="p-6 text-center text-red-600 font-semibold">{error}</div>;

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="w-1/3 p-6 bg-white/70 backdrop-blur-md border-r border-indigo-200 overflow-auto">
        {question ? <ProblemDescription problem={question} /> : <p>No problem description found.</p>}
      </div>

      <div className="w-2/3 flex flex-col bg-gray-800">
        <div className="flex items-center justify-end p-2 bg-gray-700 border-b border-gray-600">
          <label className="text-sm font-medium text-gray-300 mr-2">Language:</label>
          <select
            className="px-3 py-1 rounded-md text-sm font-medium bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
        </div>

        <div className="flex-1 overflow-hidden">
          <CodeEditor
            code={sessionCode}
            setCode={updateCode}
            language={language}
          />
        </div>

        <div className="p-3 bg-gray-700 flex justify-end border-t border-gray-600">
          <SubmissionControls onRun={handleRun} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default CodingPanel;