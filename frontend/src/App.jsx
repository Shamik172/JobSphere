import React, { use } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./components/Home"
import RoomPage from "./components/RoomPage";
import CodingAndWhiteboard from "./components/interview/CodingAndWhiteboard";
import Signup from "./Signup";
import Login from "./Login";
import Navbar from "./Navbar";
import { AuthProvider } from "./context/AuthContext"
import Dashboard from "./components/interview/Dashboard";
import ProtectedRoute from "./ProtectedRoute";


function App() {
  // const location = useLocation();
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="/assessment" element={<CodingAndWhiteboard />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
       
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
