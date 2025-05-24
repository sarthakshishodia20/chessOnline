const express = require('express');
const app = express();
const socket = require('socket.io');
const http = require('http');
const path = require('path');
const { Chess } = require('chess.js');

// Create HTTP server
const server = http.createServer(app);

// Initialize socket.io
const io = socket(server, {
  cors: {
    origin: "*"
  }
});

// Chess game logic
const chess = new Chess();
let players = {};

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Custom Chess Game" });
});

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Assign roles
  if (!players.white) {
    players.white = socket.id;
    socket.emit('playerRole', 'w');
  } else if (!players.black) {
    players.black = socket.id;
    socket.emit('playerRole', 'b');
  } else {
    socket.emit('spectatorRole');
  }

  socket.on('move', (move) => {
    try {
      if ((chess.turn() === 'w' && socket.id !== players.white) ||
          (chess.turn() === 'b' && socket.id !== players.black)) {
        return;
      }

      const result = chess.move(move);
      if (result) {
        io.emit('move', move);
      } else {
        socket.emit('invalidMove', move);
      }
    } catch (err) {
      console.error('Move error:', err);
      socket.emit('invalidMove', move);
    }
  });

  socket.on('requestRole', () => {
    if (socket.id === players.white) socket.emit('playerRole', 'w');
    else if (socket.id === players.black) socket.emit('playerRole', 'b');
    else socket.emit('spectatorRole');
  });

  socket.on('disconnect', () => {
    let winner = null;
    if (socket.id === players.white) {
      console.log('White player disconnected');
      delete players.white;
      winner = 'Black';
    } else if (socket.id === players.black) {
      console.log('Black player disconnected');
      delete players.black;
      winner = 'White';
    }

    if (winner) {
      chess.reset();
      io.emit('status', `${winner} wins! Opponent disconnected.`);
    }
  });

  socket.emit('boardState', chess.fen());
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
