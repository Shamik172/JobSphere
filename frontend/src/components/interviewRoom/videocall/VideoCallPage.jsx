import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import VideoCallWindow from "./VideoCallWindow";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

export default function VideoCallPage() {
  const { assessmentId, roomId } = useParams();
  const { user} = useAuth();
  // console.log("roomroomId : ", roomId)


  const userId = user.id;

  const [showQuestions, setShowQuestions] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (showQuestions) fetchQuestions();
  }, [showQuestions]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/questions/assessment/${assessmentId}`,
        { withCredentials: true }
      );
      setQuestions(res.data.questions);
    } catch (err) {
      console.error("Failed to fetch questions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to coding route with question data
  const handleQuestionSelect = (q) => {
    setShowQuestions(false);
    console.log("questions : ",q)
    navigate(`/videocall/${assessmentId}/${roomId}/${q._id}/coding&whiteboard`, { state: { q } });
  };

  return (
    <div className="w-screen h-screen bg-gray-900 relative overflow-hidden">
      {/* Video call window (main area) */}
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
        {/* Header */}
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

        {/* Question List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loading ? (
            <p className="text-gray-500 text-center py-10">
              Loading questions...
            </p>
          ) : questions.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              No questions found
            </p>
          ) : (
            questions.map((q) => {
              const cardColor =
                q.difficulty === "Easy"
                  ? "from-green-1-0 to-green-200 hover:from-green-100 hover:to-green-200 border-green-200"
                  : q.difficulty === "Medium"
                  ? "from-yellow-100 to-yellow-200 hover:from-yellow-100 hover:to-yellow-200 border-yellow-200"
                  : "from-red-100 to-red-200 hover:from-red-100 hover:to-red-200 border-red-200";

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


      {/* Overlay when panel is open */}
      {showQuestions && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30"
          onClick={() => setShowQuestions(false)}
        />
      )}
    </div>
  );
}
