const Attempt = require("../models/Attempt");

module.exports = (io) => {
  const collab = io.of("/collab");

  collab.on("connection", (socket) => {
    console.log("🧩 Collab socket connected:", socket.id);

    // Join room and send initial state
    socket.on("join-room", async ({ assessmentId, candidateId, questionId }) => {
      try {
        if (!assessmentId || !candidateId || !questionId) {
          console.warn(`⚠️ Missing room data from ${socket.id}`);
          return;
        }
        const roomKey = `${assessmentId}_${candidateId}_${questionId}`;
        socket.join(roomKey);
        console.log(`🧠 ${socket.id} joined room ${roomKey}`);

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
        }

        // Send initial state once
        socket.emit("load-initial-state", {
          code: attempt.final_code || "",
          whiteboard: attempt.final_whiteboard_data || [],
        },console.log("backend sent data"));
      } catch (err) {
        console.error("Error in join-room:", err);
      }
    });

    // Handle code changes
    socket.on("code-change", async (data) => {
      try {
        await Attempt.updateOne(
          {
            assessment: data.assessment || socket.handshake?.query?.assessmentId,
            candidate: data.candidate || socket.handshake?.query?.candidateId,
            question_id: data.questionId || socket.handshake?.query?.questionId,
          },
          {
            $set: { final_code: data.code },
            $push: { code_events: { timestamp: new Date(), event_data: data } },
          }
        );
      } catch (err) {
        console.error("Error handling code-change persist:", err);
      }
      const roomKey = `${socket.handshake?.query?.assessmentId}_${socket.handshake?.query?.candidateId}_${socket.handshake?.query?.questionId}`;
      socket.to(roomKey).emit("code-update", { code: data.code });
    });

    // Handle whiteboard changes
    socket.on("whiteboard-change", async (data) => {
      try {
        const plainElements = (data.whiteboard || []).map(el => JSON.parse(JSON.stringify(el)));
        const roomKey = `${socket.handshake?.query?.assessmentId}_${socket.handshake?.query?.candidateId}_${socket.handshake?.query?.questionId}`;
        socket.to(roomKey).emit("whiteboard-update", { whiteboard: plainElements });

        await Attempt.updateOne(
          {
            assessment: socket.handshake?.query?.assessmentId,
            candidate: socket.handshake?.query?.candidateId,
            question_id: socket.handshake?.query?.questionId,
          },
          {
            $set: { final_whiteboard_data: plainElements },
            $push: { whiteboard_events: { timestamp: new Date(), event_data: data } },
          }
        );
      } catch (err) {
        console.error("Error handling whiteboard-change persist:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ ${socket.id} disconnected`);
    });
  });
};
