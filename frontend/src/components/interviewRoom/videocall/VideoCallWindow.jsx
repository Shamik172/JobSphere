import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import socket from "../../../utils/socket";
import { useNavigate } from 'react-router-dom'
import VideoCallControls from './VideoCallControls'

const ICE_SERVERS = { iceServers: [{ urls: "stun:stun.l.google.com:19302"}] };

export default function VideoCallWindow({ roomId, userId }) {
  const [peers, setPeers] = useState({}); // mapping socketId -> RTCPeerConnection
  const [remoteStreams, setRemoteStreams] = useState({}); // mapping socketId -> MediaStream for UI
  const localVideoRef = useRef();
  const localStreamRef = useRef(new MediaStream()); // will hold actual tracks when available
  const navigate = useNavigate();

  // mutable refs to avoid stale closures
  const peersRef = useRef({}); // socketId -> RTCPeerConnection
  const pendingCandidatesRef = useRef({}); // socketId -> [candidate,...]
  const negotiationLock = useRef(false);


  // helper to add peer into refs + state
  const addPeerToState = (socketId, pc, meta = {}) => {
    peersRef.current[socketId] = pc;
    setPeers(prev => ({ ...prev, [socketId]: { pc, ...meta } }));
  };

  // inside VideoCallWindow component, after peers state is declared
  useEffect(() => {
    const peerIds = Object.keys(peers);
    console.log("Total peers in room (excluding you):", peerIds.length);
    console.log("Peer socket IDs:", peerIds);
  }, [peers]);


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

      // Handles camera/mic toggle renegotiation safely
      pc.onnegotiationneeded = async () => {
        if (negotiationLock.current || pc.signalingState !== "stable") {
          console.warn("Skipping renegotiation — busy or unstable");
          return;
        }
        try {
          negotiationLock.current = true;
          await new Promise((res) => setTimeout(res, 200)); // small debounce
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { to: targetSocketId, sdp: offer });
        } catch (err) {
          console.error("Error during renegotiation:", err);
        } finally {
          negotiationLock.current = false;
        }
      };


      // Optional: helps debug signaling flow
      pc.onsignalingstatechange = () => {
        console.log(`(${targetSocketId}) signalingState →`, pc.signalingState);
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
        let pc = peersRef.current[from];
        if (!pc) {
          setPeers((prev) => ({ ...prev, [from]: null }));
          pc = await createPeer(from, localStreamRef.current, false);
          addPeerToState(from, pc);
        }

        if (negotiationLock.current) {
          console.warn("Offer ignored — negotiation in progress");
          return;
        }

        if (pc.signalingState !== "stable") {
          console.warn(`Ignoring offer from ${from}, signalingState=${pc.signalingState}`);
          return;
        }

        negotiationLock.current = true;
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { to: from, sdp: answer });

        // drain queued ICE candidates...
        // ...
      } catch (err) {
        console.error("Error handling received offer:", err);
      } finally {
        negotiationLock.current = false;
      }
    };


    const handleReceiveAnswer = async ({ from, sdp }) => {
      try {
        const pc = peersRef.current[from];
        if (!pc) {
          console.warn("No RTCPeerConnection for", from);
          return;
        }

        if (negotiationLock.current) {
          console.warn("Answer ignored — negotiation in progress");
          return;
        }

        if (pc.signalingState !== "have-local-offer") {
          console.warn(`Ignoring answer from ${from} — state ${pc.signalingState}`);
          return;
        }

        negotiationLock.current = true;

        await pc.setRemoteDescription(new RTCSessionDescription(sdp));

        negotiationLock.current = false;
      } catch (err) {
        negotiationLock.current = false;
        console.error("Error handling received answer:", err);
      }
    };


    const handleNewICECandidateMsg = async ({ from, candidate }) => {
      try {
        const pc = peersRef.current[from];
        if (pc) {
          // If remote description not yet set, queue candidate
          if (!pc.remoteDescription || pc.remoteDescription.type === "") {
            console.warn(
              `Queueing ICE candidate from ${from} because remoteDescription is not set yet`
            );
            pendingCandidatesRef.current[from] = pendingCandidatesRef.current[from] || [];
            pendingCandidatesRef.current[from].push(candidate);
            return;
          }

          // Safe to add now
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          // No peer yet — queue candidate
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
      // Create an empty stream first (no permission asked yet)
      const stream = new MediaStream();
      localStreamRef.current = stream;

      // Assign empty stream to local video element (black preview)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Join the room immediately — you can still receive remote streams
      socket.emit("join-room", { roomId, userId });
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
      <div className="relative w-full h-full bg-gray-800 flex flex-col">
        {/* Video grid */}
        <div className="flex-1 overflow-hidden p-3 pb-28">
          <div className={`grid ${getGridCols(totalParticipants)} gap-2 h-full`}>
            {/* Local video */}
            <div className="relative w-full h-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <video
                ref={localVideoRef}
                muted
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 bg-black/60 text-white text-sm px-2 py-1 rounded">
                You
              </span>
            </div>

            {/* Remote videos */}
            {visiblePeers.map((id) => (
              <div
                key={id}
                className="relative w-full h-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center"
              >
                {remoteStreams[id] ? (
                  <video
                    id={`video-${id}`}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    ref={(el) => el && (el.srcObject = remoteStreams[id])}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-700">
                    <span className="text-4xl font-bold text-white">{getInitial(id)}</span>
                  </div>
                )}
                <span className="absolute bottom-2 left-2 bg-black/60 text-white text-sm px-2 py-1 rounded">
                  {id}
                </span>
              </div>
            ))}

            {overflowPeers.length > 0 && (
              <div className="relative flex items-center justify-center bg-gray-900 rounded-lg text-white text-lg font-semibold">
                +{overflowPeers.length} More
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="w-full bg-gray-900 border-t border-gray-700 p-3 flex justify-center fixed bottom-0 left-0 z-50">
          <div className="max-w-4xl w-full">
            <VideoCallControls
              localStreamRef={localStreamRef}
              localVideoRef={localVideoRef} // important
              onLeaveCall={leaveCall}
              participantsCount={totalParticipants}
            />
          </div>
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