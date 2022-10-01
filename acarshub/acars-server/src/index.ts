import { createLogger, format, transports, level } from "winston";
import { Server, Socket } from "socket.io";
import { ACARSOption } from "types/src";
const options_getter = require("./acars-options");
const { combine, timestamp, label, printf } = format;
const options: ACARSOption = options_getter.options;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${level.toUpperCase().padEnd(7, " ")}][${label
    .toUpperCase()
    .padEnd(16, " ")}]: ${message}`;
});

let log_level = "info";

if (options.LogLevel && options.LogLevel >= 3 && options.LogLevel <= 5) {
  switch (options.LogLevel) {
    case 3:
      log_level = "info";
      break;
    case 4:
      log_level = "verbose";
      break;
    case 5:
      log_level = "debug";
      break;
    default:
      log_level = "info";
      break;
  }
}

const logger = createLogger({
  level: log_level,
  transports: [new transports.Console()],
  format: combine(label({ label: "ACARS Hub Server" }), timestamp(), myFormat),
});

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
  logger.verbose("Made socket connection");

  socket.emit("hello from server", 1, "2", { 3: Buffer.from([4]) });

  // receive a message from the client
  socket.on("hello from client", (...args) => {
    console.log("ping from client");
  });
});

logger.info(`Server started with log level ${log_level.toUpperCase()}`);
