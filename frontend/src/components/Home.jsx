import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [joinRoomId, setJoinRoomId] = useState("");

  const handleCreateRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 10); // simple roomId
    navigate(`/room/${roomId}`);
  };

  const handleJoinRoom = () => {
    if (joinRoomId.trim()) {
      navigate(`/room/${joinRoomId}`);
    } else {
      alert("Please enter a room ID");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "50px" }}>
      <button onClick={handleCreateRoom} style={{ padding: "10px 20px", marginBottom: "20px" }}>Create Room</button>

      <div>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={joinRoomId}
          onChange={(e) => setJoinRoomId(e.target.value)}
          style={{ padding: "10px", width: "200px" }}
        />
        <button onClick={handleJoinRoom} style={{ padding: "10px 20px", marginLeft: "10px" }}>Join Room</button>
      </div>
    </div>
  );
};

export default Home;
