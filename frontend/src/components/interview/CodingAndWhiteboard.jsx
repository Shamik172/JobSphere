import React, { useState } from "react";
import CodingPanel from "./coding/CodingPanel";
import WhiteboardPanel from "./whiteboard/WhiteboardPanel";
import VideoCallWindow from "./video/VideoCallWindow"; // Import VideoCallWindow
import { X } from "lucide-react";

const CodingAndWhiteboard = ({ roomId, userId }) => {
  const [mode, setMode] = useState("coding");
  const [showVideo, setShowVideo] = useState(true); // Control floating video visibility

  return (
    <div className="flex flex-col h-screen border rounded shadow-lg overflow-hidden relative">
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

      {/* Main panel */}
      <div className="flex-1 flex overflow-hidden">
        {mode === "coding" ? <CodingPanel /> : <WhiteboardPanel />}
      </div>

      {/* Floating Video Call Window */}
      {showVideo && (
        <div className="absolute bottom-4 right-4 w-80 h-60 bg-gray-900 rounded-lg shadow-lg overflow-hidden z-50">
          <div className="flex justify-end p-1 bg-gray-800">
            <button
              onClick={() => setShowVideo(false)}
              className="text-white hover:text-red-500"
            >
              <X size={16} />
            </button>
          </div>
          <VideoCallWindow roomId={roomId} userId={userId} />
        </div>
      )}
    </div>
  );
};

export default CodingAndWhiteboard;
