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
  }

  continous_fetch_adsb = (): void => {
    // TODO: Should we recreate the socket every time, or just if the socket doesn't exist?
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
            this._aircraft_handler.process_adsb_position(
              JSON.parse(unprocessed)
            );
            unprocessed = "";
          } catch (e) {
            this._logger.error(e);
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
      setTimeout(this.continous_fetch_adsb, this.increment_reconnect_delay());
    });

    this._client.on("error", (err) => {
      this._logger.error("ADSB Connection error: " + err);
      this._logger.error("Reconnecting in 15 seconds");
      setTimeout(this.continous_fetch_adsb, this.increment_reconnect_delay());
    });
  };

  increment_reconnect_delay = (): number => {
    this._reconnect_delay = Math.min(this._reconnect_delay * 2, 60000);

    return this._reconnect_delay;
  };

  reset_reconnect_delay = (): void => {
    this._reconnect_delay = 15000;
  };
}
