import { ADSBPosition } from "types/src";
import { Aircraft } from "./aircraft";
import { Logger } from "winston";

export class AircraftHandler {
  private _aircrafts: Aircraft[] = [];
  private _logger: Logger;

  constructor(logger: Logger) {
    setInterval(this.prune_aircrafts, 60000);
    this._logger = logger;
  }

  process_adsb_position = (adsb_position: ADSBPosition): void => {
    let aircraft = this._aircrafts.find(
      (a) => a.icao_hex === adsb_position.hex
    );

    if (aircraft) {
      aircraft.update_adsb_position(adsb_position);
      return;
    }

    aircraft = this._aircrafts.find((a) => a.registration === adsb_position.r);

    if (aircraft) {
      aircraft.update_adsb_position(adsb_position);
      return;
    }

    aircraft = this._aircrafts.find((a) => a.callsign === adsb_position.flight);

    if (aircraft) {
      aircraft.update_adsb_position(adsb_position);
      return;
    }

    aircraft = new Aircraft(adsb_position);
    this._aircrafts.push(aircraft);
  };

  prune_aircrafts = (): void => {
    const old = Math.floor(Date.now() / 1000) - 60;
    const old_acars = Math.floor(Date.now() / 1000) - 15 * 60;
    this._logger.debug(
      `Size before pruning aircraft: ${this._aircrafts.length}`
    );
    this._aircrafts = this._aircrafts.filter(
      (a) => a.is_plane_old(old, old_acars) === false
    );

    this._logger.debug(
      `Size after pruning aircraft: ${this._aircrafts.length}`
    );
  };
}
