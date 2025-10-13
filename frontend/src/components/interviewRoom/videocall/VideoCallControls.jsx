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
  localVideoRef,      // optional, to update preview after permission
  onLeaveCall,
  participantsCount,
}) {
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [permissionAsked, setPermissionAsked] = useState(false);

  // Request camera + mic permission (like Google Meet)
  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      // store the stream globally
      localStreamRef.current = stream;

      // attach to video element if provided
      if (localVideoRef?.current) {
        localVideoRef.current.srcObject = stream;
      }

      setMicOn(true);
      setCamOn(true);
      setPermissionAsked(true);

      console.log("✅ Permissions granted, media stream ready");
    } catch (err) {
      console.error("❌ Permission denied:", err);
      // alert(
      //   "Please allow camera and microphone access from your browser to join the call."
      // );
    }
  };

  // 🔹 Ask permission automatically once when joining
  useEffect(() => {
    if (!permissionAsked) {
      requestPermissions();
    }
  }, []);

  // 🎙 Toggle microphone
  const toggleMic = () => {
    const tracks = localStreamRef.current?.getAudioTracks();
    if (tracks?.length) {
      const newState = !tracks[0].enabled;
      tracks.forEach((t) => (t.enabled = newState));
      setMicOn(newState);
    } else {
      requestPermissions(); // if no tracks yet, ask permission again
    }
  };

  // 📷 Toggle camera
  const toggleCam = () => {
    const tracks = localStreamRef.current?.getVideoTracks();
    if (tracks?.length) {
      const newState = !tracks[0].enabled;
      tracks.forEach((t) => (t.enabled = newState));
      setCamOn(newState);
    } else {
      requestPermissions(); // if no video tracks yet
    }
  };

  // ✋ Raise hand
  const raiseHand = () => {
    alert("✋ Hand Raised");
  };

  // 🎛 Controls bar
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-6 bg-gray-900 bg-opacity-70 p-4 rounded-full shadow-lg z-50">
      {/* Mic toggle */}
      <button
        onClick={toggleMic}
        className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 focus:ring-2 focus:ring-white"
        title={micOn ? "Mute mic" : "Unmute mic"}
      >
        {micOn ? <Mic className="text-white" /> : <MicOff className="text-white" />}
      </button>

      {/* Camera toggle */}
      <button
        onClick={toggleCam}
        className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 focus:ring-2 focus:ring-white"
        title={camOn ? "Turn off camera" : "Turn on camera"}
      >
        {camOn ? <Video className="text-white" /> : <VideoOff className="text-white" />}
      </button>

      {/* Raise hand */}
      <button
        onClick={raiseHand}
        className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 focus:ring-2 focus:ring-yellow-400"
        title="Raise hand"
      >
        <Hand className="text-yellow-400" />
      </button>

      {/* Participants count */}
      <div
        className="p-3 rounded-full bg-gray-700 text-white flex items-center gap-2"
        title="Participants"
      >
        <Users size={20} />
        <span>{participantsCount}</span>
      </div>

      {/* Leave call */}
      <button
        onClick={onLeaveCall}
        className="p-3 rounded-full bg-red-600 hover:bg-red-500 focus:ring-2 focus:ring-white"
        title="Leave call"
      >
        <PhoneOff className="text-white" />
      </button>
    </div>
  );
}
