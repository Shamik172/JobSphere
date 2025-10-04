import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home"
import RoomPage from "./components/RoomPage";
import CodingAndWhiteboard from "./components/interview/CodingAndWhiteboard";
import VideoCallPage from "./components/interview/video/VideoCallPage"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="/videocall/:userId/:questionId/coding" element={<CodingAndWhiteboard/>}/>
        {/* <Route path="/videocall/coding" element={<CodingAndWhiteboard/>}/> */}
        <Route path="/videocall" element={<VideoCallPage/>}/>
      </Routes>
    </Router>
  );
}

export default App;
