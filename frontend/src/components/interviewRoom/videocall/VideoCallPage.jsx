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
  console.log(user);
  console.log("video call user")
  console.log(user.id);
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
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ${
          showQuestions ? "translate-x-0" : "translate-x-full"
        } z-40 flex flex-col`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">Select a Question</h2>
          <button onClick={() => setShowQuestions(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <p className="text-gray-500 text-center">Loading questions...</p>
          ) : questions.length === 0 ? (
            <p className="text-gray-500 text-center">No questions found</p>
          ) : (
            questions.map((q) => (
              <button
                key={q._id}
                onClick={() => handleQuestionSelect(q)} // navigate to coding page
                className="w-full flex justify-between items-center px-4 py-2 rounded-md hover:bg-gray-100 transition"
              >
                <span className="font-medium text-gray-800">{q.title}</span>
                <span className="text-sm text-gray-500">({q.difficulty})</span>
              </button>
            ))
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
