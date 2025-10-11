import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CodingPanel from "./coding/CodingPanel";
import WhiteboardPanel from "./whiteboard/WhiteboardPanel";
import VideoCallWindow from "./videocall/VideoCallWindow";
import { X, ArrowLeft } from "lucide-react";
import { CollabSocketProvider, useCollabSocket } from "../../context/CollabSocketContext";

const CodingAndWhiteboard = () => {
  const { assessmentId, roomId, questionId } = useParams();
  const navigate = useNavigate();
  const socket = useCollabSocket();

  const [mode, setMode] = useState("coding");
  const [showVideo, setShowVideo] = useState(true);

  // Store initial state from backend
  const [initialCode, setInitialCode] = useState("");
  const [initialWhiteboard, setInitialWhiteboard] = useState([]);

  // Listen for "load-initial-state" from backend
  useEffect(() => {
    console.log("socket in CodingAndWhiteboard : ", socket)
    if (!socket) return;

    const handleInitialState = (data) => {
      console.log("📩 Received load-initial-state:", data);
      setInitialCode(data.code || "");
      setInitialWhiteboard(data.whiteboard || []);
      console.log(data)
    };

    socket.on("load-initial-state", handleInitialState);

    return () => {
      socket.off("load-initial-state", handleInitialState);
    };
  }, [socket]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-100 via-blue-200 to-purple-200 border border-white/30 rounded-xl shadow-xl overflow-hidden relative">

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-3 bg-white/60 backdrop-blur-md border-b border-white/50 shadow-md z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <ArrowLeft size={18} className="text-indigo-700" />
          </button>
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent tracking-wide">
            JobSphere
          </h1>
        </div>

        {mode === "coding" ? (
          <button
            onClick={() => setMode("whiteboard")}
            className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
          >
            Go to Whiteboard
          </button>
        ) : (
          <button
            onClick={() => setMode("coding")}
            className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-gray-500 to-gray-600 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
          >
            Back to Coding
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex mt-0.5 bg-white/50 backdrop-blur-sm border-t border-white/30 overflow-hidden rounded-b-xl">
        {mode === "coding" ? (
          <CodingPanel questionId={questionId} initialCode={initialCode} />
        ) : (
          <WhiteboardPanel initialWhiteboard={initialWhiteboard} />
        )}
      </div>

      {/* Floating Video Call Window */}
      {showVideo && (
        <div className="absolute bottom-6 right-6 w-80 h-60 bg-white/20 backdrop-blur-lg border border-white/40 rounded-xl shadow-[0_0_25px_rgba(0,0,0,0.2)] overflow-hidden z-50">
          <div className="flex justify-end p-1 bg-gradient-to-r from-indigo-600 to-blue-600">
            <button
              onClick={() => setShowVideo(false)}
              className="text-white hover:text-red-400 transition"
            >
              <X size={16} />
            </button>
          </div>
          <VideoCallWindow roomId={roomId} />
        </div>
      )}
    </div>
  );
};

export default () => (
  <CollabSocketProvider>
    <CodingAndWhiteboard />
  </CollabSocketProvider>
);
