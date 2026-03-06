// const Room = require("../models/Room");
// const words = require("../utils/words");
// const { v4: uuidv4 } = require("uuid");

// // store drawer per room in memory
// const roomDrawers = {};

// module.exports = (io) => {

//   io.on("connection", (socket) => {

//     console.log("User connected:", socket.id);

//     // CREATE ROOM
//     socket.on("create_room", async ({ hostName, settings }) => {

//       const roomId = uuidv4().slice(0,6);

//       const room = await Room.create({
//         roomId,
//         hostId: socket.id,
//         players: [
//           {
//             socketId: socket.id,
//             name: hostName,
//             score: 0
//           }
//         ],
//         settings,
//         currentRound: 0,
//         currentDrawerIndex: 0
//       });

//       socket.join(roomId);
//       socket.emit("room_created", room);
//     });


//     // JOIN ROOM
//     socket.on("join_room", async ({ roomId, playerName }) => {

//       const room = await Room.findOne({ roomId });
//       if (!room) return;

//       const exists = room.players.find(
//         p => p.socketId === socket.id
//       );

//       if (!exists) {

//         room.players.push({
//           socketId: socket.id,
//           name: playerName,
//           score: 0
//         });

//         await room.save();
//       }

//       socket.join(roomId);

//       io.to(roomId).emit("player_joined", room.players);
//     });


//     // START GAME
//     socket.on("start_game", async ({ roomId }) => {

//   const room = await Room.findOne({ roomId });
//   if (!room) return;

//   room.currentRound = 1;
//   room.currentDrawerIndex = 0;

//   await room.save();

//   io.to(roomId).emit("game_started"); // NEW EVENT

//   startRound(io, room);
// });


//     // socket.on("start_game", async ({ roomId }) => {

//     //   const room = await Room.findOne({ roomId });
//     //   if (!room) return;

//     //   room.currentRound = 1;
//     //   room.currentDrawerIndex = 0;

//     //   await room.save();

//     //   startRound(io, room);
//     // });



//     // GUESS
//     socket.on("guess", async ({ roomId, text }) => {

//       const room = await Room.findOne({ roomId });
//       if (!room || !room.currentWord) return;

//       const drawerSocket = roomDrawers[roomId];

//       if (socket.id === drawerSocket) return;

//       if (
//         text.trim().toLowerCase() ===
//         room.currentWord.toLowerCase()
//       ) {

//         const player = room.players.find(
//           p => p.socketId === socket.id
//         );

//         if (player) player.score += 100;

//         await room.save();

//         io.to(roomId).emit("guess_result", {
//           correct: true,
//           playerId: socket.id
//         });

//         endRound(io, room);
//       }
//     });


//     // DRAW
//     socket.on("draw_move", ({ roomId, data }) => {

//       const drawerSocket = roomDrawers[roomId];

//       if (socket.id !== drawerSocket) return;

//       socket.to(roomId).emit("draw_data", data);
//     });

//     socket.on("clear_canvas", ({ roomId }) => {

//   socket.to(roomId).emit("clear_canvas");

// });


//     socket.on("disconnect", () => {
//       console.log("User disconnected:", socket.id);
//     });

//   });

// };


// // START ROUND
// async function startRound(io, room) {

//   const drawer = room.players[room.currentDrawerIndex];

//   const randomWord =
//     words[Math.floor(Math.random() * words.length)];

//   room.currentWord = randomWord;

//   await room.save();

//   // store drawer in memory
//   roomDrawers[room.roomId] = drawer.socketId;

//   let timeLeft = room.settings.drawTime;

//   io.to(room.roomId).emit("round_start", {
//     drawerId: drawer.socketId,
//     currentRound: room.currentRound,
//     timeLeft
//   });

//   const timer = setInterval(() => {

//     timeLeft--;

//     io.to(room.roomId).emit("timer_update", {
//       timeLeft
//     });

//     if (timeLeft <= 0) {

//       clearInterval(timer);

//       endRound(io, room);
//     }

//   }, 1000);
// }


// // END ROUND
// async function endRound(io, room) {

//   room.currentDrawerIndex =
//     (room.currentDrawerIndex + 1) %
//     room.players.length;

//   if (room.currentDrawerIndex === 0) {
//     room.currentRound++;
//   }

//   if (room.currentRound > room.settings.rounds) {

//     io.to(room.roomId).emit("game_over", {
//       players: room.players
//     });

//     return;
//   }

//   await room.save();

//   startRound(io, room);
// }


const Room = require("../models/Room");
const words = require("../utils/words");
const { v4: uuidv4 } = require("uuid");

const roomDrawers = {};

module.exports = (io) => {

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);


    // CREATE ROOM
    socket.on("create_room", async ({ hostName, settings }) => {

      const roomId = uuidv4().slice(0,6);

      const room = await Room.create({
        roomId,
        hostId: socket.id,
        players: [
          {
            socketId: socket.id,
            name: hostName,
            score: 0
          }
        ],
        settings,
        currentRound: 0,
        currentDrawerIndex: 0
      });

      socket.join(roomId);

      socket.emit("room_created", room);
    });


    // JOIN ROOM
    socket.on("join_room", async ({ roomId, playerName }) => {

      const room = await Room.findOne({ roomId });
      if (!room) return;

      const exists = room.players.find(p => p.socketId === socket.id);

      if (!exists) {
        room.players.push({
          socketId: socket.id,
          name: playerName,
          score: 0
        });

        await room.save();
      }

      socket.join(roomId);

      io.to(roomId).emit("player_joined", room.players);
    });


//     // START GAME
//    socket.on("start_game", async ({ roomId }) => {

//   const room = await Room.findOne({ roomId });
//   if (!room) return;

//   room.currentRound = 1;
//   room.currentDrawerIndex = 0;

//   await room.save();

//   io.to(roomId).emit("game_started"); // ⭐ ADD THIS

//   startRound(io, room);

// });

//     // WORD CHOSEN
//     socket.on("word_chosen", async ({ roomId, word }) => {

//       const room = await Room.findOne({ roomId });
//       if (!room) return;

//       room.currentWord = word;
//       await room.save();

//       const drawerId = roomDrawers[roomId];

//       let timeLeft = room.settings.drawTime || 60;

//       io.to(roomId).emit("round_start", {
//         drawerId,
//         timeLeft
//       });

//       const timer = setInterval(() => {

//         timeLeft--;

//         io.to(roomId).emit("timer_update", { timeLeft });

//         if (timeLeft <= 0) {

//           clearInterval(timer);

//           endRound(io, room);

//         }

//       }, 1000);

//     });


socket.on("start_game", async ({ roomId }) => {
      const room = await Room.findOne({ roomId });
      if (!room) return;

      room.currentRound = 1;
      room.currentDrawerIndex = 0;
      // Mark game as started in DB if you have that field
      room.gameStarted = true; 
      await room.save();

      io.to(roomId).emit("game_started");
      
      // Start the round logic immediately
      startRound(io, room);
    });

    socket.on("word_chosen", async ({ roomId, word }) => {
      const room = await Room.findOne({ roomId });
      if (!room) return;

      room.currentWord = word;
      await room.save();

      // IMPORTANT: Get the drawerId directly from the room logic 
      // instead of relying solely on the roomDrawers variable
      const drawer = room.players[room.currentDrawerIndex];
      const drawerId = drawer.socketId;

      let timeLeft = room.settings.drawTime || 60;

      // Tell everyone the round has officially started with the timer
      io.to(roomId).emit("round_start", {
        drawerId,
        timeLeft
      });

      const timer = setInterval(() => {
        timeLeft--;
        io.to(roomId).emit("timer_update", { timeLeft });

        if (timeLeft <= 0) {
          clearInterval(timer);
          endRound(io, room);
        }
      }, 1000);
    });

    // DRAW
    socket.on("draw_move", ({ roomId, data }) => {

      const drawer = roomDrawers[roomId];

      if (socket.id !== drawer) return;

      socket.to(roomId).emit("draw_data", data);

    });


    // CLEAR CANVAS
    socket.on("clear_canvas", ({ roomId }) => {

      const drawer = roomDrawers[roomId];

      if (socket.id !== drawer) return;

      socket.to(roomId).emit("clear_canvas");

    });


    // GUESS
    socket.on("guess", async ({ roomId, text }) => {
  const room = await Room.findOne({ roomId });
  if (!room || !room.currentWord) return;

  const player = room.players.find(p => p.socketId === socket.id);
  if (!player) return;

  if (text.trim().toLowerCase() === room.currentWord.toLowerCase()) {
    player.score += 100;
    await room.save();

    io.to(roomId).emit("player_joined", room.players); // Update Leaderboard
    
    // ⭐ NEW: Send a system message to the chat
    io.to(roomId).emit("message", {
      user: "System",
      text: `${player.name} guessed the word!`,
      type: "system"
    });

    endRound(io, room);
  } else {
    // Just a regular wrong guess, send it as chat
    io.to(roomId).emit("message", {
      user: player.name,
      text: text,
      type: "chat"
    });
  }
});


//     socket.on("guess", async ({ roomId, text }) => {

//       const room = await Room.findOne({ roomId });
//       if (!room || !room.currentWord) return;

//       const drawer = roomDrawers[roomId];

//       if (socket.id === drawer) return;

//     // Inside socket.on("guess", ...)
// if (text.trim().toLowerCase() === room.currentWord.toLowerCase()) {
//   const player = room.players.find(p => p.socketId === socket.id);
//   if (player) player.score += 100;

//   await room.save();

//   // ⭐ ADD THIS: Tell everyone the scores have changed
//   io.to(roomId).emit("player_joined", room.players); 

//   io.to(roomId).emit("guess_result", {
//     correct: true,
//     playerId: socket.id,
//     playerName: player.name // Useful for chat notifications later
//   });

//   endRound(io, room);
// }

//     });


  });

};



// async function startRound(io, room) {

//   const drawer = room.players[room.currentDrawerIndex];

//   roomDrawers[room.roomId] = drawer.socketId;

//   const shuffled = [...words].sort(() => 0.5 - Math.random());
//   const wordChoices = shuffled.slice(0,3);

//   io.to(drawer.socketId).emit("choose_word", {
//     words: wordChoices,
//     drawerId: drawer.socketId
//   });

// }

// async function startRound(io, room) {
//   const drawer = room.players[room.currentDrawerIndex];
  
//   // Sync the local tracker
//   roomDrawers[room.roomId] = drawer.socketId;
  

//   const shuffled = [...words].sort(() => 0.5 - Math.random());
//   const wordChoices = shuffled.slice(0, 3);

//   // Send word choices ONLY to the drawer
//   io.to(drawer.socketId).emit("choose_word", {
//     words: wordChoices,
//     drawerId: drawer.socketId
//   });
// }

async function startRound(io, room) {
  const drawer = room.players[room.currentDrawerIndex];
  
  // Sync the local tracker so the server knows who can draw
  roomDrawers[room.roomId] = drawer.socketId;

  const shuffled = [...words].sort(() => 0.5 - Math.random());
  const wordChoices = shuffled.slice(0, 3);

  // Clear any old word from the previous round
  room.currentWord = null;
  await room.save();

  // Send choices ONLY to the drawer. 
  // DO NOT emit anything to the whole room (io.to(roomId)) here!
  io.to(drawer.socketId).emit("choose_word", {
    words: wordChoices,
    drawerId: drawer.socketId
  });
}



async function endRound(io, room) {

  room.currentDrawerIndex =
    (room.currentDrawerIndex + 1) % room.players.length;

  if (room.currentDrawerIndex === 0) {
    room.currentRound++;
  }

  await room.save();

  startRound(io, room);

}