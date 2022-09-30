const commandLineArgs = require("command-line-args");
import { Server, Socket } from "socket.io";

const commandOptions = [{ name: "db-save-all", type: Boolean, default: false }];

const options = commandLineArgs(commandOptions);

commandOptions.forEach((option) => {
  if (!options.hasOwnProperty(option.name)) {
    console.log(
      `${option.name} not defined. Using default value: ${option.default}`
    );
    options[option.name] = option.default;
  }
});

console.log(options);

// Socket setup
const io = new Server(
  3000
  // {
  // cors: {
  //   origin: false,
  // },
  //
  //}
);

io.on("connection", (socket: Socket) => {
  console.log("Made socket connection");

  socket.emit("hello from server", 1, "2", { 3: Buffer.from([4]) });

  // receive a message from the client
  socket.on("hello from client", (...args) => {
    console.log("ping from client");
  });
});

console.log("Server started");
