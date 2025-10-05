import React, { useRef, useEffect } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { initialData } from "./initialData"; 

export default function WhiteboardPanel() {
  // We still keep the ref if we want to programmatically control Excalidraw later
  const excalidrawRef = useRef(null);

  // Dynamically load external libraries from Excalidraw library URL
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://libraries.excalidraw.com/?useHash=true&theme=dark";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);


  return (
    // We just need a container for the Excalidraw component.
    <div className="w-full h-[90vh] overflow-auto">
        <Excalidraw
            ref={excalidrawRef}
            initialData={initialData}
        />
    </div>

  );
}