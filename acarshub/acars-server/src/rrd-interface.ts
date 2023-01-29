const rrdtool = require("rrdtool");
const fs = require("fs");
import { Logger } from "winston";
export class ACARSHubRRDTool {
  private _rrd_db;
  private _logger: Logger;

  constructor(rrdtool_path: string, logger: Logger) {
    this._logger = logger;
    this._rrd_db = this.init_rrd(rrdtool_path, rrdtool.now() - 10);
  }

  init_rrd = (rrd_file: string, start_time: number) => {
    try {
      if (fs.existsSync(rrd_file)) {
        this._logger.info("RRD file exists, loading");
        return rrdtool.open(rrd_file);
      }

      console.log("RRD file does not exist, creating");
      let db = rrdtool.create(rrd_file, { start: start_time, step: 60 }, [
        "DS:ACARS:GAUGE:120:U:U",
        "DS:VDLM:GAUGE:120:U:U",
        "DS:TOTAL:GAUGE:120:U:U",
        "DS:ERROR:GAUGE:120:U:U",
        "RRA:AVERAGE:0.5:1:1500", // 25 hours at 1 minute reso
        "RRA:AVERAGE:0.5:5:8640", // 1 month at 5 minute reso
        "RRA:AVERAGE:0.5:60:4320", // 6 months at 1 hour reso
        "RRA:AVERAGE:0.5:360:4380", // 3 year at 6 hour reso
      ]);

      return db;
    } catch (e) {
      this._logger.error(`Error creating RRD file: ${e}`);
    }
  };

  update_rrd = (acars: number, vdlm: number, total: number, error: number) => {
    this._logger.debug(`Updating RRD: ${acars}, ${vdlm}, ${total}, ${error}`);
    this._rrd_db.update(rrdtool.now(), {
      ACARS: acars,
      VDLM: vdlm,
      TOTAL: total,
      ERROR: error,
    });
  };
}
