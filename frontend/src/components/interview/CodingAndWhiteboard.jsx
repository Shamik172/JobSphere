import React, { useState } from "react";
import CodingPanel from "./coding/CodingPanel";
import WhiteboardPanel from "./whiteboard/WhiteboardPanel";

const CodingAndWhiteboard = () => {
  const [mode, setMode] = useState("coding");

  return (
    <div className="flex flex-col h-screen border rounded shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b">
        <h1 className="text-lg font-semibold text-gray-800">Jobsphere</h1>
        {mode === "coding" ? (
          <button
            onClick={() => setMode("whiteboard")}
            className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
          >
            Go to Whiteboard
          </button>
        ) : (
          <button
            onClick={() => setMode("coding")}
            className="px-3 py-1 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700 transition"
          >
            Back to Coding
          </button>
        )}
      </div>

      {/* Main panel fills rest of screen */}
      <div className="flex-1 flex overflow-hidden">
        {mode === "coding" ? <CodingPanel /> : <WhiteboardPanel />}
      </div>
    </div>
  );
};

export default CodingAndWhiteboard;
