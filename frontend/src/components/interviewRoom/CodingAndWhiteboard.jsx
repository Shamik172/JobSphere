import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Rnd } from "react-rnd"; // Step 1: Import Rnd
import CodingPanel from "./coding/CodingPanel";
import WhiteboardPanel from "./whiteboard/WhiteboardPanel";
import VideoCallWindow from "./videocall/VideoCallWindow";
import { X, ArrowLeft, Minus, Square } from "lucide-react"; // Added icons for controls
import { CollabSocketProvider } from "../../context/CollabSocketContext";

const CodingAndWhiteboard = () => {
  const { assessmentId, roomId, questionId } = useParams();
  const navigate = useNavigate();

  const [mode, setMode] = useState("coding");
  const [showVideo, setShowVideo] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  // Step 2: Add state for the video window's size, position, and minimized status
  const [videoDimensions, setVideoDimensions] = useState({ width: 320, height: 240 });
  const [videoPosition, setVideoPosition] = useState({ x: window.innerWidth - 344, y: window.innerHeight - 264 });

  const handleMinimizeToggle = () => {
    setIsMinimized(!isMinimized);
    console.log("Minimize toggled:", isMinimized);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-100 via-blue-200 to-purple-200 border border-white/30 rounded-xl shadow-xl overflow-hidden relative">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-3 bg-white/60 backdrop-blur-md border-b border-white/50 shadow-md z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200 transition">
            <ArrowLeft size={18} className="text-indigo-700" />
          </button>
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent tracking-wide">
            JobSphere
          </h1>
        </div>

        <button
          onClick={() => setMode(mode === "coding" ? "whiteboard" : "coding")}
          className={`px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all shadow-md hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] ${
            mode === "coding"
              ? "bg-gradient-to-r from-indigo-500 to-blue-500"
              : "bg-gradient-to-r from-gray-500 to-gray-600"
          }`}
        >
          {mode === "coding" ? "Go to Whiteboard" : "Back to Coding"}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex mt-0.5 bg-white/50 backdrop-blur-sm border-t border-white/30 overflow-hidden rounded-b-xl">
        <div className={`flex-1 ${mode === "coding" ? "block" : "hidden"}`}>
          <CodingPanel questionId={questionId} />
        </div>
        <div className={`flex-1 ${mode === "whiteboard" ? "block" : "hidden"}`}>
          <WhiteboardPanel />
        </div>
      </div>

      {/* Step 3: Wrap the video window in the Rnd component */}
      {showVideo && (
        <Rnd
          size={isMinimized ? { width: videoDimensions.width, height: 30 } : videoDimensions}
          position={videoPosition}
          onDragStop={(e, d) => setVideoPosition({ x: d.x, y: d.y })}
          onResizeStop={(e, direction, ref, delta, position) => {
            setVideoDimensions({
              width: ref.style.width,
              height: ref.style.height,
            });
            setVideoPosition(position);
          }}
          minWidth={200}
          minHeight={isMinimized ? 30 : 150}
          bounds="parent"
          className="bg-white/20 backdrop-blur-lg border border-white/40 rounded-xl shadow-lg overflow-hidden z-50 flex flex-col"
          enableResizing={!isMinimized}
        >
          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-400 to-blue-600 cursor-move h-7 px-2">
            {!isMinimized && <span className="text-xs text-white font-medium">Video Call</span>}
            <div className="flex ml-auto">
              <button onClick={handleMinimizeToggle} className="text-white hover:text-white/80 mx-1 p-1">
                {isMinimized ? <Square size={12} /> : <Minus size={12} />}
              </button>
              <button onClick={() => setShowVideo(false)} className="text-white hover:text-white/80 p-1">
                <X size={12} />
              </button>
            </div>
          </div>
          <div className="flex-1">
            <div className={isMinimized ? 'hidden' : 'h-full'}>
              <VideoCallWindow roomId={roomId} isMiniVideoCallWindow={true}/>
            </div>
          </div>
        </Rnd>
      )}
    </div>
  );
};

export default () => (
  <CollabSocketProvider>
    <CodingAndWhiteboard />
  </CollabSocketProvider>
);