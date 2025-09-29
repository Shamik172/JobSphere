module.exports = (io,socket) => {
  console.log("Connected:",socket.id);

  socket.on("join-room", ({roomId,userId}) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined",{ userId, socketId:socket.id });

    socket.on("signal", data => {
      io.to(data.to).emit("signal", { from:socket.id, signal:data.signal });
    });

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-left",{ userId, socketId:socket.id });
    });
  });
}
