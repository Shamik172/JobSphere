import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import VideoCallWindow from "./VideoCallWindow";
import { X } from "lucide-react";

export default function VideoCallPage() {
  const [showQuestions, setShowQuestions] = useState(false);
  const navigate = useNavigate();

  // Example pre-set questions
  const questions = [
    { id: "q1", title: "Two Sum", difficulty: "Easy" },
    { id: "q2", title: "LRU Cache", difficulty: "Medium" },
    { id: "q3", title: "Median of Two Sorted Arrays", difficulty: "Hard" },
  ];

  const userId = "user1";

  return (
    <div className="w-screen h-screen bg-gray-900 relative overflow-hidden">
      <VideoCallWindow />

      {/* Top-left "Questions" button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => setShowQuestions(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-500 transition"
        >
          Questions
        </button>
      </div>

      {/* Sliding side panel */}
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
          {questions.map((q) => (
            <button
              key={q.id}
              onClick={() =>
                navigate(`/videocall/${userId}/${q.id}/coding`)
              }
              className="w-full flex justify-between items-center px-4 py-2 rounded-md hover:bg-gray-100 transition"
            >
              <span className="font-medium text-gray-800">{q.title}</span>
              <span className="text-sm text-gray-500">({q.difficulty})</span>
            </button>
          ))}
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
