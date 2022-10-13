import { ACARSHubMessage, ACARSMessage, ADSBPosition } from "types/src";
import { Aircraft } from "./aircraft";
import { Logger } from "winston";

export class AircraftHandler {
  private _aircraft: Map<String, Aircraft> = new Map();
  private _logger: Logger;
  private _ids: Map<String, String> = new Map(); // the id, and the plane's uid

  constructor(logger: Logger) {
    setInterval(this.prune_aircrafts, 10000);
    this._logger = logger;
  }

  find_aircraft_by_adsb_position = (
    adsb_position: ADSBPosition
  ): Aircraft | undefined => {
    if (adsb_position.hex) {
      const aircraft = this._ids.get(adsb_position.hex);

      if (aircraft) return this._aircraft.get(aircraft);
    }

    if (adsb_position.r) {
      const aircraft = this._ids.get(adsb_position.r);

      if (aircraft) return this._aircraft.get(aircraft);
    }

    if (adsb_position.callsign) {
      const aircraft = this._ids.get(adsb_position.callsign);

      if (aircraft) return this._aircraft.get(aircraft);
    }

    return undefined;
  };

  find_aircraft_by_acars_message = (
    message: ACARSHubMessage
  ): Aircraft | undefined => {
    if (message.icao_hex) {
      const aircraft = this._ids.get(message.icao_hex);

      if (aircraft) return this._aircraft.get(aircraft);
    }

    if (message.tail) {
      const aircraft = this._ids.get(message.tail);

      if (aircraft) return this._aircraft.get(aircraft);
    }

    if (message.iata_callsign) {
      const aircraft = this._ids.get(message.iata_callsign);

      if (aircraft) return this._aircraft.get(aircraft);
    }

    if (message.icao_callsign) {
      const aircraft = this._ids.get(message.icao_callsign);

      if (aircraft) return this._aircraft.get(aircraft);
    }

    return undefined;
  };

  process_adsb_position = (adsb_position: ADSBPosition): void => {
    let aircraft = this.find_aircraft_by_adsb_position(adsb_position);

    if (aircraft) {
      aircraft.update_adsb_position(adsb_position);

      if (adsb_position.hex && !this._ids.has(adsb_position.hex))
        this._ids.set(adsb_position.hex, aircraft.uid);
      if (adsb_position.r) this._ids.set(adsb_position.r, aircraft.uid);
      if (adsb_position.callsign && !this._ids.has(adsb_position.callsign))
        this._ids.set(adsb_position.callsign, aircraft.uid);

      return;
    }

    aircraft = new Aircraft(adsb_position);

    if (adsb_position.hex) this._ids.set(adsb_position.hex, aircraft.uid);
    if (adsb_position.r) this._ids.set(adsb_position.r, aircraft.uid);
    if (adsb_position.callsign)
      this._ids.set(adsb_position.callsign, aircraft.uid);

    this._aircraft.set(aircraft.uid, aircraft);
  };

  process_acars_message = (acars_message: ACARSHubMessage): void => {
    let aircraft = this.find_aircraft_by_acars_message(acars_message);

    if (aircraft) {
      this._logger.debug(
        `Found aircraft ${aircraft.uid}, total: ${aircraft.acars_messages_count}`
      );
      aircraft.update_acars_messages(acars_message);
      this._logger.debug(
        `Updated aircraft ${aircraft.uid}, total messages: ${aircraft.acars_messages_count}`
      );

      if (acars_message.icao_hex && !this._ids.has(acars_message.icao_hex))
        this._ids.set(acars_message.icao_hex, aircraft.uid);
      if (acars_message.tail && !this._ids.has(acars_message.tail))
        this._ids.set(acars_message.tail, aircraft.uid);
      if (
        acars_message.iata_callsign &&
        !this._ids.has(acars_message.iata_callsign)
      )
        this._ids.set(acars_message.iata_callsign, aircraft.uid);
      if (
        acars_message.icao_callsign &&
        !this._ids.has(acars_message.icao_callsign)
      )
        this._ids.set(acars_message.icao_callsign, aircraft.uid);

      return;
    }

    aircraft = new Aircraft(undefined, acars_message);

    if (acars_message.icao_hex)
      this._ids.set(acars_message.icao_hex, aircraft.uid);
    if (acars_message.tail) this._ids.set(acars_message.tail, aircraft.uid);
    if (acars_message.iata_callsign)
      this._ids.set(acars_message.iata_callsign, aircraft.uid);
    if (acars_message.icao_callsign)
      this._ids.set(acars_message.icao_callsign, aircraft.uid);

    this._aircraft.set(aircraft.uid, aircraft);
  };

  prune_aircrafts = (): void => {
    const old = Math.floor(Date.now() / 1000) - 120;
    const old_acars = Math.floor(Date.now() / 1000) - 15 * 60;
    this._logger.debug(
      `Size of aircraft before pruning: ${this._aircraft.size}`
    );
    let ids = "";
    this._ids.forEach((value, key) => {
      ids += `${key} => ${value}\n`;
    });

    this._logger.debug(`Contents of ID: ${ids}`);

    const uuid_to_remove: String[] = [];
    let planes_with_valid_acars: number = 0;
    let planes_with_valid_adsb: number = 0;
    let planes_with_both: number = 0;

    this._aircraft.forEach((aircraft, key) => {
      if (!aircraft.is_adsb_old(old)) planes_with_valid_adsb++;
      if (!aircraft.is_acars_old(old_acars)) planes_with_valid_acars++;
      if (!aircraft.is_adsb_old(old) && !aircraft.is_acars_old(old_acars))
        planes_with_both++;

      if (aircraft.is_plane_old(old, old_acars)) {
        uuid_to_remove.push(key);
        this._aircraft.delete(key);
      }
    });

    uuid_to_remove.forEach((uuid) => {
      this._ids.forEach((value, key) => {
        if (value === uuid) this._ids.delete(key);
      });
    });

    this._logger.debug(
      `Size of aircraft after pruning: ${this._aircraft.size}`
    );
    this._logger.debug(`Planes with valid ADSB: ${planes_with_valid_adsb}`);
    this._logger.debug(`Planes with valid ACARS: ${planes_with_valid_acars}`);
    this._logger.debug(`Planes with both: ${planes_with_both}`);
  };
}
