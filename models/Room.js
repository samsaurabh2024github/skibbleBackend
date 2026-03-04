const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  socketId: String,
  name: String,
  score: { type: Number, default: 0 },
});

const roomSchema = new mongoose.Schema({
  roomId: String,
  hostId: String,
  players: [playerSchema],

  settings: {
    maxPlayers: Number,
    rounds: Number,
    drawTime: Number,
    wordCount: Number,
  },

  currentRound: { type: Number, default: 0 },
  currentDrawerIndex: { type: Number, default: 0 },
  currentWord: String,
  gameStarted: { type: Boolean, default: false },
});

module.exports = mongoose.model("Room", roomSchema);