const express = require("express");
const router = express.Router();
const { createRoom, joinRoom } = require("../controllers/roomController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/create", createRoom);
router.post("/join/:roomId", joinRoom);

module.exports = router;
