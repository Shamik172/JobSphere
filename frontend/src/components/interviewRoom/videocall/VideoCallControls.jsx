import React, { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Hand,
  Users,
} from "lucide-react";

export default function VideoCallControls({
  localStreamRef,
  localVideoRef,
  onLeaveCall,
  participantsCount,
  onMediaStateChange, // New prop to notify parent of media changes
  isMiniVideoCallWindow,
}) {
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [permissionAsked, setPermissionAsked] = useState(false);

  console.log("dljfds : ",isMiniVideoCallWindow)
  // 1. Define icon size based on the prop
  const iconSize = isMiniVideoCallWindow ? 18 : 24;
  const buttonPadding = isMiniVideoCallWindow ? "p-2" : "p-3";

  // Request camera + mic permission (like Google Meet)
  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      // Check if the current localStreamRef already has tracks and stop them
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Assign the new stream
      localStreamRef.current = stream;

      // Attach to video element if provided
      if (localVideoRef?.current) {
        localVideoRef.current.srcObject = stream;
      }

      setMicOn(true);
      setCamOn(true);
      setPermissionAsked(true);

      // Notify parent component about media state
      onMediaStateChange?.(true, true);

      console.log("✅ Permissions granted, media stream ready:", {
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length,
      });
    } catch (err) {
      console.error("❌ Permission denied:", err);
      // Set states to reflect permission denial
      setMicOn(false);
      setCamOn(false);
      onMediaStateChange?.(false, false);
      alert(
        "Please allow camera and microphone access to join the call. You can refresh the page to try again."
      );
    }
  };

  // Ask permission automatically once when joining
  useEffect(() => {
    if (!permissionAsked) {
      requestPermissions();
    }

    // Cleanup function to stop tracks when component unmounts
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Toggle microphone
  const toggleMic = () => {
    const tracks = localStreamRef.current?.getAudioTracks();
    if (tracks?.length) {
      const newState = !micOn;
      tracks.forEach((t) => (t.enabled = newState));
      setMicOn(newState);
      onMediaStateChange?.(newState, camOn);
    } else {
      requestPermissions(); // if no tracks yet, ask permission again
    }
  };

  // Toggle camera
  const toggleCam = () => {
    const tracks = localStreamRef.current?.getVideoTracks();
    if (tracks?.length) {
      const newState = !camOn;
      tracks.forEach((t) => (t.enabled = newState));
      setCamOn(newState);
      onMediaStateChange?.(micOn, newState);
    } else {
      requestPermissions(); // if no video tracks yet
    }
  };

  // Raise hand
  const raiseHand = () => {
    alert("✋ Hand Raised");
  };

  // Controls bar
  return (
    <div
      className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center bg-gray-900 bg-opacity-70 rounded-full shadow-lg z-50 transition-all duration-300 ${
        isMiniVideoCallWindow ? "gap-2 p-2" : "gap-5 p-3" // 2. Reduced gap and padding
      }`}
    >
      {/* Mic toggle */}
      <button
        onClick={toggleMic}
        className={`${buttonPadding} rounded-full ${ // 3. Dynamic button padding
          micOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-500"
        } focus:ring-2 focus:ring-white`}
        title={micOn ? "Mute mic" : "Unmute mic"}
      >
        {micOn ? (
          <Mic className="text-white" size={iconSize} /> // 4. Dynamic icon size
        ) : (
          <MicOff className="text-white" size={iconSize} />
        )}
      </button>

      {/* Camera toggle */}
      <button
        onClick={toggleCam}
        className={`${buttonPadding} rounded-full ${
          camOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-500"
        } focus:ring-2 focus:ring-white`}
        title={camOn ? "Turn off camera" : "Turn on camera"}
      >
        {camOn ? (
          <Video className="text-white" size={iconSize} />
        ) : (
          <VideoOff className="text-white" size={iconSize} />
        )}
      </button>
      
      {/* Participants count (hidden when minimized) */}
      {!isMiniVideoCallWindow && (
        <div
          className="p-3 rounded-full bg-gray-700 text-white flex items-center gap-2"
          title="Participants"
        >
          <Users size={20} />
          <span>{participantsCount}</span>
        </div>
      )}

      {/* Leave call */}
      <button
        onClick={onLeaveCall}
        className={`${buttonPadding} rounded-full bg-red-600 hover:bg-red-500 focus:ring-2 focus:ring-white`}
        title="Leave call"
      >
        <PhoneOff className="text-white" size={iconSize} />
      </button>
    </div>
  );
}