import React, { useRef, useEffect, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { useCollabSocket } from "../../../context/CollabSocketContext";

export default function WhiteboardPanel() {
  const excalidrawRef = useRef(null);
  const socket = useCollabSocket();

  const [elements, setElements] = useState([]);
  const lastSentElements = useRef([]);
  const [ready, setReady] = useState(false); // flag to check Excalidraw mount
  const debounceTimeout = useRef(null);

  // Wait for Excalidraw to mount
  const onExcalidrawMount = () => setReady(true);

  // Handle initial state from backend
  useEffect(() => {
    if (!socket) return;

    const handleInitialState = (data) => {
      console.log("whiteboard: ",data)
      const newElements = Array.isArray(data?.whiteboard) ? data.whiteboard : [];
      lastSentElements.current = newElements;
      setElements(newElements);

      // Only call updateScene if Excalidraw is ready
      if (ready && excalidrawRef.current?.updateScene) {
        excalidrawRef.current.updateScene({ elements: newElements });
      }
    };

    socket.on("load-initial-state", handleInitialState);
    return () => socket.off("load-initial-state", handleInitialState);
  }, [socket, ready]);

  // Remote updates
  useEffect(() => {
    if (!socket) return;

    const handleRemoteUpdate = ({ whiteboard: newElements }) => {
      if (!Array.isArray(newElements)) return;
      if (JSON.stringify(newElements) === JSON.stringify(lastSentElements.current)) return;

      lastSentElements.current = newElements;
      setElements(newElements);

      if (ready && excalidrawRef.current?.updateScene) {
        excalidrawRef.current.updateScene({ elements: newElements });
      }
    };

    socket.on("whiteboard-update", handleRemoteUpdate);
    return () => socket.off("whiteboard-update", handleRemoteUpdate);
  }, [socket, ready]);

  // Local changes -> debounced emit
  const handleChange = (updatedElementsOrState) => {
    const updatedElements = Array.isArray(updatedElementsOrState)
      ? updatedElementsOrState
      : updatedElementsOrState?.elements ?? [];

    setElements(updatedElements);

    if (!socket) return;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      if (JSON.stringify(updatedElements) !== JSON.stringify(lastSentElements.current)) {
        lastSentElements.current = updatedElements;
        socket.emit("whiteboard-change", { whiteboard: updatedElements });
      }
    }, 300);
  };

  // Cleanup debounce
  useEffect(() => () => debounceTimeout.current && clearTimeout(debounceTimeout.current), []);

  return (
    <div className="w-full h-[90vh] overflow-auto bg-gray-50 rounded-md">
      <Excalidraw
        ref={excalidrawRef}
        initialData={{ elements }} // can start empty or initialData={{ elements: [] }}
        onChange={handleChange}
        onPointerUpdate={onExcalidrawMount} // trigger ready after mount
      />
    </div>
  );
}
