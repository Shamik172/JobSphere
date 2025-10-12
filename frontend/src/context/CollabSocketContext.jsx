import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { useAuth } from "./AuthContext"; // Ensure this path is correct

const CollabSocketContext = createContext(null);
export const useCollabSocket = () => useContext(CollabSocketContext);

export const CollabSocketProvider = ({ children }) => {
  const { assessmentId, questionId } = useParams();
  const { user } = useAuth?.() || {};
  // Provide a fallback ID for testing if needed
  const candidateId = user?._id || "68dbad15fb53a87ba397bcca";

  const [socket, setSocket] = useState(null);
  
  // State for CURRENT session data, not just initial
  const [sessionCode, setSessionCode] = useState("// Loading session...");
  const [sessionElements, setSessionElements] = useState([]);

  // Refs for debouncing emitters
  const codeDebounceTimeout = useRef(null);
  const whiteboardDebounceTimeout = useRef(null);

  useEffect(() => {
    if (!assessmentId || !questionId || !candidateId) return;

    const newSocket = io(`${import.meta.env.VITE_BACKEND_URL}/collab`, {
      query: { assessmentId, questionId, candidateId },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected. Emitting join-room...");
      newSocket.emit("join-room", { assessmentId, questionId, candidateId });
    });

    // Provider listens for ALL relevant events and updates ITS OWN state
    newSocket.on("load-initial-state", (data) => {
      console.log("💡 Provider received initial state:", data);
      setSessionCode(data.code || "// Start coding here...");
      setSessionElements(data.whiteboard || []);
    });

    newSocket.on("code-update", (data) => {
      console.log("Provider received code update.");
      setSessionCode(data.code);
    });

    newSocket.on("whiteboard-update", (data) => {
      console.log("Provider received whiteboard update.");
      setSessionElements(data.whiteboard);
    });
    
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [assessmentId, questionId, candidateId]);

  // Updater functions that components will call
  const updateCode = useCallback((newCode) => {
    setSessionCode(newCode); // Update local state immediately for responsiveness
    if (codeDebounceTimeout.current) clearTimeout(codeDebounceTimeout.current);
    codeDebounceTimeout.current = setTimeout(() => {
      socket?.emit("code-change", { code: newCode });
    }, 500);
  }, [socket]);

  const updateElements = useCallback((newElements) => {
    setSessionElements(newElements); // Update local state immediately
    if (whiteboardDebounceTimeout.current) clearTimeout(whiteboardDebounceTimeout.current);
    whiteboardDebounceTimeout.current = setTimeout(() => {
      socket?.emit("whiteboard-change", { whiteboard: newElements });
    }, 500);
  }, [socket]);

  const contextValue = {
    socket,
    sessionCode,
    sessionElements,
    updateCode,
    updateElements,
  };

  return (
    <CollabSocketContext.Provider value={contextValue}>
      {children}
    </CollabSocketContext.Provider>
  );
};