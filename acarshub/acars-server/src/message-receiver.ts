const zmq = require("zeromq");
import { Logger } from "winston";

export class MessageReceiver {
  private _message_type: string;
  private _source_url: string;
  private _logger: Logger;

  constructor(message_type: string, source_url: string, logger: Logger) {
    this._message_type = message_type;
    this._source_url = source_url;
    this._logger = logger;
  }

  watch_for_messages = async () => {
    const sock = new zmq.Subscriber();

    sock.connect(`tcp://${this._source_url}`);
    sock.subscribe("");
    this._logger.info(`ZMQ Connection to ${this._source_url} estbalished`);

    for await (const [topic, msg] of sock) {
      this._logger.verbose(
        `ZMQ Message on topic ${topic.toString()} containing message: ${msg.toString()}`
      );
    }
  };
}
