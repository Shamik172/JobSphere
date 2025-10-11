// For coding + whiteboard
// Handle /collab namespace for Socket.IO
// Join room by assessmentId_candidateId_questionId
// Sync Monaco Editor & Excalidraw:
// code-change → broadcast code changes
// whiteboard-update → broadcast drawing actions
// Persist to MongoDB using your Attempt schema
// Handle reconnect / state recovery:
// Emit sync-state with final code & whiteboard if exists

const Attempt = require("../models/Attempt");

module.exports = (io) => {
  // Create namespace for collaboration
  const collab = io.of("/collab");

  collab.on("connection", (socket) => {
    console.log("🧩 Collab socket connected:", socket.id);

    // Client joins a unique room for their assessment/question/candidate combo
    socket.on("join-room", async ({ assessmentId, candidateId, questionId }) => {
      try {
        console.log("backend socket received:", assessmentId, candidateId, questionId);

        // Validate parameters
        if (!assessmentId || !candidateId || !questionId) {
          console.warn(`⚠️ Missing room data from ${socket.id}`);
          return;
        }

        // Construct room key
        const roomKey = `${assessmentId}_${candidateId}_${questionId}`;
        socket.join(roomKey);
        console.log(`🧠 ${socket.id} joined room ${roomKey}`);

        // Fetch or create Attempt record
        let attempt = await Attempt.findOne({
          assessment: assessmentId,
          candidate: candidateId,
          question_id: questionId,
        });

        if (!attempt) {
          attempt = await Attempt.create({
            assessment: assessmentId,
            candidate: candidateId,
            question_id: questionId,
            final_code: "",
            final_whiteboard_data: [],
          });
          console.log(`🆕 Created new Attempt record for ${roomKey}`);
        }

        // Send initial state to the joining socket
        socket.emit("load-initial-state", {
          code: attempt.final_code || "",
          whiteboard: attempt.final_whiteboard_data || [],
        },console.log("initial state emitted from backend"));

        // Handle real-time code changes
        socket.on("code-change", async (data) => {
          socket.to(roomKey).emit("code-update", data);
          await Attempt.updateOne(
            { _id: attempt._id },
            {
              $set: { final_code: data.code },
              $push: {
                code_events: { timestamp: new Date(), event_data: data },
              },
            }
          );
        });

        // Handle whiteboard changes
        socket.on("whiteboard-change", async (data) => {
          const plainElements = data.whiteboard.map(el => JSON.parse(JSON.stringify(el))); // convert to plain objects
          socket.to(roomKey).emit("whiteboard-update", data);

          await Attempt.updateOne(
            { _id: attempt._id },
            {
              $set: { final_whiteboard_data: plainElements },
              $push: {
                whiteboard_events: { timestamp: new Date(), event_data: data },
              },
            }
          );
        });


        // Clean up on disconnect
        socket.on("disconnect", () => {
          console.log(`❌ ${socket.id} disconnected from ${roomKey}`);
          socket.leave(roomKey);
        });

      } catch (err) {
        console.error("❗Error in join-room handler:", err);
      }
    });
  });
};


