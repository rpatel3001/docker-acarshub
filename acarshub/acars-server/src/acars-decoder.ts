import {
  ACARSHubMessage,
  ACARSMessage,
  dumpVDL2Message,
  ICAOOverride,
} from "types/src";
import { ConvertIATAtoICAO } from "./iata-to-icao";

export class convertACARS {
  private _iata_to_icao;

  constructor(iata_file_path: string, iata_overrides: ICAOOverride) {
    this._iata_to_icao = new ConvertIATAtoICAO(iata_file_path, iata_overrides);
  }

  decode_acars_message = (
    message: ACARSMessage | dumpVDL2Message,
    message_type: string
  ): ACARSHubMessage | undefined => {
    if (!message.hasOwnProperty("vdl2")) {
      return this.process_acars_message(message as ACARSMessage, message_type);
    } else {
      return this.process_dumpvdl2_message(message as dumpVDL2Message);
    }
  };

  process_dumpvdl2_message = (message: dumpVDL2Message): ACARSHubMessage => {
    const icao_hex =
      message.vdl2.avlc.src.type === "Aircraft"
        ? message.vdl2.avlc.src.addr
        : undefined;

    const callsign = message.vdl2.avlc.acars?.flight
      ? message.vdl2.avlc.acars.flight
      : undefined;
    const icao_callsign = callsign
      ? this._iata_to_icao.getICAO(callsign)
      : undefined;
    const tail = message.vdl2.avlc.acars?.reg
      ? message.vdl2.avlc.acars.reg.replace(".", "")
      : undefined;
    const sequence = message.vdl2.avlc.acars?.msg_num
      ? [message.vdl2.avlc.acars.msg_num + message.vdl2.avlc.acars.msg_num_seq]
      : [];

    return {
      type: "VDLM2",
      timestamp: Number(
        message.vdl2.t.sec.toString() + "." + message.vdl2.t.usec.toString()
      ),
      icao_hex: icao_hex,
      iata_callsign: callsign,
      iata_callsign_normalized: this.normalize_callsign(callsign),
      icao_callsign: icao_callsign,
      icao_callsign_normalized: this.normalize_callsign(icao_callsign),
      tail: tail,
      label: message.vdl2.avlc.acars?.label,
      text: message.vdl2.avlc.acars?.msg_text,
      duplicate: false,
      num_duplicates: 0,
      message_number: message.vdl2.avlc.acars?.msg_num
        ? message.vdl2.avlc.acars.msg_num + message.vdl2.avlc.acars.msg_num_seq
        : undefined,
      all_message_numbers: sequence,
      error: Number(message.vdl2.avlc.acars?.err || 0),
    } as ACARSHubMessage;
  };

  process_acars_message = (
    message: ACARSMessage,
    message_type: String
  ): ACARSHubMessage => {
    const sequence = message.msgno ? [message.msgno] : [];

    return {
      type: message_type,
      timestamp: message.timestamp,
      icao_hex: message.icao?.toString(16),
      iata_callsign: message.flight,
      iata_callsign_normalized: this.normalize_callsign(message.flight),
      icao_callsign: message.flight
        ? this._iata_to_icao.getICAO(message.flight)
        : undefined,
      icao_callsign_normalized: message.flight
        ? this.normalize_callsign(this._iata_to_icao.getICAO(message.flight))
        : undefined,
      tail: message.tail,
      label: message.label,
      text: message.text,
      duplicate: false,
      num_duplicates: 0,
      message_number: message.msgno,
      all_message_numbers: sequence,
      error: message.error,
    } as ACARSHubMessage;
  };

  normalize_callsign(callsign: string | undefined): string | undefined {
    if (!callsign) return undefined;
    const index_of_first_number = callsign!.search(/[0-9]/);
    if (index_of_first_number === -1) return undefined;

    return (
      callsign!.substring(0, index_of_first_number) +
      Number(callsign!.substring(index_of_first_number))
    );
  }
}
