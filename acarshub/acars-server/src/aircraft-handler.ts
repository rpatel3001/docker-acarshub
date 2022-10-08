import { ADSBPosition } from "types/src";
import { Aircraft } from "./aircraft";

export class AircraftHandler {
  private _aircrafts: Aircraft[] = [];

  constructor() {}

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

    console.log("creating new aircraft");

    aircraft = new Aircraft(adsb_position);
    this._aircrafts.push(aircraft);
  };
}
