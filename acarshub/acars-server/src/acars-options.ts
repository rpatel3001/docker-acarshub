const commandLineArgs = require("command-line-args");
import { ACARSCommandLine, CommandLineOption } from "types/src";

const commandOptions: ACARSCommandLine = [
  {
    name: "db-save-all",
    type: Boolean,
    default: false,
  },
  {
    name: "db-save-days",
    type: Number,
    default: 7,
    validator: (value): boolean => value > 0,
  },
  {
    name: "db-alert-save-days",
    type: Number,
    default: 120,
    validator: (value): boolean => value > 0,
  },
  {
    name: "iata-override",
    type: String,
    multiple: true,
    default: undefined,
    validator: (value: any): boolean => {
      let was_good = true;
      value.forEach((v: string) => {
        const split = v.split("|");
        if (split.length !== 3) {
          console.error(
            "Invalid IATA override: " + v + " (must be IATA|ICAO|Name)"
          );
          was_good = false;
        }
        if (split[0] && split[0].length !== 2) {
          console.error(
            "Invalid IATA override: " +
              split[0] +
              " (IATA must be 2 characters)"
          );
          was_good = false;
        }
        if (split[1] && split[1].length !== 3) {
          console.error(
            "Invalid IATA override: " +
              split[1] +
              " (ICAO must be 3 characters)"
          );
          was_good = false;
        }
        if (split[2] && split[2].length < 1) {
          console.error(
            "Invalid IATA override: " +
              split[2] +
              " (Name must be at least 1 character)"
          );
          was_good = false;
        }
      });

      return was_good;
    },
  },
  {
    name: "tar1090url",
    type: String,
    default: "https://globe.adsbexchange.com/?icao=",
    format_corrector: (value: any): string => {
      if (!value.endsWith("/")) {
        value = value + "/";
      }

      return value + "?icao=";
    },
    validator: (value: any): boolean => {
      let was_good = true;
      console.log(value.startsWith("http"));
      if (!value.startsWith("http") && !value.startsWith("https")) {
        console.error(
          "Invalid tar1090 URL: " + value + " (must start with http or https)"
        );
        was_good = false;
      }

      return was_good;
    },
  },
  {
    name: "log-level",
    type: Number,
    default: 3,
    validator: (value: any): boolean => {
      if (value < 3 || value > 6) {
        console.error("Invalid log level: " + value + " (must be 3-5)");
        return false;
      }
      return true;
    },
  },
  { name: "enable-adsb", type: Boolean, default: false },
  {
    name: "adsb-url",
    type: String,
    default: undefined,
    validator: (value: any): boolean => {
      let was_good = true;
      if (value.indexOf("http") !== 0 || value.indexOf("https") !== 0) {
        console.error(
          "Invalid ADSB URL: " + value + " (must start with http or https)"
        );
        was_good = false;
      }

      if (!value.endsWith("/data/aircraft.json")) {
        console.error(
          "Invalid ADSB URL: " + value + " (must end with /data/aircraft.json)"
        );
        was_good = false;
      }

      return was_good;
    },
  },
  {
    name: "adsb-lat",
    type: Number,
    default: undefined,
    validator: (value: any): boolean => {
      if (value < -90 || value > 90) {
        console.error(
          "Invalid ADSB latitude: " + value + " (must be -90 to 90)"
        );
        return false;
      }
      return true;
    },
  },
  {
    name: "adsb-lon",
    type: Number,
    default: undefined,
    validator: (value: any): boolean => {
      if (value < -180 || value > 180) {
        console.error(
          "Invalid ADSB longitude: " + value + " (must be -180 to 180)"
        );
        return false;
      }
      return true;
    },
  },
  { name: "adsb-disable-range-rings", type: Boolean, default: false },
  { name: "enable-acars", type: Boolean, default: false },
  { name: "enable-vdlm", type: Boolean, default: false },
  {
    name: "acars-source",
    type: String,
    multiple: true,
    default: "acars_router",
  },
  {
    name: "vdlm-source",
    type: String,
    multiple: true,
    default: "acars_router",
  },
];

const options: { [index: string]: CommandLineOption } =
  commandLineArgs(commandOptions);
// TODO: Can we type this correctly? Would be nice to ensure that as we add options the options are acceptable.....
// Although, further thinking, the command line parser will fail if the user supplied shit option names or whatever
const output_options: {
  [index: string]: any;
} = new Proxy(
  {},
  {
    get(target, name, receiver) {
      if (!Reflect.has(target, name)) {
        return undefined;
      }
      return Reflect.get(target, name, receiver);
    },
    set(target, name, value, receiver) {
      return Reflect.set(target, name, value, receiver);
    },
  }
);

commandOptions.forEach((option: CommandLineOption) => {
  const name = option.name;
  if (option.validator && options.hasOwnProperty(name)) {
    if (!option.validator(options[name])) {
      console.error(`Invalid value for option ${option.name}`);
      process.exit(1);
    }
  }

  let getter_name = `${name
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index == 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "")
    .replace(/-/g, "")}`;
  getter_name = getter_name.charAt(0).toUpperCase() + getter_name.substring(1);

  if (!options.hasOwnProperty(name)) {
    output_options[getter_name] = option.default;
  } else {
    output_options[getter_name] = option.format_corrector
      ? option.format_corrector(options[name])
      : options[name];
  }
});

module.exports.options = output_options;
