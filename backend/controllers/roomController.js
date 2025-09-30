const Room = require("../models/Room");
const { v4: uuidv4 } = require("uuid");

exports.createRoom = async (req,res) => {
  try {
    const roomId = uuidv4();
    const room = await Room.create({
      roomId,
      createdBy: req.user.id,
      participants:[req.user.id]
    });
    res.json({ roomId: room.roomId });
  } catch(err){ res.status(500).json({error:err.message}); }
}

exports.joinRoom = async (req,res) => {
  try {
    const { roomId } = req.params;
    console.log("room id : ", roomId)
    const room = await Room.findOne({ roomId });
    if(!room) {
      console.log("database fetching of room failed")
      return res.status(404).json({error:"Room not found"});
    }
    if(!room.participants.includes(req.user.id)){
      room.participants.push(req.user.id);
      await room.save();
    }
    res.json({ success:true, roomId });
  } catch(err){ res.status(500).json({error:err.message}); }
}
