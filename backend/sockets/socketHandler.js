const Assessment = require("../models/Assessment");
const AssessmentParticipant = require("../models/AssessmentParticipant");

const userSocketMap = {}; // userId -> socket.id
const socketUserMap = {}; // socket.id -> { userId, roomId }
const roomHostMap = {};   // roomId -> hostSocketId

module.exports = (io, socket) => {
  console.log("New video socket connected:", socket.id);

  socket.on("join-room", async ({ roomId, userId }) => {
    if (!roomId) return;

    if (userId) {
      userSocketMap[userId] = socket.id;
      socketUserMap[socket.id] = { userId, roomId };

      // Set participant presence to 'In Call' in MongoDB
      try {
        const assessment = await Assessment.findOne({ room_id: roomId });
        if (assessment) {
          await AssessmentParticipant.findOneAndUpdate(
            { assessment: assessment._id, user: userId },
            { presence: "In Call" }
          );
          // Broadcast presence update to anyone watching the assessment hub
          io.to(roomId).emit("participant-presence-changed", { userId, presence: "In Call" });
        }
      } catch (err) {
        console.error("Error setting presence to In Call:", err.message);
      }
    }

    socket.join(roomId);
    console.log(`${userId || socket.id} joined video room ${roomId} (socket: ${socket.id})`);

    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    console.log(`Room ${roomId} now has ${clients.length} clients`);

    // Host determination
    if (!roomHostMap[roomId]) {
      roomHostMap[roomId] = socket.id;
      console.log(`Assigned ${socket.id} as HOST for room ${roomId}`);
      socket.emit("host-assigned", { isHost: true });
    } else {
      const hostId = roomHostMap[roomId];
      socket.emit("host-info", { hostId });
      socket.emit("existing-users", [hostId]);
      io.to(hostId).emit("user-connected", socket.id);
    }

    // Signaling relays
    socket.on("offer", ({ to, sdp }) => {
      io.to(to).emit("offer", { from: socket.id, sdp });
    });

    socket.on("answer", ({ to, sdp }) => {
      io.to(to).emit("answer", { from: socket.id, sdp });
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
      io.to(to).emit("ice-candidate", { from: socket.id, candidate });
    });

    // Host triggers end-call for all room participants
    socket.on("terminate-session", ({ roomId }) => {
      console.log(`Terminate-session event received for room ${roomId} from ${socket.id}`);
      // Broadcast to all other participants in that room
      socket.to(roomId).emit("assessment-terminated", {
        message: "The host has concluded this interview session.",
      });
    });

    // Disconnection & presence reset
    socket.on("disconnect", async () => {
      console.log(`${userId || socket.id} disconnected from video room (socket: ${socket.id})`);

      if (userId && userSocketMap[userId]) delete userSocketMap[userId];

      // Reset participant presence to 'Offline'
      if (socketUserMap[socket.id]) {
        const { userId: storedUserId, roomId: storedRoomId } = socketUserMap[socket.id];
        delete socketUserMap[socket.id];

        try {
          const assessment = await Assessment.findOne({ room_id: storedRoomId });
          if (assessment) {
            await AssessmentParticipant.findOneAndUpdate(
              { assessment: assessment._id, user: storedUserId },
              { presence: "Offline" }
            );
            io.to(storedRoomId).emit("participant-presence-changed", {
              userId: storedUserId,
              presence: "Offline",
            });
          }
        } catch (err) {
          console.error("Error setting presence to Offline:", err.message);
        }
      }

      // Reassign host if needed
      if (roomHostMap[roomId] === socket.id) {
        const remaining = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        if (remaining.length > 0) {
          const newHostId = remaining[0];
          roomHostMap[roomId] = newHostId;
          io.to(newHostId).emit("host-assigned", { isHost: true });
          io.to(roomId).emit("host-info", { hostId: newHostId });
        } else {
          delete roomHostMap[roomId];
        }
      }

      socket.to(roomId).emit("user-disconnected", socket.id);
    });
  });
};