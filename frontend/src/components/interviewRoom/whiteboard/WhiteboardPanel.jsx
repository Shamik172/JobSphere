import React, { useRef, useEffect, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { initialData } from "./initialData";
import { useCollabSocket } from "../../../context/CollabSocketContext";

export default function WhiteboardPanel({ initialWhiteboard }) {
  const excalidrawRef = useRef(null);
  const socket = useCollabSocket();
  const [elements, setElements] = useState(initialWhiteboard || initialData?.elements || []);

  const debounceTimeout = useRef(null); // ✅ store timeout for debounce
  const lastSentElements = useRef([]); // ✅ prevent feedback loop

  // Dynamically load external Excalidraw libraries
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://libraries.excalidraw.com/?useHash=true&theme=dark";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Listen for remote updates from socket
  useEffect(() => {
    if (!socket) return;

    const handleRemoteUpdate = ({ whiteboard: newElements }) => {
      if (!excalidrawRef.current) return;

      const api = excalidrawRef.current;
      api.updateScene({ elements: newElements });
      setElements(newElements);
      lastSentElements.current = newElements; // ✅ update last sent
    };

    socket.on("whiteboard-update", handleRemoteUpdate);

    return () => {
      socket.off("whiteboard-update", handleRemoteUpdate);
    };
  }, [socket]);

  // Debounced send updates to others whenever local user draws
  const handleChange = (updatedElements) => {
    setElements(updatedElements);

    if (!socket) return;

    // Clear previous timeout
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    // Set new timeout
    debounceTimeout.current = setTimeout(() => {
      // Avoid feedback loop
      if (JSON.stringify(updatedElements) !== JSON.stringify(lastSentElements.current)) {
        lastSentElements.current = updatedElements;
        socket.emit("whiteboard-change", { whiteboard: updatedElements });
      }
    }, 300); // 300ms debounce delay
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, []);

  return (
    <div className="w-full h-[90vh] overflow-auto bg-gray-50 rounded-md">
      <Excalidraw
        ref={excalidrawRef}
        initialData={{ elements }}
        onChange={handleChange}
      />
    </div>
  );
}
