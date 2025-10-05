import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [assessmentName, setAssessmentName] = useState("");
  const [assessmentDate, setAssessmentDate] = useState("");

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleCreate = () => {
    // Here you can call your API to save assessment
    console.log("Assessment Name:", assessmentName);
    console.log("Assessment Date:", assessmentDate);
    setShowModal(false); // close modal
    setAssessmentName("");
    setAssessmentDate("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <div className="bg-gray-100 text-black p-4 flex justify-between items-center">
        <h2 className="font-bold text-xl">Interviewer Dashboard</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar: Profile */}
        <div className="w-full md:w-1/4 bg-gray-100 p-4">
          <h3 className="font-bold text-lg mb-4">Profile</h3>
          <p>Name: Demo Interviewer</p>
          <p>Email: demo@example.com</p>
        </div>

        {/* Right Section */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-4">Your Assessments</h3>
            <p>Manage your assessments and interviews from here.</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-around mt-6 gap-3 sm:gap-0 bg-gray-50 p-4 rounded shadow-md">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => setShowModal(true)}
            >
              Create Assessment
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Today’s Assessment
            </button>
            <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
              Previous Assessment
            </button>
            <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
              Upcoming Assessment
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Blurry background overlay */}
          <div
            className="absolute inset-0 backdrop-blur-sm"
            onClick={() => setShowModal(false)} // close modal when clicked outside
          ></div>

          {/* Glass-like modal with better UI */}
          <div
            className="relative bg-white bg-opacity-70 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-96 z-10 border border-white border-opacity-30"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            <h3 className="font-bold text-xl mb-6 text-gray-800">Create Assessment</h3>

            <input
              type="text"
              placeholder="Assessment Name"
              value={assessmentName}
              onChange={(e) => setAssessmentName(e.target.value)}
              className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />

            <input
              type="date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
              className="w-full p-3 mb-6 rounded-lg border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition"
            />

            <div className="flex justify-end gap-4">
              <button
                className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
                onClick={handleCreate}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
