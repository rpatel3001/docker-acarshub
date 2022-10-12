import { ACARSHubMessage, ACARSMessage, dumpVDL2Message } from "types/src";

export const decode_acars_message = (
  message: ACARSMessage | dumpVDL2Message
): ACARSHubMessage | undefined => {
  if (!message.hasOwnProperty("vdl2")) {
    return process_acars_message(message as ACARSMessage);
  }

  return undefined;
};

const process_acars_message = (message: ACARSMessage): ACARSHubMessage => {
  return {
    timestamp: message.timestamp,
    icao_hex: message.icao?.toString(16),
    callsign: message.flight, // TODO: normalize IATA to ICAO here
    tail: message.tail,
  } as ACARSHubMessage;
};
