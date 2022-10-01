const commandLineArgs = require("command-line-args");
import { createLogger, format, transports, level } from "winston";
import { Server, Socket } from "socket.io";
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}][${label.toUpperCase()}]: ${message}`;
});

const commandOptions = [
  { name: "db-save-all", type: Boolean, default: false },
  { name: "log-level", type: Number, default: 3 },
];

const options = commandLineArgs(commandOptions);
let log_level = "info";

if (
  options["log-level"] &&
  options["log-level"] >= 3 &&
  options["log-level"] <= 5
) {
  switch (options["log-level"]) {
    case 3:
      log_level = "info";
      break;
    case 4:
      log_level = "verbose";
      break;
    case 5:
      log_level = "debug";
      break;
  }
}

const logger = createLogger({
  level: log_level,
  transports: [new transports.Console()],
  format: combine(label({ label: "ACARS Hub Server" }), timestamp(), myFormat),
});

commandOptions.forEach((option) => {
  if (!options.hasOwnProperty(option.name)) {
    logger.verbose(
      `${option.name} not defined. Using default value: ${option.default}`
    );
    options[option.name] = option.default;
  } else {
    logger.verbose(
      `${option.name} defined. Using value: ${options[option.name]}`
    );
  }
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

logger.info("Server started");
