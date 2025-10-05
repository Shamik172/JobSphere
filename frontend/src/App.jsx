import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home"
import RoomPage from "./components/RoomPage";
import CodingAndWhiteboard from "./components/interview/CodingAndWhiteboard";
import Login from "./components/Login";
import Signup from "./components/Signup";

function App() {
  return (
    <Router>
      <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="/assessment" element={<CodingAndWhiteboard/>}/>
      </Routes>
    </Router>
  );
}

export default App;
