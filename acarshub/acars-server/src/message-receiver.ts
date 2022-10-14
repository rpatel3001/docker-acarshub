const zmq = require("zeromq");
import { Logger } from "winston";
import { AircraftHandler } from "./aircraft-handler";
import { convertACARS } from "./acars-decoder";
export class MessageReceiver {
  private _message_type: string;
  private _source_url: string;
  private _logger: Logger;
  private _sock = new zmq.Subscriber();
  private _acars_converter: convertACARS;
  private _handler;

  constructor(
    message_type: string,
    source_url: string,
    handler: AircraftHandler,
    acars_converter: convertACARS,
    logger: Logger
  ) {
    this._message_type = message_type;
    this._source_url = source_url;
    this._logger = logger;
    this._handler = handler;
    this._acars_converter = acars_converter;
  }

  watch_for_messages = async (): Promise<void> => {
    this._sock.connect(`tcp://${this._source_url}`);
    this._sock.subscribe("");
    this._logger.info(`ZMQ Connection to ${this._source_url} established`);

    for await (const [topic, msg] of this._sock) {
      this._logger.silly(
        `ZMQ Message on topic ${topic.toString()} containing message: ${msg.toString()}`
      );
      try {
        const decoded_message = this._acars_converter.decode_acars_message(
          JSON.parse(msg.toString())
        );
        if (decoded_message)
          this._handler.process_acars_message(decoded_message);
      } catch (e) {
        this._logger.error(`Error processing message: ${e}`);
      }
    }

    this._logger.info(`ZMQ Connection to ${this._source_url} closed`);
  };

  close = async (): Promise<void> => {
    this._logger.info(`Closing ZMQ Connection to ${this._source_url}`);
    this._sock.disconnect(`tcp://${this._source_url}`);
    this._logger.info(`ZMQ Connection to ${this._source_url} closed`);
  };
}
