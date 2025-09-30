import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home"
import RoomPage from "./components/RoomPage";
import CodingAndWhiteboard from "./components/interview/CodingAndWhiteboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="/assessment" element={<CodingAndWhiteboard/>}/>
      </Routes>
    </Router>
  );
}

export default App;
