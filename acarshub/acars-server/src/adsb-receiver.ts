import { Logger } from "winston";

export class ADSBReceiver {
  private _adsb_url: string;
  private _interval: number;
  private _logger: Logger;

  constructor(adsb_url: string, logger: Logger) {
    this._adsb_url = adsb_url;
    this._interval = 0;
    this._logger = logger;
  }

  continous_fetch_adsb = () => {
    if (this._interval !== 0) clearInterval(this._interval);

    setInterval(() => {
      this.fetch_adsb();
    }, 5000);
  };

  fetch_adsb = async () => {
    try {
      const response = await fetch(this._adsb_url);
      if (!response.ok)
        throw new Error(`unexpected response ${response.statusText}`);
      const data = await response.json();
      this._logger.debug(JSON.stringify(data));
    } catch (err) {
      this._logger.error(err);
    }
  };
}
