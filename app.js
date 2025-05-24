const express = require('express');
const app = express();
const socket = require('socket.io');
const http = require('http');
const path = require('path');
const { Chess } = require('chess.js'); // Correct import

// Create HTTP server with express app
const server = http.createServer(app);

// Initialize socket.io on the server
const io = socket(server);

// Initialize chess game
const chess = new Chess();

let players = {};
// currentPlayer is handled by chess.turn(), no need to keep this separately
// let currentPlayer = 'W'; 

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index", { title: "Custom Chess Game" });
});

io.on('connection', (socket) => {
    console.log('connected:', socket.id);

    // Assign roles in the order of connection
    if (!players.white) {
        players.white = socket.id;
        socket.emit('playerRole', 'w');
    } else if (!players.black) {
        players.black = socket.id;
        socket.emit('playerRole', 'b');
    } else {
        socket.emit('spectatorRole');
    }

    socket.on('disconnect', () => {
        if (socket.id === players.white) {
            delete players.white;
            console.log('White player disconnected');
        } else if (socket.id === players.black) {
            delete players.black;
            console.log('Black player disconnected');
        }
    });

    socket.on('move', (move) => {
        try {
            // Ensure the right player is making the move
            if (chess.turn() === 'w' && socket.id !== players.white) {
                return;
            }
            if (chess.turn() === 'b' && socket.id !== players.black) {
                return;
            }

            const result = chess.move(move);

            if (result) {
                // Broadcast the move and board state to all clients
                io.emit("move", move);
                io.emit('boardState', chess.fen());
            } else {
                console.log('Invalid move attempted:', move);
                socket.emit('invalidMove', move);
            }
        } catch (err) {
            console.log('Error processing move:', err);
            socket.emit('invalidMove', move);
        }
    });

    socket.on('requestRole', () => {
        // If a client reconnects and wants to know role again
        if (socket.id === players.white) {
            socket.emit('playerRole', 'w');
        } else if (socket.id === players.black) {
            socket.emit('playerRole', 'b');
        } else {
            socket.emit('spectatorRole');
        }
    });
});

// Start the server
server.listen(3000, () => {
    console.log("listening on port 3000");
});
