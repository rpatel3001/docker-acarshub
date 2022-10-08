import { ADSBPosition } from "types/src";
import { v4 as uuidv4 } from "uuid";

export class Aircraft {
  private adsb_positions: ADSBPosition[] = [];
  private acars_positions: ADSBPosition[] = [];
  private _icao_hex: string | undefined;
  private _registration: string | undefined;
  private _callsign: string | undefined;
  private _uid: string;
  private _last_adsb_position_time: number | undefined;
  private _last_acars_time: number | undefined;

  constructor(adsb: ADSBPosition | undefined) {
    this._uid = uuidv4();

    if (adsb) {
      this._icao_hex = adsb.hex;
      this._registration = adsb.r;
      this._callsign = adsb.flight;
      this._last_adsb_position_time = adsb.now;
      this.adsb_positions.push(adsb);
    }
  }

  update_adsb_position = (adsb_position: ADSBPosition): void => {
    // Reject old positions and positions that are less than 10 seconds old
    if (
      this._last_adsb_position_time &&
      (this._last_adsb_position_time > adsb_position.now ||
        adsb_position.now - this._last_adsb_position_time < 10)
    )
      return;

    // There is a possibility that the aircraft is broadcasting a shit hex.
    // We will only use the hex if we don't have a hex already
    // The more correct hex source is going to be ACARS

    if (!this._icao_hex) {
      this._icao_hex = adsb_position.hex;
    }

    if (this._registration !== adsb_position.r) {
      this._registration = adsb_position.r;
    }

    if (this._callsign !== adsb_position.flight) {
      this._callsign = adsb_position.flight;
    }

    this._last_adsb_position_time = adsb_position.now;
    this.adsb_positions.push(adsb_position);
  };

  is_plane_old(old: number, old_acars: number): boolean {
    // console.log(this.last_adsb_position_time, old);
    const is_adsb_old = !this._last_adsb_position_time
      ? true
      : this._last_adsb_position_time < old;

    const is_acars_old = !this._last_acars_time
      ? true
      : this._last_acars_time < old_acars;

    return is_adsb_old && is_acars_old;
  }

  get uid(): string {
    return this._uid;
  }

  get icao_hex(): string | undefined {
    return this._icao_hex;
  }

  set icao_hex(icao_hex: string | undefined) {
    this._icao_hex = icao_hex;
  }

  get registration(): string | undefined {
    return this._registration;
  }

  set registration(registration: string | undefined) {
    this._registration = registration;
  }

  get callsign(): string | undefined {
    return this._callsign;
  }

  set callsign(icao_callsign: string | undefined) {
    this._callsign = icao_callsign;
  }

  get last_adsb_position_time(): number | undefined {
    return this._last_adsb_position_time;
  }

  set last_adsb_position_time(last_adsb_position_time: number | undefined) {
    this._last_adsb_position_time = last_adsb_position_time;
  }
}
