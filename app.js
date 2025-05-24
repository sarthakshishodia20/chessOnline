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
let currentPlayer = 'W'; // White starts by default

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index",{title:"Custom Chess Game"});
});

io.on('connection',function(uniqueSocket){
    console.log('connected');
    if(!players.white){
        players.white=uniqueSocket.id;
        uniqueSocket.emit('playerRole','w');
        currentPlayer='B';
    }
    else if(!players.black){
        players.black=uniqueSocket.id;
        uniqueSocket.emit('playerRole','b');
        currentPlayer='W';
    }
    else{
        uniqueSocket.emit('spectatorRole');
    }

    uniqueSocket.on('disconnect',function(){
        if(uniqueSocket.id===players.white){
            delete players.white;
        }
        else if(uniqueSocket.id===players.black){
            delete players.black;
        }
    })
    uniqueSocket.on('move',(move)=>{
        try{
            // mtlb agr white ki baari thi or chl diya black ne toh whi se return krdo usko 
            if(chess.turn()=='w' && uniqueSocket.id!== players.white){
                return;
            }
            // mtlb agr black ki baari thi or chl diya white ne toh usko vahi se return krdo
            if(chess.turn()=='b' && uniqueSocket.id!==players.black){
                return;
            }
            // kul milakr itna hai ki white ke time sirf white chl paega or black ke time pr sirf black chl paega 
            // move krdia chess game mein
            const result=chess.move(move);
            // chess.move move krne ki kosis krega agr vo shi move hoga ya glt move hoga to vo result ke andr store ho jaega or isi line ki vajah se error aa skta hai isliye try catch ke andr aaya hai
            if(result){
                // agr shi result hai toh current player ka turn aa jaega
                currentPlayer=chess.turn();
                // jo bhi ek client pr hua usko sbko bhej do jo bhi included hai uss time pr server mein 
                io.emit("move",move);
                // fen forsyth edward notation ye btata hai current state of chessboard game
                io.emit('boardState',chess.fen());// board ki current state emit krdega
            }
            else{
                console.log('Invalid move',move);
                uniqueSocket.emit('invalidMove',move);
            }
        }catch(err){
            console.log(err);
            uniqueSocket.emit("Invalid Move: ",move);
        }
    })
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
