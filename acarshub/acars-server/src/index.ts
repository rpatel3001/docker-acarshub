import { createLogger, format, transports, level } from "winston";
import { Server, Socket } from "socket.io";
import { ACARSOption } from "types/src";
import { MessageReceiver } from "./message-receiver";
import { ADSBReceiver } from "./adsb-receiver";
import { AircraftHandler } from "./aircraft-handler";
const options_getter = require("./acars-options");
const { combine, timestamp, label, printf } = format;
const options: ACARSOption = options_getter.options;
const aircraft_handler = new AircraftHandler();

const acarshub_format = printf(({ level, message, _, timestamp, source }) => {
  return `${timestamp} [${level.toUpperCase().padEnd(7, " ")}][${source
    .toUpperCase()
    .padEnd(16, " ")}]: ${message}`;
});

let log_level = "info";

if (options.LogLevel && options.LogLevel >= 3 && options.LogLevel <= 6) {
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
    case 6:
      log_level = "silly";
      break;
    default:
      log_level = "info";
      break;
  }
}

const master_logger = createLogger({
  level: log_level,
  transports: [new transports.Console()],
  format: combine(
    label({ label: "ACARS Hub Server" }),
    timestamp(),
    acarshub_format
  ),
});

const logger = master_logger.child({ source: "ACARS Hub Server" });

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

if (options.EnableAcars) {
  logger.info("Starting ACARS receivers");
  options.AcarsSource.forEach((source) => {
    const acars_server = new MessageReceiver(
      "acars",
      source,
      master_logger.child({ source: "ACARS Receiver" })
    );
    acars_server.watch_for_messages();
  });
}

if (options.EnableVdlm) {
  logger.info("Starting VDLM receivers");
  options.VdlmSource.forEach((source) => {
    const vdlm_server = new MessageReceiver(
      "vdlm",
      source,
      master_logger.child({ source: "VDLM Receiver" })
    );
    vdlm_server.watch_for_messages();
  });
}

if (options.EnableAdsb && typeof options.AdsbSource === "string") {
  logger.info("Starting ADSB receivers");
  const adsb_receiver = new ADSBReceiver(
    options.AdsbSource,
    options.AdsbPort,
    aircraft_handler,
    master_logger.child({ source: "ADSB Receiver" })
  );
  adsb_receiver.continous_fetch_adsb();
}

logger.info(`Server started with log level ${log_level.toUpperCase()}`);
