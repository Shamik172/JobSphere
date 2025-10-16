import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import socket from "../../../utils/socket";
import { useNavigate } from 'react-router-dom'
import VideoCallControls from './VideoCallControls'

const ICE_SERVERS = { iceServers: [{ urls: "stun:stun.l.google.com:19302"}] };

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

export default function VideoCallWindow({ roomId, userId }) {
 const [peers, setPeers] = useState({}); // mapping socketId -> RTCPeerConnection
 const [remoteStreams, setRemoteStreams] = useState({}); // mapping socketId -> MediaStream for UI
 const [isHost, setIsHost] = useState(false);
 const [hostId, setHostId] = useState(null);

 const localVideoRef = useRef();
 const localStreamRef = useRef(new MediaStream()); // will hold actual tracks when available
 const navigate = useNavigate();

 // mutable refs to avoid stale closures
 const peersRef = useRef({}); // socketId -> RTCPeerConnection
 const pendingCandidatesRef = useRef({}); // socketId -> [candidate,...]
 const negotiationLock = useRef(false);
 const pendingOffersRef = useRef([]);
 const pendingAnswersRef = useRef([]);
 const hostIdRef = useRef(null);
 const hostIdJustSet = useRef(false);
 
 // 1. Keep this effect at the top level
 useEffect(() => {
 hostIdRef.current = hostId;
 console.log(`hostId synchronized: ${hostId}`);
 }, [hostId]);

 // 2. Keep this effect at the top level
 useEffect(() => {
 if (hostId) {
 hostIdJustSet.current = true;
 // Reset this flag after a short delay
 setTimeout(() => {
 hostIdJustSet.current = false;
 }, 500);
 }
 }, [hostId]);

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
 if (isHost) {
 // Host waits for others to connect — does not create offers.
 return;
 }
 // Guest connects to the host only.
 if (!isHost && existingSocketIds.length) {
 const hostSocketId = existingSocketIds[0]; // assume first one in room is host
 try {
 const pc = await createPeer(hostSocketId, localStreamRef.current, true);
 addPeerToState(hostSocketId, pc);
 } catch (err) {
 console.error("Failed to connect to host", err);
 }
 }
 };

 const handleUserConnected = async (otherSocketId) => {
 if (!isHost) {
 // Guests don't connect to new peers; only to host.
 return;
 }

 // Host receives a new user — creates peer for them (initiator)
 try {
 const pc = await createPeer(otherSocketId, localStreamRef.current, true);
 addPeerToState(otherSocketId, pc);
 } catch (err) {
 console.error("Host failed to connect to new peer:", err);
 }
 };

 // Bob's perspective
 // after receiving intiator offer now this system sets initiator as remotedescription and it owns as localdescription and answers with it's icecandidate and sdp 
 const handleReceiveOffer = async ({ from, sdp }) => {
 console.log(`Received offer from: ${from}, isHost: ${isHost}, hostId: ${hostId}, myId: ${socket.id}`);
 
 if (!isHost && !hostId) {
 console.log("No host ID known yet, assuming this first sender is the host");
 // Auto-assign first offer sender as host if we don't know who host is
 setHostId(from);
 hostIdRef.current = from;
 
 // Continue processing this offer immediately rather than queuing
 try {
 let pc = peersRef.current[from];
 if (!pc) {
 pc = await createPeer(from, localStreamRef.current, false);
 addPeerToState(from, pc);
 }
 
 // Rest of offer processing
 await pc.setRemoteDescription(new RTCSessionDescription(sdp));
 
 // Process any queued ICE candidates for this peer
 const list = pendingCandidatesRef.current[from];
 if (list && list.length) {
 for (const cand of list) {
 try {
 await pc.addIceCandidate(new RTCIceCandidate(cand));
 } catch (err) {
 console.warn("Error adding queued ICE candidate", err);
 }
 }
 delete pendingCandidatesRef.current[from];
 }
 
 const answer = await pc.createAnswer();
 await pc.setLocalDescription(answer);
 socket.emit("answer", { to: from, sdp: answer });
 
 return; // Exit early since we've handled the offer
 } catch (err) {
 console.error("Error handling first offer as host:", err);
 }
 }

 // Original validation logic - more permissive now
 const isValidSender = 
 (isHost && from !== socket.id) || 
 (!isHost && (from === hostId || hostId === null));
 
 if (!isValidSender) {
 console.warn(`Ignoring offer from invalid sender: ${from} (myId: ${socket.id}, hostId: ${hostId})`);
 return;
 }

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
 console.warn(`Delaying offer from ${from}, signalingState=${pc.signalingState}`);
 setTimeout(() => handleReceiveOffer({ from, sdp }), 300);
 return;
 }

 negotiationLock.current = true;
 await pc.setRemoteDescription(new RTCSessionDescription(sdp));
 
 // drain queued ICE candidates after setting remote description.
 const list = pendingCandidatesRef.current[from];
 if (list && list.length) {
 for (const cand of list) {
 try {
 await pc.addIceCandidate(new RTCIceCandidate(cand));
 } catch (err) {
 console.warn("Error adding queued ICE candidate", err);
 }
 }
 delete pendingCandidatesRef.current[from];
 }

 const answer = await pc.createAnswer();
 await pc.setLocalDescription(answer);
 socket.emit("answer", { to: from, sdp: answer });

 } catch (err) {
 console.error("Error handling received offer:", err);
 } finally {
 negotiationLock.current = false;
 }
 };

 // 2. Modified version of handleReceiveAnswer that checks the hostIdJustSet flag
 const handleReceiveAnswer = async ({ from, sdp }) => {
 console.log(`Received answer from: ${from}, isHost: ${isHost}, hostId: ${hostId || hostIdRef.current}`);
 
 // Auto-assign the first answer sender as host if we're not host and don't know the hostId
 if (!isHost && !hostId && !hostIdRef.current) {
 console.log(`Queuing answer until hostId is known: ${from}`);
 pendingAnswersRef.current = pendingAnswersRef.current || [];
 pendingAnswersRef.current.push({ from, sdp });
 return;
 }
 
 // 3. Process queued answers if hostId was just set
 if (hostIdJustSet.current && pendingAnswersRef.current?.length > 0) {
 console.log(`Processing ${pendingAnswersRef.current.length} queued answers after hostId set`);
 const answers = [...pendingAnswersRef.current];
 pendingAnswersRef.current = [];
 
 for (const answer of answers) {
 try {
 // Process each answer by calling this function recursively
 // But we need to prevent infinite loops by running async
 setTimeout(() => handleReceiveAnswer(answer), 0);
 } catch (err) {
 console.error("Error processing queued answer:", err);
 }
 }
 }
 
 // More permissive validation
 const isValidSender =
 (isHost && from !== socket.id) ||
 (!isHost && (from === hostId || from === hostIdRef.current));

 if (!isValidSender) {
 console.warn(`Ignoring answer from invalid sender: ${from}`);
 return;
 }

 try {
 const pc = peersRef.current[from];
 if (!pc) {
 console.warn(`No RTCPeerConnection for ${from}, creating one now`);
 // Create peer connection if it doesn't exist yet
 const newPc = await createPeer(from, localStreamRef.current, false);
 addPeerToState(from, newPc);
 
 // Defer processing this answer until the PC is ready
 setTimeout(() => handleReceiveAnswer({ from, sdp }), 100);
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
 console.log(`Successfully set remote description from ${from}`);

 // Process any pending ICE candidates now
 const pendingCandidates = pendingCandidatesRef.current[from];
 if (pendingCandidates && pendingCandidates.length) {
 console.log(`Processing ${pendingCandidates.length} pending ICE candidates for ${from}`);
 for (const candidate of pendingCandidates) {
 try {
 await pc.addIceCandidate(new RTCIceCandidate(candidate));
 } catch (err) {
 console.warn("Error adding queued ICE candidate", err);
 }
 }
 delete pendingCandidatesRef.current[from];
 }

 negotiationLock.current = false;
 } catch (err) {
 negotiationLock.current = false;
 console.error("Error handling received answer:", err);
 }
 };

 const handleNewICECandidateMsg = async ({ from, candidate }) => {
 console.log(`Received ICE candidate from: ${from}, isHost: ${isHost}, hostId: ${hostId || hostIdRef.current}`);
 
 // If no hostId is known yet, but this is the first ICE candidate we've seen,
 // we'll store it and hope the offer tells us who the host is
 if (!isHost && !hostId && !hostIdRef.current) {
 pendingCandidatesRef.current[from] = pendingCandidatesRef.current[from] || [];
 pendingCandidatesRef.current[from].push(candidate);
 console.log(`Queuing ICE candidate from ${from} until hostId is known`);
 return;
 }
 
 // More permissive validation for ICE candidates
 const isValidSender = 
 (isHost && from !== socket.id) || 
 (!isHost && (from === hostId || from === hostIdRef.current || !hostId));
 
 if (!isValidSender) {
 console.warn(`Ignoring ICE candidate from invalid sender: ${from}`);
 return;
 }

 try {
 const pc = peersRef.current[from];
 if (pc) {
 // If remote description not yet set, queue candidate
 if (!pc.remoteDescription || pc.remoteDescription.type === "") {
 console.log(`Queueing ICE candidate from ${from} because remoteDescription is not set yet`);
 pendingCandidatesRef.current[from] = pendingCandidatesRef.current[from] || [];
 pendingCandidatesRef.current[from].push(candidate);
 return;
 }

 // Safe to add now
 await pc.addIceCandidate(new RTCIceCandidate(candidate));
 console.log(`Successfully added ICE candidate from ${from}`);
 } else {
 // No peer yet — queue candidate
 console.log(`No peer connection for ${from} yet, queueing ICE candidate`);
 pendingCandidatesRef.current[from] = pendingCandidatesRef.current[from] || [];
 pendingCandidatesRef.current[from].push(candidate);
 
 // If this is from the host, try to create a connection now
 if (!isHost && (from === hostId || from === hostIdRef.current)) {
 console.log("Creating connection to host after receiving ICE candidate");
 const newPc = await createPeer(from, localStreamRef.current, true);
 addPeerToState(from, newPc);
 }
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
 
 // --- host-info listener
 socket.on("host-info", ({ hostId: receivedHostId }) => {
 console.log("Received host info:", receivedHostId);

 // Store in both state and ref for immediate access
 setHostId(receivedHostId);
 hostIdRef.current = receivedHostId;
 setIsHost(socket.id === receivedHostId);

 // If we have a peer for this host already, make sure it's in the state
 const existingPc = peersRef.current[receivedHostId];
 if (existingPc && !peers[receivedHostId]) {
 addPeerToState(receivedHostId, existingPc);
 } else if (!existingPc && !isHost && socket.id !== receivedHostId) {
 // If we're not the host and don't have a connection to the host yet, create one
 console.log("Creating connection to host after host-info received");
 createPeer(receivedHostId, localStreamRef.current, true)
 .then(pc => {
 addPeerToState(receivedHostId, pc);
 })
 .catch(err => {
 console.error("Failed to create peer after host-info:", err);
 });
 }

 // Process any queued offers
 if (pendingOffersRef.current.length > 0) {
 console.log(`Processing ${pendingOffersRef.current.length} queued offers`);
 
 // Make a copy before processing to avoid mutation during iteration
 const offers = [...pendingOffersRef.current];
 pendingOffersRef.current = [];
 
 offers.forEach(offer => {
 try {
 handleReceiveOffer(offer);
 } catch (err) {
 console.error("Error processing queued offer:", err);
 }
 });
 }

 // Process any queued answers
 if (pendingAnswersRef.current.length > 0) {
 console.log(`Processing ${pendingAnswersRef.current.length} queued answers`);
 const answers = [...pendingAnswersRef.current];
 pendingAnswersRef.current = [];
 
 answers.forEach(answer => {
 try {
 handleReceiveAnswer(answer);
 } catch (err) {
 console.error("Error processing queued answer:", err);
 }
 });
 }
 });

 socket.on("host-assigned", ({ isHost }) => {
 console.log("You are assigned as host:", isHost);
 setIsHost(isHost);
 if (isHost) setHostId(socket.id);
 });

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
 socket.off("host-info");
 socket.off("host-assigned");

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
 You - {socket.id}
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
 localVideoRef={localVideoRef}
 onLeaveCall={leaveCall}
 participantsCount={totalParticipants}
 />
 </div>
 </div>
 </div>
 );
}