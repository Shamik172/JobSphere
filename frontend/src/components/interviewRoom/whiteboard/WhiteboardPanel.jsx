import React, { useState, useEffect, useMemo, useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { useCollabSocket } from "../../../context/CollabSocketContext";

// Step 1: Import both of your library files
import systemDesignFile from "../../../core/SystemDesignLibrary.excalidrawlib?raw"; // Assuming this is your first file
import flowchartFile from "../../../core/SystemDesignLibrary2.excalidrawlib?raw"; // Assuming this is your second file

export default function WhiteboardPanel() {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const { sessionElements, updateElements } = useCollabSocket();
  const [localElements, setLocalElements] = useState([]);
  const isRemoteUpdate = useRef(false);

  // Step 2: Parse both files and combine their library items
  const allLibraryItems = useMemo(() => {
    const systemDesignData = JSON.parse(systemDesignFile);
    const flowchartData = JSON.parse(flowchartFile);

    // Combine the 'libraryItems' arrays from both files into one
    return [...systemDesignData.libraryItems, ...flowchartData.libraryItems];
  }, []);
  
  // ... (the rest of your console.log and useEffect hooks remain the same)
  console.log("🧩 WhiteboardPanel render with", sessionElements?.length || 0, "elements");
  
  useEffect(() => {
    if (sessionElements && !localElements.length) {
      console.log("🔄 Initial sync of elements", sessionElements.length);
      setLocalElements(sessionElements);
    }
  }, [sessionElements, localElements]);
  
  useEffect(() => {
    if (sessionElements && excalidrawAPI) {
      console.log("📥 Received remote elements, updating scene", sessionElements.length);
      isRemoteUpdate.current = true; // mark this as remote
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
          appState: { viewBackgroundColor: "#ffffff" },
          // Step 3: Pass the combined list to the component
          libraryItems: allLibraryItems, 
        }}
        onChange={(elements) => {
          // Prevent loop: ignore changes immediately after remote sync
          if (isRemoteUpdate.current) {
            isRemoteUpdate.current = false;
            return;
          }
          console.log("📤 Local whiteboard change", elements.length);
          updateElements(elements);
        }}
      />
    </div>
  );
}