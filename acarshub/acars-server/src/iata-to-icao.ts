import { readFile } from "fs/promises";
import { IATAtoICAO, ICAO } from "types/src";

export class ConvertIATAtoICAO {
  private _iata: IATAtoICAO = {};
  constructor(
    file_path: string,
    overrides: { name: string; iata: string; icao: string }[]
  ) {
    this.loadIATA(file_path, overrides);
  }

  private async loadIATA(
    file_path: string,
    overrides: { name: string; iata: string; icao: string }[] | undefined
  ): Promise<void> {
    try {
      const data = await readFile(file_path);
      this._iata = JSON.parse(data.toString());
    } catch (e) {
      console.log(e);
    }
    console.log(overrides);
    if (overrides) {
      overrides.forEach((override) => {
        this._iata[override.iata] = {
          ICAO: override.icao,
          NAME: override.name,
        };
      });
    }
  }

  public onlyIATACallsign(iata: String): string | undefined {
    if (iata.length <= 2) return undefined;

    return this.getICAO(iata.substring(0, 2));
  }

  public onlyFlightNumber(iata: string): string | undefined {
    if (iata.length <= 2) return undefined;

    return iata.substring(2);
  }

  public getICAO(iata: string): string | undefined {
    const iata_sub = this.onlyIATACallsign(iata);
    if (iata_sub)
      return this._iata[iata_sub]?.ICAO + this.onlyFlightNumber(iata);

    return undefined;
  }

  public getName(iata: string): string | undefined {
    const iata_sub = this.onlyIATACallsign(iata);

    return iata_sub ? this._iata[iata_sub]?.NAME : undefined;
  }

  public getIATAtoICAO(iata: string): ICAO | undefined {
    const iata_sub = this.onlyIATACallsign(iata);

    return iata_sub ? this._iata[iata_sub] : undefined;
  }
}
