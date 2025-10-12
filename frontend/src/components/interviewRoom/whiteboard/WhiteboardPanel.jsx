import React, { useState, useEffect } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { useCollabSocket } from "../../../context/CollabSocketContext";

export default function WhiteboardPanel() {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const { sessionElements, updateElements } = useCollabSocket();
  const [localElements, setLocalElements] = useState([]);
  
  console.log("🧩 WhiteboardPanel render with", sessionElements?.length || 0, "elements");
  
  // Initialize local elements from session elements on first load
  useEffect(() => {
    if (sessionElements && !localElements.length) {
      console.log("🔄 Initial sync of elements", sessionElements.length);
      setLocalElements(sessionElements);
    }
  }, [sessionElements, localElements]);
  
  // Keep local elements updated when remote elements change
  useEffect(() => {
    if (sessionElements && excalidrawAPI) {
      console.log("📥 Received remote elements, updating scene", sessionElements.length);
      excalidrawAPI.updateScene({ elements: sessionElements });
      setLocalElements(sessionElements);
    }
  }, [sessionElements, excalidrawAPI]);

  return (
    <div className="w-full h-full">
      <Excalidraw
        excalidrawAPI={setExcalidrawAPI}
        initialData={{
          elements: sessionElements || [],
          appState: { viewBackgroundColor: "#ffffff" }
        }}
        onChange={(elements) => {
          console.log("📤 Local whiteboard change", elements.length);
          updateElements(elements);
        }}
      />
    </div>
  );
}