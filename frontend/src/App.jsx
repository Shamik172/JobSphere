import React, { useEffect } from "react";
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
import NotFound from "./NotFound";
import MyAssessment from "./components/candidate/MyAssessment";

// Import the notification mount function
import { mountNotifications } from "./notification/Notification";
import InterviewerAndCandidateProfile from "./components/profilePage/InterviewerAndCandidateProfile"
import CandidatePracticesQuestion from "./components/home/homecomponents/CandidatePracticesQuestion";

function AppContent() {
  const location = useLocation();

  // Hide Navbar on specific routes
  const hideNavbar =
    ["/", "/login", "/signup"].includes(location.pathname) ||
    location.pathname.startsWith("/videocall/");

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* === Public Routes === */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* === Common Protected Routes (for all logged-in users) === */}
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

        {/* === Interviewer-Only Routes === */}
        <Route
          path="/create_assessment"
          element={
            <ProtectedRoute allowedRoles={["interviewer"]}>
              <AssessmentBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment/:id"
          element={
            <ProtectedRoute allowedRoles={["interviewer"]}>
              <AssessmentBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment/upcoming_assessment"
          element={
            <ProtectedRoute allowedRoles={["interviewer"]}>
              <UpcomingAssessments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <InterviewerAndCandidateProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/my_assessment"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <MyAssessment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidatePracticesQuestion/:questionId"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <CandidatePracticesQuestion />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  // Mount global notifications once
  useEffect(() => {
    mountNotifications();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
