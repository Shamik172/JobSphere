import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import socket from "../../../utils/socket";
import { useNavigate } from 'react-router-dom'

const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    }
  ]
};

export default function VideoCallWindow({ roomId, userId }) {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [peers, setPeers] = useState({}); // mapping socketId -> RTCPeerConnection
  const [remoteStreams, setRemoteStreams] = useState({}); // mapping socketId -> MediaStream for UI
  const localVideoRef = useRef();
  const localStreamRef = useRef(new MediaStream()); // will hold actual tracks when available
  const navigate = useNavigate();

  // mutable refs to avoid stale closures
  const peersRef = useRef({}); // socketId -> RTCPeerConnection
  const pendingCandidatesRef = useRef({}); // socketId -> [candidate,...]

  // helper to add peer into refs + state
  const addPeerToState = (socketId, pc, meta = {}) => {
    peersRef.current[socketId] = pc;
    setPeers(prev => ({ ...prev, [socketId]: { pc, ...meta } }));
  };

  useEffect(() => {
    let mounted = true;

    // createPeer is defined inside useEffect so it closes over socket, refs, setRemoteStreams
    const createPeer = async (targetSocketId, stream, initiator = false) => {
      //Every time a new user joins the room, create a RTCPeerConnection object for that user
      const pc = new RTCPeerConnection(ICE_SERVERS);

      // add existing local tracks to the peer
      try {
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      } catch (e) {
        console.warn("Failed to add tracks to RTCPeerConnection:", e);
      }

      // send ICE candidates to the target socket
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { to: targetSocketId, candidate: event.candidate });
        }
      };

      // when remote track(s) arrive, publish them to UI
      pc.ontrack = (event) => {
        // prefer the first stream
        const remoteStream = event.streams && event.streams[0];
        if (remoteStream) {
          setRemoteStreams((prev) => ({ ...prev, [targetSocketId]: remoteStream }));
        }
      };

      // drain any pending ICE candidates for this peer
      const drainPending = async () => {
        const list = pendingCandidatesRef.current[targetSocketId];
        if (list && list.length) {
          for (const cand of list) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch (err) {
              console.warn("Error adding queued ICE candidate", err);
            }
          }
          delete pendingCandidatesRef.current[targetSocketId];
        }
      };

      // If initiator: create offer now
      if (initiator) {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          // send offer to target (server will forward to that socket)
          socket.emit("offer", { to: targetSocketId, sdp: offer });
        } catch (err) {
          console.error("Error creating/sending offer", err);
        }
      }

      // drain any pending candidates (if any arrived earlier)
      await drainPending();

      return pc;
    };

    // buffer handlers declared inside effect so same function refs are used for off()
    const handleExistingUsers = async (existingSocketIds) => {
      // existingSocketIds are socket IDs already in room (the newcomer should create offers to them)
      for (const otherSocketId of existingSocketIds) {
        // create peer as initiator
        try {
          // mark peer in state immediately (so UI can render placeholder video element)
          setPeers((prev) => ({ ...prev, [otherSocketId]: null }));
          const pc = await createPeer(otherSocketId, localStreamRef.current, true);
          addPeerToState(otherSocketId, pc);
        } catch (err) {
          console.error("Failed to create initiator peer for", otherSocketId, err);
        }
      }
    };

    const handleUserConnected = async (otherSocketId) => {
      // someone joined after us — we should prepare a peer (non-initiator) and wait for their offer
      try {
        // prepare placeholder in UI
        setPeers((prev) => ({ ...prev, [otherSocketId]: null }));
        const pc = await createPeer(otherSocketId, localStreamRef.current, false);
        addPeerToState(otherSocketId, pc);
      } catch (err) {
        console.error("Failed to create non-initiator peer for", otherSocketId, err);
      }
    };

    // Bob's perspective
    // after receiving intiator offer now this system sets initiator as remotedescription and it owns as localdescription and answers with it's icecandidate and sdp 
    const handleReceiveOffer = async ({ from, sdp }) => {
      try {
        // If we don't have a peer yet for this 'from', create one (non-initiator)
        // Check if Bob already created a RTCPeerConnection for from (Alice). If yes, reuse it — you might have created it earlier when preparing for incoming users.
        let pc = peersRef.current[from];
        if (!pc) {
          // create placeholder & pc
          setPeers((prev) => ({ ...prev, [from]: null }));
          pc = await createPeer(from, localStreamRef.current, false); // false as not gonna create offer
          addPeerToState(from, pc);
        }

        // Tells the browser: “This is the remote side’s description (Alice’s offer).”
        // Internally the browser:
        // Parses codecs and media directions (sendrecv/sendonly).
        // Prepares to match local tracks with remote expectations.
        // May start ICE candidate gathering if not already started.
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer(); //Browser creates an SDP answer that describes what Bob will send and accept (matching capabilities).
        await pc.setLocalDescription(answer); //Sets Bob’s local description — this also usually triggers the browser to begin gathering ICE candidates (if ICE gathering hadn’t started).

        // send answer back to the offerer
        socket.emit("answer", { to: from, sdp: answer });

        // drain any queued ICE candidates for this peer (if not already drained in createPeer)
        const queued = pendingCandidatesRef.current[from];
        if (queued && queued.length) {
          for (const cand of queued) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch (err) {
              console.warn("Error adding queued ICE candidate after answer:", err);
            }
          }
          delete pendingCandidatesRef.current[from];
        }
      } catch (err) {
        console.error("Error handling received offer:", err);
      }
    };

    const handleReceiveAnswer = async ({ from, sdp }) => {
      try {
        const pc = peersRef.current[from];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        } else {
          // no pc yet? queue candidate / or log
          console.warn("Received answer but no RTCPeerConnection found for", from);
        }
      } catch (err) {
        console.error("Error handling received answer:", err);
      }
    };

    const handleNewICECandidateMsg = async ({ from, candidate }) => {
      try {
        const pc = peersRef.current[from];
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          // peer not created yet -> queue candidate
          pendingCandidatesRef.current[from] = pendingCandidatesRef.current[from] || [];
          pendingCandidatesRef.current[from].push(candidate);
        }
      } catch (err) {
        console.error("Error adding received ICE candidate:", err);
      }
    };

    const handleUserDisconnected = (otherSocketId) => {
      // close peer and remove from state
      const pc = peersRef.current[otherSocketId];
      if (pc) {
        try {
          pc.close();
        } catch (e) { }
      }
      delete peersRef.current[otherSocketId];
      delete pendingCandidatesRef.current[otherSocketId];
      setPeers((prev) => {
        const copy = { ...prev };
        delete copy[otherSocketId];
        return copy;
      });
      setRemoteStreams((prev) => {
        const copy = { ...prev };
        delete copy[otherSocketId];
        return copy;
      });
    };

    // register socket listeners BEFORE emitting join-room so we don't miss events
    socket.on("existing-users", handleExistingUsers);
    socket.on("user-connected", handleUserConnected);
    socket.on("offer", handleReceiveOffer);
    socket.on("answer", handleReceiveAnswer);
    socket.on("ice-candidate", handleNewICECandidateMsg);
    socket.on("user-disconnected", handleUserDisconnected);

    // main init: get local media and emit join-room
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        if (!mounted) {
          // component was unmounted while waiting for permission
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // send join-room after we have media & listeners set up
        socket.emit("join-room", { roomId, userId });
      } catch (err) {
        console.error("getUserMedia error:", err);
        // handle UI fallback: show message / disable join etc.
      }
    };

    initMedia();

    return () => {
      mounted = false;

      // close all peer connections
      Object.values(peersRef.current).forEach((pc) => {
        try { pc && pc.close(); } catch (e) { }
      });
      peersRef.current = {};

      // remove socket handlers (only those we registered)
      socket.off("existing-users", handleExistingUsers);
      socket.off("user-connected", handleUserConnected);
      socket.off("offer", handleReceiveOffer);
      socket.off("answer", handleReceiveAnswer);
      socket.off("ice-candidate", handleNewICECandidateMsg);
      socket.off("user-disconnected", handleUserDisconnected);

      // stop local media
      try {
        localStreamRef.current?.getTracks()?.forEach((t) => t.stop());
      } catch (e) { }

      // clear UI state
      setPeers({});
      setRemoteStreams({});
      pendingCandidatesRef.current = {};
    };
    // run effect again if roomId/userId change
  }, [roomId, userId]);

  // toggle mic (prefer toggle enabled over stopping device)
  const toggleMic = async () => {
    try {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length) {
        // simply enable/disable existing track (no permission prompts)
        audioTracks.forEach((t) => (t.enabled = !t.enabled));
        setMicOn(audioTracks[0].enabled);
      } else {
        // no track present (was removed) -> request new audio, add and replace senders
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const newTrack = audioStream.getAudioTracks()[0];
        localStreamRef.current.addTrack(newTrack);
        Object.values(peersRef.current).forEach((peer) => {
          const sender = peer.getSenders().find((s) => s.track && s.track.kind === "audio");
          if (sender) {
            sender.replaceTrack(newTrack);
          } else {
            peer.addTrack(newTrack, localStreamRef.current);
          }
        });
        setMicOn(true);
      }
    } catch (err) {
      console.error("toggleMic error:", err);
    }
  };

  // toggle camera
  const toggleCam = async () => {
    try {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length) {
        // toggle enabled (disable camera preview & stop sending)
        videoTracks.forEach((t) => (t.enabled = !t.enabled));
        const isOn = videoTracks[0].enabled;
        setCamOn(isOn);
        if (!isOn) {
          // if camera disabled, keep preview as audio-only stream
          if (localVideoRef.current) {
            const audioOnly = new MediaStream(localStreamRef.current.getAudioTracks());
            localVideoRef.current.srcObject = audioOnly;
          }
        } else {
          // enable camera preview using current stream object
          if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
        }
      } else {
        // no video track -> request camera
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTrack = videoStream.getVideoTracks()[0];
        localStreamRef.current.addTrack(videoTrack);

        // replace or add senders on all peers
        Object.values(peersRef.current).forEach((peer) => {
          const sender = peer.getSenders().find((s) => s.track && s.track.kind === "video");
          if (sender) sender.replaceTrack(videoTrack);
          else peer.addTrack(videoTrack, localStreamRef.current);
        });

        // update preview
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
        setCamOn(true);
      }
    } catch (err) {
      console.error("toggleCam error:", err);
    }
  };

  const leaveCall = () => {
    // stop local tracks
    try {
      localStreamRef.current?.getTracks()?.forEach((t) => t.stop());
    } catch (e) { }

    // close peers
    Object.values(peersRef.current).forEach((pc) => {
      try { 
        pc && pc.close(); 
      } catch (e) { }
    });

    // disconnect socket
    try {
      socket.disconnect();
    } catch (e) { }

    navigate("/"); // redirect home
    // reload to fully reset UI (optional)
    // window.location.reload();
  };

  // number of participants (local + remote)
  const totalParticipants = Object.keys(peers).length + 1;

  // decide who to show and who goes into "More"
  const MAX_GRID = 12;
  const peerIds = Object.keys(peers);
  const visiblePeers = peerIds.slice(0, MAX_GRID - 1);
  const overflowPeers = peerIds.slice(MAX_GRID - 1);

  // utility to get initial
  function getInitial(nameOrId) {
    return nameOrId?.charAt(0)?.toUpperCase() || "?";
  }

  return (
    <div className="relative w-full h-full bg-gray-800">
      {/* Video grid */}
      <div className={`grid ${getGridCols(totalParticipants)} gap-2 p-2 h-full`}>
        {/* Local video */}
        <div className="relative w-full h-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
          {camOn ? (
            <video
              ref={localVideoRef}
              muted
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-700">
              <span className="text-4xl font-bold text-white">
                {getInitial("You")}
              </span>
            </div>
          )}
          <span className="absolute bottom-2 left-2 bg-black/60 text-white text-sm px-2 py-1 rounded">
            You
          </span>
        </div>

        {/* Remote videos (only visible peers) */}
        {visiblePeers.map((id) => {
          const peer = peers[id]; // you can store camOn/micOn per peer in your state
          const camEnabled = peer?.camOn ?? true; // fallback true if not tracked
          return (
            <div
              key={id}
              className="relative w-full h-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center"
            >
              {camEnabled && remoteStreams[id] ? (
                <video
                  id={`video-${id}`}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  ref={(el) => {
                    if (el && remoteStreams[id]) {
                      el.srcObject = remoteStreams[id];
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-700">
                  <span className="text-4xl font-bold text-white">
                    {getInitial(id)}
                  </span>
                </div>
              )}
              <span className="absolute bottom-2 left-2 bg-black/60 text-white text-sm px-2 py-1 rounded">
                {id}
              </span>
            </div>
          );
        })}

        {/* More box if too many */}
        {overflowPeers.length > 0 && (
          <div className="relative flex items-center justify-center bg-gray-900 rounded-lg text-white text-lg font-semibold">
            +{overflowPeers.length} More
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-6 bg-gray-900 bg-opacity-70 p-4 rounded-full shadow-lg">
        <button
          onClick={toggleMic}
          className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"
        >
          {micOn ? <Mic className="text-white" /> : <MicOff className="text-white" />}
        </button>
        <button
          onClick={toggleCam}
          className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"
        >
          {camOn ? <Video className="text-white" /> : <VideoOff className="text-white" />}
        </button>
        <button
          onClick={leaveCall}
          className="p-3 rounded-full bg-red-600 hover:bg-red-500"
        >
          <PhoneOff className="text-white" />
        </button>
      </div>
    </div>
  );
}

// helper used in render (keep outside component)
function getGridCols(count) {
  if (count === 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  if (count <= 4) return "grid-cols-2"; // 2x2 grid for 3–4 users
  if (count <= 6) return "grid-cols-3"; // 3x2 for 5–6 users
  if (count <= 9) return "grid-cols-3"; // 3x3 for 7–9 users
  if (count <= 12) return "grid-cols-4"; // 4x3 for up to 12
  return "grid-cols-4"; // keep 4-cols for overflow (rest go to "More")
}