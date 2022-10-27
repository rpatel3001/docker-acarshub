import { ACARSDecodedMessage, ACARSHubMessage, ADSBPosition } from "types/src";
import { v4 as uuidv4 } from "uuid";
import { MessageDecoder } from "@airframes/acars-decoder/dist/MessageDecoder";

export class Aircraft {
  private _adsb_positions: ADSBPosition[] = [];
  private _acars_messages: ACARSHubMessage[] = [];
  private _icao_hex: string | undefined;
  private _registration: string | undefined;
  private _callsign: string | undefined;
  private _icao_callsign_normalized: string | undefined;
  private _iata_callsign_normalized: string | undefined;
  private _uid: string;
  private _last_adsb_position_time: number;
  private _last_acars_time: number;
  private _is_squitter = false;
  private _squitter_id: string | undefined = undefined;
  private _decoder: MessageDecoder = new MessageDecoder();

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
      this._icao_callsign_normalized = adsb.callsign_normalized;
      return;
    }

    if (acars) {
      this._icao_hex = acars.icao_hex;
      this._registration = acars.tail;
      this._callsign = acars.icao_callsign;
      this._last_acars_time = acars.timestamp;
      this._iata_callsign_normalized = acars.iata_callsign_normalized;
      this._icao_callsign_normalized = acars.icao_callsign_normalized;

      if (acars.label === "SQ") {
        this._is_squitter = true;
        this._squitter_id = acars.text;
      }

      acars.decoded_message_text = this.generate_decoded_message(acars);
      this._acars_messages.push(acars);

      return;
    }
  }

  update_acars_messages(acars: ACARSHubMessage): void {
    this._last_acars_time = acars.timestamp;

    if (!this._is_squitter) {
      if (this.callsign !== acars.icao_callsign)
        this.callsign = acars.icao_callsign;
      if (this.icao_hex !== acars.icao_hex) this.icao_hex = acars.icao_hex;
      if (this.registration !== acars.tail) this.registration = acars.tail;
      if (this._icao_callsign_normalized !== acars.icao_callsign_normalized)
        this._icao_callsign_normalized = acars.icao_callsign_normalized;
      if (this._iata_callsign_normalized !== acars.iata_callsign_normalized)
        this._iata_callsign_normalized = acars.iata_callsign_normalized;
    }

    const index = this.find_message_index(acars);

    if (index === -1) {
      acars.decoded_message_text = this.generate_decoded_message(acars);
      this._acars_messages.push(acars);
    } else {
      //console.log("Duplicate found", this._acars_messages[index], acars);
      this._acars_messages[index].num_duplicates++;
      this._acars_messages[index].duplicate = true;
      this._acars_messages[index].timestamp = acars.timestamp;
    }
  }

  generate_decoded_message(
    acars: ACARSHubMessage
  ): ACARSDecodedMessage | undefined {
    if (!acars.text) return undefined;

    try {
      const decoded: ACARSDecodedMessage = this._decoder.decode(acars);
      return decoded.decoded ? decoded : undefined;
    } catch (e) {
      console.log("Error Decoding message", e);
      return undefined;
    }
  }

  find_message_index(acars: ACARSHubMessage): number {
    return this._acars_messages.findIndex((message) => {
      return message.text === acars.text && message.label === acars.label;
    });
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

  get iata_callsign_normalized(): string | undefined {
    return this._iata_callsign_normalized;
  }

  get icao_callsign_normalized(): string | undefined {
    return this._icao_callsign_normalized;
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

  get is_squitter(): boolean | undefined {
    return this._is_squitter;
  }

  get squitter_id(): string | undefined {
    return this._squitter_id;
  }
}
