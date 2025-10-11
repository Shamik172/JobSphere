import React, { useRef, useEffect, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { initialData } from "./initialData";
import { useCollabSocket } from "../../../context/CollabSocketContext";

export default function WhiteboardPanel() {
  const excalidrawRef = useRef(null);
  const socket = useCollabSocket();
  const [elements, setElements] = useState(initialData?.elements || []);

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

    const handleRemoteUpdate = ({ elements: newElements }) => {
      if (!excalidrawRef.current) return;
      const api = excalidrawRef.current;
      api.updateScene({ elements: newElements }); // update whiteboard view
      setElements(newElements);
    };

    socket.on("whiteboard-update", handleRemoteUpdate);

    return () => {
      socket.off("whiteboard-update", handleRemoteUpdate);
    };
  }, [socket]);

  // Send updates to others whenever local user draws
  const handleChange = (updatedElements, appState, files) => {
    setElements(updatedElements);

    // send minimal payload to keep it lightweight
    if (socket) {
      socket.emit("whiteboard-update", { elements: updatedElements });
    }
  };

  return (
    <div className="w-full h-[90vh] overflow-auto bg-gray-50 rounded-md">
      <Excalidraw
        ref={excalidrawRef}
        initialData={initialData}
        onChange={handleChange}
      />
    </div>
  );
}
