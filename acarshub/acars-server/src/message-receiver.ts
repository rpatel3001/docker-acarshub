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
  private _handler: AircraftHandler;

  private _total_messages: number = 0;
  private _total_messages_since_last_update: number = 0;
  private _total_errors_since_last_update: number = 0;
  private _total_message_last_five_minutes: number = 0;

  private _interval;

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

    this._interval = setInterval(() => this.print_totals(), 5 * 60000);
  }

  get_message_type = (): string => {
    return this._message_type;
  };

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
          JSON.parse(msg.toString()),
          this._message_type
        );

        if (decoded_message) {
          this.increment_totals(decoded_message.error);
          this._handler.process_acars_message(decoded_message);
        }
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

  increment_totals(error: number): void {
    this._total_messages += 1;
    this._total_messages_since_last_update += 1;
    this._total_message_last_five_minutes += 1;
    if (error) {
      this._total_errors_since_last_update += 1;
    }
  }

  print_totals(): void {
    this._logger.info(
      `Total ${this._message_type.toUpperCase()} messages for ${
        this._source_url
      }: ${this._total_message_last_five_minutes} in the last five minutes`
    );
    this._logger.info(
      `Total ${this._message_type.toUpperCase()} messages for ${
        this._source_url
      }: ${this._total_messages}`
    );

    this._total_message_last_five_minutes = 0;
  }

  grab_rrd_stats() {
    if (!this._logger) {
      console.log("PANIC!", this);
      return {
        error: 0,
        total: 0,
      };
    }
    this._logger.debug(
      `Total ${this._message_type.toUpperCase()} messages for ${
        this._source_url
      } in the last minute: ${this._total_messages_since_last_update}`
    );
    this._logger.debug(
      `Total ${this._message_type.toUpperCase()} messages for ${
        this._source_url
      }: ${this._total_messages}`
    );

    const output = {
      error: this._total_errors_since_last_update,
      total: this._total_messages_since_last_update,
    };

    this._total_messages_since_last_update = 0;
    this._total_errors_since_last_update = 0;

    return output;
  }
}
