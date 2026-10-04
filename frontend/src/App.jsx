import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { mountNotifications } from "./notification/Notification.jsx";

// Public Pages
import Home from "./pages/Home.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import SetupAccount from "./pages/SetupAccount.jsx";
import NotFound from "./pages/NotFound.jsx";

// Assessment Route Pages
import AssessmentsDirectoryPage from "./pages/assessments/AssessmentsDirectoryPage.jsx";
import AssessmentWorkspacePage from "./pages/assessments/AssessmentWorkspacePage.jsx";

// Common Components
import Navbar from "./components/common/Navbar.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

// Live Room
import VideoCallPage from "./components/interviewRoom/videocall/VideoCallPage.jsx";
import CodingAndWhiteboard from "./components/interviewRoom/CodingAndWhiteboard.jsx";

// Profile
import ProfilePage from "./pages/ProfilePage.jsx";

// Candidate Portal
import MyAssessment from "./components/candidate/MyAssessment.jsx";
// import CandidatePracticesQuestion from "./components/home/homecomponents/CandidatePracticesQuestion.jsx";

function AppContent() {
  const location = useLocation();

  // Hide the global navigation bar only inside distraction-free login/signup and active video calls
  const hideNavbar =
    ["/login", "/signup", "/setup-account"].includes(location.pathname) ||
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

        {/* === Interviewer: Assessments Directory === */}
        <Route
          path="/assessments"
          element={
            <ProtectedRoute allowedRoles={["interviewer"]}>
              <AssessmentsDirectoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment/upcoming_assessment"
          element={
            <ProtectedRoute allowedRoles={["interviewer"]}>
              <AssessmentsDirectoryPage />
            </ProtectedRoute>
          }
        />

        {/* === Interviewer: Assessment Workspace / Builder === */}
        <Route
          path="/create_assessment"
          element={
            <ProtectedRoute allowedRoles={["interviewer"]}>
              <AssessmentWorkspacePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments/create"
          element={
            <ProtectedRoute allowedRoles={["interviewer"]}>
              <AssessmentWorkspacePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments/:id"
          element={
            <ProtectedRoute allowedRoles={["interviewer"]}>
              <AssessmentWorkspacePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment/:id"
          element={
            <ProtectedRoute allowedRoles={["interviewer"]}>
              <AssessmentWorkspacePage />
            </ProtectedRoute>
          }
        />

        {/* === Live Interview Room === */}
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

        {/* === Candidate Portal (Reserved for next milestone) === */}
        <Route
          path="/candidate/my_assessment"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <MyAssessment />
            </ProtectedRoute>
          }
        />
        {/* 
        <Route
          path="/candidatePracticesQuestion/:questionId"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <CandidatePracticesQuestion />
            </ProtectedRoute>
          }
        />
        */}

        {/* === Common Profile === */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
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
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}