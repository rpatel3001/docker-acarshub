import { io } from "socket.io-client";

console.log(document.location.origin);
const socket = io("ws://localhost:3000", {
  path: document.location.pathname + "socket.io",
});

// send a message to the server
socket.emit("hello from client", 5, "6", { 7: Uint8Array.from([8]) });

// receive a message from the server
socket.on("hello from server", (..._) => {
  console.log("hello from server");
});
