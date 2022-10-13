import { ACARSHubMessage, ACARSMessage, dumpVDL2Message } from "types/src";

export const decode_acars_message = (
  message: ACARSMessage | dumpVDL2Message
): ACARSHubMessage | undefined => {
  if (!message.hasOwnProperty("vdl2")) {
    return process_acars_message(message as ACARSMessage);
  } else {
    return process_dumpvdl2_message(message as dumpVDL2Message);
  }
};

const process_dumpvdl2_message = (
  message: dumpVDL2Message
): ACARSHubMessage => {
  const icao_hex =
    message.vdl2.avlc.src.type === "Aircraft"
      ? message.vdl2.avlc.src.addr
      : undefined;

  const callsign = message.vdl2.avlc.acars?.flight
    ? message.vdl2.avlc.acars.flight
    : undefined;
  const tail = message.vdl2.avlc.acars?.reg
    ? message.vdl2.avlc.acars.reg.replace(".", "")
    : undefined;

  //   console.log(icao_hex, callsign, tail);
  return {
    timestamp: Number(
      message.vdl2.t.sec.toString() + "." + message.vdl2.t.usec.toString()
    ),
    icao_hex: icao_hex,
    callsign: callsign, // TODO: normalize IATA to ICAO
    tail: tail,
  } as ACARSHubMessage;
};

const process_acars_message = (message: ACARSMessage): ACARSHubMessage => {
  return {
    timestamp: message.timestamp,
    icao_hex: message.icao?.toString(16),
    callsign: message.flight, // TODO: normalize IATA to ICAO here
    tail: message.tail,
  } as ACARSHubMessage;
};
