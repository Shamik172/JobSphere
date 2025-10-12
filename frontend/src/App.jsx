import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./components/home/Home";
import RoomPage from "./components/RoomPage";
import CodingAndWhiteboard from "./components/interviewRoom/CodingAndWhiteboard";
import Signup from "./Signup";
import Login from "./Login";
import { AuthProvider } from "./context/AuthContext";
import VideoCallPage from "./components/interviewRoom/videocall/VideoCallPage";
import AssessmentBuilder from "./components/assessment/AssessmentBuilder";
import UpcomingAssessments from "./components/assessment/UpcomingAssessment";
import Navbar from "./Navbar";
import ProtectedRoute from "./ProtectedRoute";

function AppContent() {
  const location = useLocation();

  // Hide Navbar on Home, Login, and Signup pages
  const hideNavbar = ["/", "/login", "/signup",].includes(location.pathname) || location.pathname.startsWith("/videocall/");

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/room/:roomId"
          element={
            <ProtectedRoute>
              <RoomPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment"
          element={
            <ProtectedRoute>
              <CodingAndWhiteboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/videocall/:assessmentId/:roomId"
          element={
            <ProtectedRoute>
              <VideoCallPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/videocall/:assessmentId/:roomId/:questionId/coding&whiteboard"
          element={
            <ProtectedRoute>
              <CodingAndWhiteboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create_assessment"
          element={
            <ProtectedRoute>
              <AssessmentBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment/:id"
          element={
            <ProtectedRoute>
              <AssessmentBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment/upcoming_assessment"
          element={
            <ProtectedRoute>
              <UpcomingAssessments />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
