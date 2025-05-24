// const socket = io();
// const chess = new Chess();
// const boardElement = document.querySelector(".chessboard");

// let draggedPiece = null;
// let sourceSquare = null;
// let playerRole = null;

// // Unicode for each piece
// const getPieceUnicode = (piece) => {
//   const unicodePieces = {
//     wp: "♙", bp: "♟",
//     wr: "♖", br: "♜",
//     wn: "♘", bn: "♞",
//     wb: "♗", bb: "♝",
//     wq: "♕", bq: "♛",
//     wk: "♔", bk: "♚",
//   };
//   return unicodePieces[piece] || "";
// };

// const renderBoard = () => {
//   const board = chess.board();
//   boardElement.innerHTML = "";

//   board.forEach((row, rowIndex) => {
//     row.forEach((square, colIndex) => {
//       const squareElement = document.createElement("div");
//       squareElement.classList.add(
//         "square",
//         (rowIndex + colIndex) % 2 === 0 ? "light" : "dark"
//       );
//       squareElement.dataset.row = rowIndex;
//       squareElement.dataset.col = colIndex;

//       if (square) {
//         const pieceElement = document.createElement("div");
//         const pieceCode = square.color + square.type;
//         pieceElement.classList.add("piece", square.color === "w" ? "white" : "black");
//         pieceElement.innerText = getPieceUnicode(pieceCode);

//         // Only allow dragging for current player's pieces
//         pieceElement.draggable = playerRole === square.color;

//         pieceElement.addEventListener("dragstart", (e) => {
//           if (pieceElement.draggable) {
//             draggedPiece = pieceElement;
//             sourceSquare = { row: rowIndex, col: colIndex };
//             e.dataTransfer.setData("text/plain", ""); // Required for Firefox
//           }
//         });

//         pieceElement.addEventListener("dragend", () => {
//           draggedPiece = null;
//           sourceSquare = null;
//         });

//         squareElement.appendChild(pieceElement);
//       }

//       squareElement.addEventListener("dragover", (e) => {
//         e.preventDefault();
//       });

//       squareElement.addEventListener("drop", (e) => {
//         e.preventDefault();
//         if (draggedPiece) {
//           const targetSquare = {
//             row: parseInt(squareElement.dataset.row),
//             col: parseInt(squareElement.dataset.col),
//           };
//           handleMove(sourceSquare, targetSquare);
//         }
//       });

//       boardElement.appendChild(squareElement);
//     });
//   });
// };

// const handleMove = (source, target) => {
//   const move = {
//     from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
//     to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
//     promotion: "q", // always promote to queen
//   };
//   socket.emit("move", move);
// };

// // 🎯 Socket Events

// // Role received from server
// socket.on("playerRole", (role) => {
//   playerRole = role;
//   renderBoard();
// });

// // Spectator role (not allowed to move)
// socket.on("spectatorRole", () => {
//   playerRole = null;
//   renderBoard();
// });

// // FEN board state from server
// socket.on("boardState", (fen) => {
//   chess.load(fen);
//   renderBoard();
// });

// // Opponent move or server move update
// socket.on("move", (move) => {
//   chess.move(move);
//   renderBoard();
// });

// // 🧠 Request role when document is ready
// document.addEventListener("DOMContentLoaded", () => {
//   chess.reset();
//   socket.emit("requestRole");
// });
