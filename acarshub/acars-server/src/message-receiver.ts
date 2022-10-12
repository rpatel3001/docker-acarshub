const zmq = require("zeromq");
import { Logger } from "winston";
import { AircraftHandler } from "./aircraft-handler";
import { decode_acars_message } from "./acars-decoder";
export class MessageReceiver {
  private _message_type: string;
  private _source_url: string;
  private _logger: Logger;
  private _sock = new zmq.Subscriber();
  private _handler;

  constructor(
    message_type: string,
    source_url: string,
    handler: AircraftHandler,
    logger: Logger
  ) {
    this._message_type = message_type;
    this._source_url = source_url;
    this._logger = logger;
    this._handler = handler;
  }

  watch_for_messages = async (): Promise<void> => {
    this._sock.connect(`tcp://${this._source_url}`);
    this._sock.subscribe("");
    this._logger.info(`ZMQ Connection to ${this._source_url} estbalished`);

    for await (const [topic, msg] of this._sock) {
      this._logger.verbose(
        `ZMQ Message on topic ${topic.toString()} containing message: ${msg.toString()}`
      );
      try {
        this._handler.process_acars_message(JSON.parse(msg.toString()));
      } catch (e) {
        this._logger.error(`Error processing message: ${e}`);
      }
    }

    this._logger.info("ZMQ Connection to ${this._source_url} closed");
  };

  close = async (): Promise<void> => {
    this._logger.info(`Closing ZMQ Connection to ${this._source_url}`);
    this._sock.disconnect(`tcp://${this._source_url}`);
    this._logger.info(`ZMQ Connection to ${this._source_url} closed`);
  };
}
