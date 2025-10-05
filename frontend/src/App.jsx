import React, { use } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./components/home/Home"
import RoomPage from "./components/RoomPage";
import CodingAndWhiteboard from "./components/interviewRoom/CodingAndWhiteboard";
import Signup from "./Signup";
import Login from "./Login";
import Navbar from "./Navbar";
import { AuthProvider } from "./context/AuthContext"
import Dashboard from "./components/interviewRoom/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import VideoCallPage from "./components/interviewRoom/videocall/VideoCallPage"
import AssessmentBuilder from "./components/assessment/AssessmentBuilder";

function App() {
  // const location = useLocation();
  return (
    <AuthProvider>
      <Router>
        {/* <Navbar /> */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="/assessment" element={<CodingAndWhiteboard />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/videocall/:userId/:questionId/coding" element={<CodingAndWhiteboard/>}/>
          {/* <Route path="/videocall/coding" element={<CodingAndWhiteboard/>}/> */}
          <Route path="/videocall" element={<VideoCallPage/>}/>
          <Route path ="/create_assessment" element={<AssessmentBuilder/>}/>
       
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard/>
              </ProtectedRoute>
            } 
          />
       
        </Routes>

      </Router>
    </AuthProvider>
  );
}

export default App;
