import React, { useState, useEffect } from "react";
import { X, Loader2, ShieldAlert } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import VideoCallWindow from "./VideoCallWindow";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

export default function VideoCallPage() {
  const { assessmentId, roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const userId = user?.id || user?._id;

  // Verification & State Management
  const [isVerifying, setIsVerifying] = useState(true);
  const [accessDenied, setAccessDenied] = useState(null);

  const [showQuestions, setShowQuestions] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Verify access authorization before mounting the call
  useEffect(() => {
    const verifyRoomAccess = async () => {
      try {
        setIsVerifying(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/assessments/${assessmentId}/room/${roomId}/verify`,
          { withCredentials: true }
        );

        if (!res.data.authorized) {
          setAccessDenied("You are not an authorized participant for this interview session.");
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || "Access denied. Unable to verify participant credentials.";
        setAccessDenied(errorMsg);
      } finally {
        setIsVerifying(false);
      }
    };

    if (assessmentId && roomId) {
      verifyRoomAccess();
    }
  }, [assessmentId, roomId]);

  // 2. Fetch assessment questions when drawer opens
  useEffect(() => {
    if (showQuestions) {
      fetchQuestions();
    }
  }, [showQuestions]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/questions/assessment/${assessmentId}`,
        { withCredentials: true }
      );
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error("Failed to fetch questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSelect = (q) => {
    setShowQuestions(false);
    navigate(`/videocall/${assessmentId}/${roomId}/${q._id}/coding&whiteboard`, {
      state: { q },
    });
  };

  // Screen 1: Verifying room access
  if (isVerifying) {
    return (
      <div className="w-screen h-screen bg-[#070b14] flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="animate-spin text-indigo-500 mb-3" size={42} />
        <p className="text-sm font-semibold tracking-wide text-slate-400">
          Securing video session & verifying participant enrollment...
        </p>
      </div>
    );
  }

  // Screen 2: Access denied barrier
  if (accessDenied) {
    return (
      <div className="w-screen h-screen bg-[#070b14] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl text-center shadow-2xl">
          <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <ShieldAlert size={26} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">{accessDenied}</p>
          <button
            onClick={() => navigate(user?.role === "candidate" ? "/candidate/my_assessment" : "/assessments")}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/20"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Screen 3: Authorized Live Room
  return (
    <div className="w-screen h-screen bg-gray-900 relative overflow-hidden">
      {/* Video call window */}
      <VideoCallWindow roomId={roomId} userId={userId} />

      {/* Top-left "Questions" button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => setShowQuestions(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-500 transition"
        >
          Questions
        </button>
      </div>

      {/* Sliding questions panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-gradient-to-b from-white/95 to-gray-50/90 backdrop-blur-xl border-l border-gray-200 shadow-2xl transform transition-transform duration-300 ${
          showQuestions ? "translate-x-0" : "translate-x-full"
        } z-40 flex flex-col`}
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 bg-white/70 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
            Select a Question
          </h2>
          <button
            onClick={() => setShowQuestions(false)}
            className="text-gray-500 hover:text-gray-800 transition"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loading ? (
            <p className="text-gray-500 text-center py-10">Loading questions...</p>
          ) : questions.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No questions found</p>
          ) : (
            questions.map((q) => {
              const cardColor =
                q.difficulty === "Easy"
                  ? "from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 border-green-300"
                  : q.difficulty === "Medium"
                  ? "from-yellow-100 to-yellow-200 hover:from-yellow-200 hover:to-yellow-300 border-yellow-300"
                  : "from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 border-red-300";

              return (
                <button
                  key={q._id}
                  onClick={() => handleQuestionSelect(q)}
                  className={`group w-full flex justify-between items-center px-5 py-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-r ${cardColor}`}
                >
                  <span className="font-semibold text-gray-900 group-hover:scale-[1.02] transition-transform duration-200">
                    {q.title}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Overlay when questions panel is open */}
      {showQuestions && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30"
          onClick={() => setShowQuestions(false)}
        />
      )}
    </div>
  );
}