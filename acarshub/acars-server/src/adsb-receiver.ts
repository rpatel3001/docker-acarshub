export class ADSBReceiver {
  private _adsb_url: string;
  private _interval: number;
  constructor(adsb_url: string) {
    this._adsb_url = adsb_url;
    this._interval = 0;
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
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  };
}
