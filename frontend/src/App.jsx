import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./components/home/Home";
import CodingAndWhiteboard from "./components/interviewRoom/CodingAndWhiteboard";
import Signup from "./Signup";
import Login from "./Login";
import SetupAccount from "./SetupAccount";
import { AuthProvider } from "./context/AuthContext";
import VideoCallPage from "./components/interviewRoom/videocall/VideoCallPage";
import AssessmentBuilder from "./components/assessment/AssessmentBuilder";
import UpcomingAssessments from "./components/assessment/UpcomingAssessment";
import Navbar from "./Navbar";
import ProtectedRoute from "./ProtectedRoute";
import NotFound from "./NotFound";
import MyAssessment from "./components/candidate/MyAssessment";
import { mountNotifications } from "./notification/Notification";
import InterviewerAndCandidateProfile from "./components/profilePage/InterviewerAndCandidateProfile";
import CandidatePracticesQuestion from "./components/home/homecomponents/CandidatePracticesQuestion";

function AppContent() {
  const location = useLocation();

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
        <Route path="/setup-account" element={<SetupAccount />} />

        {/* === Interviewer Dashboard / Assessment List === */}
        <Route
          path="/assessments"
          element={
            <ProtectedRoute allowedRoles={["interviewer"]}>
              <UpcomingAssessments />
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

        {/* === Interviewer: Create Assessment === */}
        <Route
          path="/assessments/create"
          element={
            <ProtectedRoute allowedRoles={["interviewer"]}>
              <AssessmentBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create_assessment"
          element={
            <ProtectedRoute allowedRoles={["interviewer"]}>
              <AssessmentBuilder />
            </ProtectedRoute>
          }
        />

        {/* === Interviewer: Manage Assessment Details === */}
        <Route
          path="/assessments/:id"
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

        {/* === Shared Video Call & Coding Environment === */}
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

        {/* === Candidate-Specific Routes === */}
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

        {/* === Common Profile === */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <InterviewerAndCandidateProfile />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
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