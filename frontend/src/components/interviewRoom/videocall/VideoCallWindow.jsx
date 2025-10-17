import React, { useState, useEffect, useRef, useCallback } from "react";
import socket from "../../../utils/socket";
import { useNavigate } from 'react-router-dom';
import VideoCallControls from './VideoCallControls';

// Configuration for STUN servers - consider adding TURN servers for production
const ICE_SERVERS = { 
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    // Add TURN servers for production
  ] 
};

// Helper for grid layout based on participant count
function getGridCols(count) {
  if (count === 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  if (count <= 4) return "grid-cols-2"; // 2x2 grid for 3–4 users
  if (count <= 6) return "grid-cols-3"; // 3x2 for 5–6 users
  if (count <= 9) return "grid-cols-3"; // 3x3 for 7–9 users
  if (count <= 12) return "grid-cols-4"; // 4x3 for up to 12
  return "grid-cols-4"; // keep 4-cols for overflow (rest go to "More")
}

export default function VideoCallWindow({ roomId, userId }) {
  const [peers, setPeers] = useState({}); // mapping socketId -> RTCPeerConnection info
  const [remoteStreams, setRemoteStreams] = useState({}); // mapping socketId -> MediaStream for UI
  const [isHost, setIsHost] = useState(false);
  const [hostId, setHostId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [mediaState, setMediaState] = useState({ audio: false, video: false });
  const [socketId, setSocketId] = useState(null);

  // Refs
  const localVideoRef = useRef();
  const localStreamRef = useRef(null); // will be initialized with actual stream after permissions
  const navigate = useNavigate();

  // Mutable refs to avoid stale closures
  const peersRef = useRef({}); // socketId -> RTCPeerConnection
  const pendingCandidatesRef = useRef({}); // socketId -> [candidate,...]
  const negotiationLock = useRef({}); // socketId -> boolean
  const hostIdRef = useRef(null);
  const reconnectTimeoutsRef = useRef({});
  const socketConnectedRef = useRef(false);
  const roomJoinedRef = useRef(false);
  const socketIdRef = useRef(null);

  // Track socket ID
  useEffect(() => {
    if (socket && socket.id) {
      setSocketId(socket.id);
      socketIdRef.current = socket.id;
      console.log("Current socket ID:", socket.id);
    }
  }, []);

  // Keep hostId ref updated
  useEffect(() => {
    hostIdRef.current = hostId;
    console.log(`Host ID updated: ${hostId}`);
  }, [hostId]);

  // Track connection status changes
  useEffect(() => {
    const statusEntries = Object.entries(connectionStatus);
    if (statusEntries.length > 0) {
      console.log("Connection status updated:", 
        statusEntries.map(([id, status]) => `${id}: ${status}`).join(', ')
      );
    }
  }, [connectionStatus]);

  // Handle media state changes from controls
  const handleMediaStateChange = useCallback((audio, video) => {
    setMediaState({ audio, video });
    
    // If we already have peer connections, we need to renegotiate
    Object.entries(peersRef.current).forEach(([socketId, pc]) => {
      if (pc && pc.signalingState === 'stable') {
        // This will trigger onnegotiationneeded event
        try {
          const senders = pc.getSenders();
          senders.forEach(sender => {
            if (sender.track) {
              if (sender.track.kind === 'audio') {
                sender.track.enabled = audio;
              } else if (sender.track.kind === 'video') {
                sender.track.enabled = video;
              }
            }
          });
        } catch (e) {
          console.warn(`Failed to update tracks for peer ${socketId}:`, e);
        }
      }
    });
  }, []);

  // Add peer to state helper
  const addPeerToState = useCallback((targetSocketId, pc, meta = {}) => {
    // Prevent self-connections
    if (targetSocketId === socket.id) {
      console.warn("Preventing self-connection!");
      return;
    }
    
    peersRef.current[targetSocketId] = pc;
    
    setPeers(prev => {
      // Don't update if we're just replacing with the same PC
      if (prev[targetSocketId]?.pc === pc) return prev;
      return { ...prev, [targetSocketId]: { pc, ...meta } };
    });
    
    // Initialize connection status for this peer
    setConnectionStatus(prev => ({
      ...prev,
      [targetSocketId]: 'connecting'
    }));

    // Set up connection state monitoring
    pc.onconnectionstatechange = () => {
      console.log(`Peer ${targetSocketId} connection state: ${pc.connectionState}`);
      setConnectionStatus(prev => ({
        ...prev,
        [targetSocketId]: pc.connectionState
      }));

      // Handle disconnections
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        // Clear any existing reconnect timeout
        if (reconnectTimeoutsRef.current[targetSocketId]) {
          clearTimeout(reconnectTimeoutsRef.current[targetSocketId]);
        }

        // Try to reconnect after a delay
        reconnectTimeoutsRef.current[targetSocketId] = setTimeout(() => {
          // Only attempt reconnect if socket is still connected
          if (socketConnectedRef.current && !isHost && hostId === targetSocketId) {
            console.log(`Attempting to reconnect to host ${targetSocketId}...`);
            cleanupPeerConnection(targetSocketId);
            createPeerConnection(targetSocketId, true);
          }
        }, 2000);
      }
    };
  }, [isHost, hostId]);

  // Create or get peer connection
  const createPeerConnection = useCallback((targetSocketId, initiator = false) => {
    // Prevent self-connections
    if (targetSocketId === socket.id) {
      console.warn("Prevented creating connection to self!");
      return null;
    }

    console.log(`Creating ${initiator ? 'initiator' : 'receiver'} peer connection to ${targetSocketId}`);

    // Check if we already have a connection
    let pc = peersRef.current[targetSocketId];
    
    // If existing connection is in a bad state, close it
    if (pc) {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        cleanupPeerConnection(targetSocketId);
        pc = null;
      } else {
        // Return existing connection if it's in a good state
        return pc;
      }
    }
    
    // Create new peer connection
    pc = new RTCPeerConnection(ICE_SERVERS);
    
    // Add local stream tracks if available
    if (localStreamRef.current) {
      try {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current);
          console.log(`Added local ${track.kind} track to peer ${targetSocketId}`);
        });
      } catch (e) {
        console.warn(`Failed to add tracks to connection with ${targetSocketId}:`, e);
      }
    }
    
    // Set up ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { to: targetSocketId, candidate: event.candidate });
      }
    };
    
    // Set up remote stream handling
    pc.ontrack = (event) => {
      const remoteStream = event.streams && event.streams[0];
      if (remoteStream) {
        console.log(`Remote stream received from ${targetSocketId}:`, {
          audioTracks: remoteStream.getAudioTracks().length,
          videoTracks: remoteStream.getVideoTracks().length,
          trackId: event.track.id,
          trackKind: event.track.kind
        });
        
        setRemoteStreams(prev => {
          // Important: Only update if stream is actually different
          if (prev[targetSocketId] === remoteStream) return prev;
          return { ...prev, [targetSocketId]: remoteStream };
        });
      }
    };
    
    // Set up negotiation handling
    pc.onnegotiationneeded = async () => {
      if (pc.signalingState !== "stable" || negotiationLock.current[targetSocketId]) {
        console.log(`Skipping negotiation with ${targetSocketId} - busy or unstable`);
        return;
      }
      
      if (initiator || isHost) {
        try {
          negotiationLock.current[targetSocketId] = true;
          console.log(`Creating offer for ${targetSocketId}`);
          
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          
          // Generate a unique fingerprint to detect duplicates
          const offerFingerprint = offer.sdp.substring(0, 100);
          pc.lastOfferFingerprint = offerFingerprint;
          
          socket.emit("offer", { 
            to: targetSocketId, 
            sdp: offer 
          });
        } catch (err) {
          console.error(`Error creating offer for ${targetSocketId}:`, err);
        } finally {
          // Release lock after a short delay to prevent rapid renegotiations
          setTimeout(() => {
            negotiationLock.current[targetSocketId] = false;
          }, 500);
        }
      }
    };
    
    // Debug helpers
    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state with ${targetSocketId}: ${pc.iceConnectionState}`);
    };
    
    pc.onsignalingstatechange = () => {
      console.log(`Signaling state with ${targetSocketId}: ${pc.signalingState}`);
    };
    
    // Store and return the new connection
    addPeerToState(targetSocketId, pc, { initiator });
    return pc;
  }, [addPeerToState, isHost]);

  // Cleanup peer connection helper
  const cleanupPeerConnection = useCallback((socketId) => {
    const pc = peersRef.current[socketId];
    if (pc) {
      try {
        // Remove event listeners to prevent memory leaks
        pc.ontrack = null;
        pc.onicecandidate = null;
        pc.onnegotiationneeded = null;
        pc.oniceconnectionstatechange = null;
        pc.onsignalingstatechange = null;
        pc.onconnectionstatechange = null;
        
        // Close the connection
        pc.close();
        
        console.log(`Closed peer connection with ${socketId}`);
      } catch (e) {
        console.warn(`Error closing connection with ${socketId}:`, e);
      }
      
      // Remove from our refs and state
      delete peersRef.current[socketId];
      delete pendingCandidatesRef.current[socketId];
      
      setPeers(prev => {
        const newPeers = { ...prev };
        delete newPeers[socketId];
        return newPeers;
      });
      
      setRemoteStreams(prev => {
        const newStreams = { ...prev };
        delete newStreams[socketId];
        return newStreams;
      });
      
      setConnectionStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[socketId];
        return newStatus;
      });
      
      // Clean up any reconnection timers
      if (reconnectTimeoutsRef.current[socketId]) {
        clearTimeout(reconnectTimeoutsRef.current[socketId]);
        delete reconnectTimeoutsRef.current[socketId];
      }
    }
  }, []);

  // Process ICE candidates (can be called before or after connection setup)
  const processIceCandidates = useCallback(async (socketId) => {
    // Prevent self-processing
    if (socketId === socket.id) return;
    
    const pc = peersRef.current[socketId];
    const candidates = pendingCandidatesRef.current[socketId];
    
    if (pc && candidates && candidates.length) {
      console.log(`Processing ${candidates.length} queued ICE candidates for ${socketId}`);
      
      // Process in a stable state if possible
      if (pc.remoteDescription && pc.remoteDescription.type) {
        for (const candidate of candidates) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.warn(`Error adding ICE candidate for ${socketId}:`, err);
          }
        }
        
        // Clear processed candidates
        delete pendingCandidatesRef.current[socketId];
      } else {
        console.log(`Keeping ICE candidates queued for ${socketId} - no remote description yet`);
      }
    }
  }, []);

  // Handle socket events in one main effect
  useEffect(() => {
    // Make sure we have fresh state
    setPeers({});
    setRemoteStreams({});
    setConnectionStatus({});
    
    // Mark socket as connected
    socketConnectedRef.current = true;
    setSocketId(socket.id);
    socketIdRef.current = socket.id;
    console.log("Socket connected with ID:", socket.id);
    
    // Socket event handlers
    const handleHostAssigned = ({ isHost: assigned }) => {
      console.log(`You are assigned as host: ${assigned}`);
      setIsHost(assigned);
      
      if (assigned) {
        setHostId(socket.id);
        hostIdRef.current = socket.id;
      }
    };

    const handleHostInfo = ({ hostId: receivedHostId }) => {
      console.log(`Received host info: ${receivedHostId}`);
      
      setHostId(receivedHostId);
      hostIdRef.current = receivedHostId;
      setIsHost(socket.id === receivedHostId);
      
      // If we're a guest and this is the host, establish a connection
      // But prevent self-connection
      if (!isHost && socket.id !== receivedHostId && !peersRef.current[receivedHostId]) {
        console.log(`Creating connection to host ${receivedHostId}`);
        createPeerConnection(receivedHostId, true); // Guest initiates with host
      }
    };
    
    const handleExistingUsers = async (existingSocketIds) => {
      console.log(`Received existing users: ${existingSocketIds.join(', ')}`);
      
      // Filter out our own ID to prevent self-connections
      const filteredIds = existingSocketIds.filter(id => id !== socket.id);
      console.log(`Filtered existing users (excluding self): ${filteredIds.join(', ')}`);
      
      // Skip if we're the host - guests will connect to us
      if (isHost) return;
      
      // Only guests need to handle this - connect to host only
      if (!isHost && filteredIds.length) {
        const hostSocketId = filteredIds[0];
        
        // Only create connection if we don't already have one and it's not self
        if (hostSocketId !== socket.id && !peersRef.current[hostSocketId]) {
          createPeerConnection(hostSocketId, true);
        }
      }
    };
    
    const handleUserConnected = (otherSocketId) => {
      console.log(`User connected: ${otherSocketId}`);
      
      // Prevent self-connection
      if (otherSocketId === socket.id) {
        console.warn("Ignoring self-connection event");
        return;
      }
      
      // Only host initiates connections with new guests
      if (isHost) {
        createPeerConnection(otherSocketId, true);
      }
      // Guests don't initiate with anyone except the host
    };

    const handleReceiveOffer = async ({ from, sdp }) => {
      console.log(`Received offer from: ${from}`);
      
      // Prevent self-offers
      if (from === socket.id) {
        console.warn("Ignoring offer from self");
        return;
      }
      
      // Add SDP fingerprinting to detect duplicate offers
      const sdpFingerprint = sdp.sdp.substring(0, 100);
      const pc = peersRef.current[from];
      
      // Reject duplicate offers with same fingerprint
      if (pc && pc.lastOfferFingerprint === sdpFingerprint) {
        console.log(`Ignoring duplicate offer from ${from}`);
        return;
      }
      
      // Validate sender: either we're host and it's from a guest, or we're guest and it's from the host
      const isValidSender = (isHost && from !== socket.id) || (!isHost && from === hostIdRef.current);
      
      if (!isValidSender) {
        console.warn(`Ignoring offer from invalid sender: ${from}`);
        return;
      }
      
      try {
        // Get or create peer connection (don't initiate as we're answering)
        const peerConnection = createPeerConnection(from, false);
        
        // Skip if we couldn't create a connection (e.g., self-connection)
        if (!peerConnection) {
          return;
        }
        
        // Skip if we're already processing a negotiation
        if (negotiationLock.current[from]) {
          console.warn(`Offer ignored - negotiation in progress with ${from}`);
          return;
        }
        
        negotiationLock.current[from] = true;
        
        // Store fingerprint for deduplication
        peerConnection.lastOfferFingerprint = sdpFingerprint;
        
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
          console.log(`Set remote offer from ${from}`);
          
          // Process any queued ICE candidates
          await processIceCandidates(from);
          
          // Create and send answer
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          
          // Generate fingerprint for the answer
          const answerFingerprint = answer.sdp.substring(0, 100);
          peerConnection.lastAnswerFingerprint = answerFingerprint;
          
          socket.emit("answer", { to: from, sdp: answer });
          console.log(`Sent answer to ${from}`);
        } finally {
          // Release lock after a delay to prevent rapid renegotiation
          setTimeout(() => {
            negotiationLock.current[from] = false;
          }, 500);
        }
      } catch (err) {
        negotiationLock.current[from] = false;
        console.error(`Error handling offer from ${from}:`, err);
        
        // Clean up failed connection to allow retry
        cleanupPeerConnection(from);
      }
    };

    const handleReceiveAnswer = async ({ from, sdp }) => {
      console.log(`Received answer from: ${from}`);
      
      // Prevent self-answers
      if (from === socket.id) {
        console.warn("Ignoring answer from self");
        return;
      }
      
      // Add answer fingerprinting to prevent duplicates
      const sdpFingerprint = sdp.sdp.substring(0, 100);
      const pc = peersRef.current[from];
      
      // Ignore if we don't have a connection or if it's a duplicate
      if (!pc) {
        console.warn(`No connection found for ${from}, ignoring answer`);
        return;
      }
      
      if (pc.lastAnswerFingerprint === sdpFingerprint) {
        console.log(`Ignoring duplicate answer from ${from}`);
        return;
      }
      
      // Store fingerprint for deduplication
      pc.lastAnswerFingerprint = sdpFingerprint;
      
      // Check if connection is in a state to accept the answer
      if (pc.signalingState !== "have-local-offer") {
        console.warn(`Cannot apply answer from ${from} - connection not in 'have-local-offer' state (${pc.signalingState})`);
        
        // If we're in stable state, we might have already applied this answer
        if (pc.signalingState === "stable") {
          console.log(`Connection with ${from} already stable, ignoring answer`);
          return;
        }
        
        // If we're in a bad state, recreate the connection
        cleanupPeerConnection(from);
        createPeerConnection(from, isHost);
        return;
      }
      
      try {
        // Apply the answer
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        console.log(`Successfully set remote answer from ${from}`);
        
        // Process any pending ICE candidates now
        await processIceCandidates(from);
      } catch (err) {
        console.error(`Error setting remote answer from ${from}:`, err);
        
        // Recovery: If the answer can't be applied, recreate the connection
        cleanupPeerConnection(from);
        createPeerConnection(from, isHost);
      }
    };

    const handleIceCandidate = async ({ from, candidate }) => {
      console.log(`Received ICE candidate from: ${from}`);
      
      // Prevent self-ICE candidates
      if (from === socket.id) {
        console.warn("Ignoring ICE candidate from self");
        return;
      }
      
      // Initialize candidate queue if it doesn't exist
      pendingCandidatesRef.current[from] = pendingCandidatesRef.current[from] || [];
      pendingCandidatesRef.current[from].push(candidate);
      
      // Try to process immediately if we have a connection
      const pc = peersRef.current[from];
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          
          // Remove from queue
          pendingCandidatesRef.current[from] = 
            pendingCandidatesRef.current[from].filter(c => c !== candidate);
          
          // Clean up empty arrays
          if (pendingCandidatesRef.current[from].length === 0) {
            delete pendingCandidatesRef.current[from];
          }
        } catch (err) {
          console.warn(`Error adding ICE candidate from ${from}:`, err);
        }
      }
    };

    const handleUserDisconnected = (otherSocketId) => {
      console.log(`User disconnected: ${otherSocketId}`);
      
      // Clean up connection
      cleanupPeerConnection(otherSocketId);
      
      // If the host disconnected and we're still here, wait for new host assignment
      if (otherSocketId === hostIdRef.current && !isHost) {
        console.log("Host disconnected, waiting for new host assignment");
        setHostId(null);
        hostIdRef.current = null;
      }
    };
    
    // Register socket event handlers
    socket.on("host-assigned", handleHostAssigned);
    socket.on("host-info", handleHostInfo);
    socket.on("existing-users", handleExistingUsers);
    socket.on("user-connected", handleUserConnected);
    socket.on("offer", handleReceiveOffer);
    socket.on("answer", handleReceiveAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("user-disconnected", handleUserDisconnected);
    
    // Track socket reconnections
    socket.on("connect", () => {
      console.log("Socket reconnected with new ID:", socket.id);
      setSocketId(socket.id);
      socketIdRef.current = socket.id;
      socketConnectedRef.current = true;
      
      // Rejoin the room if we were previously in it
      if (roomJoinedRef.current) {
        console.log("Rejoining room after reconnection");
        socket.emit("join-room", { roomId, userId });
      }
    });
    
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      socketConnectedRef.current = false;
    });
    
    // Emit join-room to join the room
    socket.emit("join-room", { roomId, userId });
    roomJoinedRef.current = true;
    
    // Log the total number of peers in the room every second for debugging
    const debugInterval = setInterval(() => {
      const peerCount = Object.keys(peersRef.current).length;
      if (peerCount > 0) {
        console.log(`Total peers in room (excluding you): ${peerCount}`);
        console.log(`Peer socket IDs: ${JSON.stringify(Object.keys(peersRef.current))}`);
      }
    }, 5000);
    
    // Cleanup on unmount
    return () => {
      // Mark socket as disconnected
      socketConnectedRef.current = false;
      roomJoinedRef.current = false;
      
      // Clean up all peer connections
      Object.keys(peersRef.current).forEach(cleanupPeerConnection);
      
      // Clear all timers
      Object.values(reconnectTimeoutsRef.current).forEach(clearTimeout);
      reconnectTimeoutsRef.current = {};
      
      // Remove socket event handlers
      socket.off("host-assigned", handleHostAssigned);
      socket.off("host-info", handleHostInfo);
      socket.off("existing-users", handleExistingUsers);
      socket.off("user-connected", handleUserConnected);
      socket.off("offer", handleReceiveOffer);
      socket.off("answer", handleReceiveAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("user-disconnected", handleUserDisconnected);
      socket.off("connect");
      socket.off("disconnect");
      
      clearInterval(debugInterval);
    };
  }, [roomId, userId, isHost, createPeerConnection, cleanupPeerConnection, processIceCandidates]);

  // Handle leaving the call
  const leaveCall = useCallback(() => {
    console.log("Leaving call...");
    
    // Stop local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Clean up all peer connections
    Object.keys(peersRef.current).forEach(cleanupPeerConnection);
    
    // Disconnect socket
    socket.disconnect();
    
    // Navigate away
    navigate("/");
  }, [navigate, cleanupPeerConnection]);

  // Calculate participant information for UI
  const totalParticipants = Object.keys(peers).length + 1;
  const MAX_GRID = 12;
  const peerIds = Object.keys(peers);
  const visiblePeers = peerIds.slice(0, MAX_GRID - 1);
  const overflowPeers = peerIds.slice(MAX_GRID - 1);

  // Get initial from ID helper
  const getInitial = (nameOrId) => nameOrId?.charAt(0)?.toUpperCase() || "?";

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
            <div className="absolute top-2 right-2 flex space-x-2">
              {mediaState.audio ? 
                <span className="bg-green-500/70 text-white text-xs px-1.5 py-0.5 rounded">Mic On</span> : 
                <span className="bg-red-500/70 text-white text-xs px-1.5 py-0.5 rounded">Mic Off</span>
              }
              {mediaState.video ? 
                <span className="bg-green-500/70 text-white text-xs px-1.5 py-0.5 rounded">Cam On</span> : 
                <span className="bg-red-500/70 text-white text-xs px-1.5 py-0.5 rounded">Cam Off</span>
              }
            </div>
            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-sm px-2 py-1 rounded">
              You {isHost ? "(Host)" : ""} - {socketId?.slice(0,8)}
            </span>
          </div>

          {/* Remote videos */}
          {visiblePeers.map((id) => (
            <div
              key={id}
              className="relative w-full h-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center"
            >
              {remoteStreams[id] ? (
                <>
                  <video
                    id={`video-${id}`}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    ref={(el) => {
                      if (el && el.srcObject !== remoteStreams[id]) {
                        console.log(`Setting srcObject for peer ${id}`);
                        el.srcObject = remoteStreams[id];
                        
                        // Play explicitly with better error handling
                        el.play().catch(err => {
                          console.warn(`Error playing remote video: ${err.message}`);
                          
                          // Try again with user interaction
                          const retryPlay = () => {
                            el.play().catch(e => console.error("Retry play failed:", e));
                            document.removeEventListener('click', retryPlay);
                          };
                          document.addEventListener('click', retryPlay, { once: true });
                        });
                        
                        // Debug track info
                        const videoTracks = remoteStreams[id].getVideoTracks();
                        const audioTracks = remoteStreams[id].getAudioTracks();
                        console.log(`Remote stream for ${id}:`, {
                          videoTracks: videoTracks.length,
                          videoEnabled: videoTracks.length > 0 ? videoTracks[0].enabled : false,
                          audioTracks: audioTracks.length,
                          audioEnabled: audioTracks.length > 0 ? audioTracks[0].enabled : false
                        });
                      }
                    }}
                  />
                  <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                    {connectionStatus[id] || 'connecting'}
                  </span>
                </>
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-700">
                  <span className="text-4xl font-bold text-white">{getInitial(id)}</span>
                  <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                    {connectionStatus[id] || 'waiting'}
                  </span>
                </div>
              )}
              <span className="absolute bottom-2 left-2 bg-black/60 text-white text-sm px-2 py-1 rounded">
                {id === hostId ? "Host" : "Guest"} - {id.slice(0,8)}
              </span>
            </div>
          ))}

          {/* Overflow indicator */}
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
            localVideoRef={localVideoRef}
            onLeaveCall={leaveCall}
            onMediaStateChange={handleMediaStateChange}
            participantsCount={totalParticipants}
          />
        </div>
      </div>
    </div>
  );
}