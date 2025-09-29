import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../utils/socket.js";

const RoomPage = () => {
  const { roomId } = useParams();
  const localVideoRef = useRef();
  const [peers, setPeers] = useState({});

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
      localVideoRef.current.srcObject = stream;

      socket.emit("join-room",{ roomId, userId:"user-"+Math.random().toString(36).substring(2,8) });

      socket.on("user-joined", ({ userId, socketId }) => {
        setPeers(prev => ({ ...prev, [socketId]: null })); // placeholder for future peer connections
      });

      socket.on("user-left", ({ socketId }) => {
        setPeers(prev => {
          const copy = {...prev};
          delete copy[socketId];
          return copy;
        });
      });
    };

    init();
  }, [roomId]);

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:"10px", padding:"10px" }}>
      <video ref={localVideoRef} autoPlay muted style={{ width:"100%", border:"1px solid black" }} />
      {Object.keys(peers).map(id => (
        <video key={id} autoPlay style={{ width:"100%", border:"1px solid black" }} />
      ))}
    </div>
  );
};

export default RoomPage;
