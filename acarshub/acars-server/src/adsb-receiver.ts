import { Logger } from "winston";
import * as net from "net";
import { AircraftHandler } from "./aircraft-handler";

export class ADSBReceiver {
  private _adsb_source: string;
  private _adsb_port: number;
  private _logger: Logger;
  private _client: net.Socket | undefined;
  private _reconnect_delay = 15000;
  private _aircraft_handler: AircraftHandler;

  private _total_positions: number = 0;
  private _total_positions_since_last_update: number = 0;
  private _interval;

  constructor(
    adsb_source: string,
    port: number,
    aircraft_handler: AircraftHandler,
    logger: Logger
  ) {
    this._adsb_source = adsb_source;
    this._adsb_port = port;
    this._logger = logger;
    this._aircraft_handler = aircraft_handler;
    this._interval = setInterval(() => this.print_stats(), 5 * 60000);
  }

  continous_receive_adsb = (): void => {
    // TODO: Should we recreate the socket every time, or just if the socket doesn't exist?
    //TODO: We need to create a ADSB class to fix certain issues with the data
    // Such as, flight ends with a space, normalize callsigns, etc

    let unprocessed = "";
    if (this._client) {
      this._client.destroy();
      this._client = undefined;
    }
    this._client = new net.Socket();
    this._client.connect(this._adsb_port, this._adsb_source, () => {
      this._logger.info("Connected to ADSB Receiver");
      this.reset_reconnect_delay();
    });

    this._client.on("data", (data) => {
      const data_split = data.toString().split(/[\n\r]/g);

      if (data_split.length === 0) return;

      data_split.forEach((message) => {
        if (message === "") {
          return;
        }

        unprocessed += message;
        if (unprocessed.endsWith("}")) {
          try {
            const processed_message = JSON.parse(unprocessed);
            Object.defineProperty(processed_message, "callsign", {
              get: function () {
                return this.flight?.trim().replace(/[~\.]/g, "");
              },
            });
            Object.defineProperty(processed_message, "callsign_normalized", {
              get: function () {
                if (!this.callsign) return undefined;
                const index_of_first_number = this.callsign!.search(/[0-9]/);
                if (index_of_first_number === -1) return undefined;

                return (
                  this.callsign!.substring(0, index_of_first_number) +
                  Number(this.callsign!.substring(index_of_first_number))
                );
              },
            });
            processed_message.old_hex = processed_message.hex;
            Object.defineProperty(processed_message, "hex", {
              get: function () {
                if (this.old_hex?.startsWith("~")) return undefined;

                return this.old_hex?.toUpperCase().replace(/[~\.]/g, "");
              },
            });
            processed_message.old_r = processed_message.r;
            Object.defineProperty(processed_message, "r", {
              get: function () {
                return this.old_r?.toUpperCase().replace(/[~\.]/g, "");
              },
            });
            this._aircraft_handler.process_adsb_position(processed_message);
            this.increment_counter();
          } catch (e) {
            this._logger.error(e);
            this._logger.info(`Received ADSB message: ${unprocessed}`);
          } finally {
            unprocessed = "";
          }
        }
      });
    });

    this._client.on("close", () => {
      this._logger.info("ADSB Connection closed");
      if (this._client) {
        this._client.removeAllListeners("data");
        this._client.removeAllListeners("error");
      }

      this._logger.info("Reconnecting to ADSB Receiver");
      this._logger.info("Reconnecting in 15 seconds");
      setTimeout(this.continous_receive_adsb, this.increment_reconnect_delay());
    });

    this._client.on("error", (err) => {
      this._logger.error("ADSB Connection error: " + err);
      this._logger.error("Reconnecting in 15 seconds");
      setTimeout(this.continous_receive_adsb, this.increment_reconnect_delay());
    });
  };

  // TODO: actually increment the counter
  increment_reconnect_delay = (): number => {
    this._reconnect_delay = Math.min(this._reconnect_delay * 2, 60000);

    return this._reconnect_delay;
  };

  reset_reconnect_delay = (): void => {
    this._reconnect_delay = 15000;
  };

  async close(): Promise<void> {
    if (this._client) {
      this._logger.info("Closing ADSB connection");
      this._client.destroy();
      this._logger.info("Closed ADSB connection");
    }
    clearInterval(this._interval);
  }

  print_stats = (): void => {
    this._logger.info(
      `Total ADSB positions for ${this._adsb_source}: ${this._total_positions}`
    );
    this._logger.info(
      `Total ADSB positions for ${this._adsb_source} in the last five minutes: ${this._total_positions_since_last_update}`
    );
    this._total_positions_since_last_update = 0;
  };

  increment_counter = (): void => {
    this._total_positions += 1;
    this._total_positions_since_last_update += 1;
  };
}