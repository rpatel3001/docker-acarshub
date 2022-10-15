import { ACARSHubMessage, ADSBPosition } from "types/src";
import { v4 as uuidv4 } from "uuid";

export class Aircraft {
  private _adsb_positions: ADSBPosition[] = [];
  private _acars_messages: ACARSHubMessage[] = [];
  private _icao_hex: string | undefined;
  private _registration: string | undefined;
  private _callsign: string | undefined;
  private _uid: string;
  private _last_adsb_position_time: number;
  private _last_acars_time: number;

  constructor(
    adsb: ADSBPosition | undefined = undefined,
    acars: ACARSHubMessage | undefined = undefined
  ) {
    this._uid = uuidv4();
    this._last_adsb_position_time = 0;
    this._last_acars_time = 0;

    if (adsb) {
      this._icao_hex = adsb.hex;
      this._registration = adsb.r;
      this._callsign = adsb.callsign;
      this._last_adsb_position_time = adsb.now;
      this._adsb_positions.push(adsb);

      return;
    }

    if (acars) {
      this._icao_hex = acars.icao_hex;
      this._registration = acars.tail;
      this._callsign = acars.icao_callsign;
      this._last_acars_time = acars.timestamp;

      return;
    }
  }

  update_acars_messages(acars: ACARSHubMessage): void {
    this._last_acars_time = acars.timestamp;

    if (this.callsign !== acars.icao_callsign)
      this.callsign = acars.icao_callsign;
    if (this.icao_hex !== acars.icao_hex) this.icao_hex = acars.icao_hex;
    if (this.registration !== acars.tail) this.registration = acars.tail;
    this._acars_messages.push(acars);
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

    if (this._callsign !== adsb_position.callsign) {
      this._callsign = adsb_position.callsign;
    }

    this._last_adsb_position_time = adsb_position.now;
    this._adsb_positions.push(adsb_position);
  };

  is_plane_old(old_adsb: number, old_acars: number): boolean {
    return this.is_adsb_old(old_adsb) && this.is_acars_old(old_acars);
  }

  is_acars_old(old_acars: number): boolean {
    return this._last_acars_time < old_acars;
  }

  is_adsb_old(old_adsb: number): boolean {
    return this._last_adsb_position_time < old_adsb;
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

  get last_adsb_position_time(): number {
    return this._last_adsb_position_time;
  }

  set last_adsb_position_time(last_adsb_position_time: number) {
    this._last_adsb_position_time = last_adsb_position_time;
  }

  get acars_messages_count(): number {
    return this._acars_messages.length;
  }
}
