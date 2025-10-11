import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";

const CollabSocketContext = createContext(null);

export const useCollabSocket = () => useContext(CollabSocketContext);

export const CollabSocketProvider = ({ children }) => {
  const { assessmentId, questionId } = useParams();
  const { user } = useAuth?.() || {};
  const candidateId = user?._id || "68dbad15fb53a87ba397bcca";

  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    console.log("collab provider : ",assessmentId)
    console.log("question: ",questionId);
    console.log("cand: ", candidateId);
    if (!assessmentId || !questionId || !candidateId) return;

    // By default, Socket.IO doesn’t start with WebSocket.
    // It uses something called HTTP long polling first, then upgrades to WebSocket if possible. so transports: ["websockets"]
    const newSocket = io(`${import.meta.env.VITE_BACKEND_URL}/collab`, {
      withCredentials: true,
      query: { assessmentId, questionId, candidateId },
      transports: ["websocket"],
    });

    // const roomKey = `${assessmentId}_${candidateId}_${questionId}`;
    newSocket.emit("join-room", { assessmentId, questionId, candidateId });

    newSocket.on("connect", () => {
      console.log("Connected to collab socket:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.warn("Collab socket disconnected");
    });

    setSocket(newSocket);
    socketRef.current = newSocket;

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [assessmentId, questionId, candidateId]);

  return (
    <CollabSocketContext.Provider value={socket}>
      {children}
    </CollabSocketContext.Provider>
  );
};
