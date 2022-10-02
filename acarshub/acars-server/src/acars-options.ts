const commandLineArgs = require("command-line-args");
import { ACARSCommandLine, CommandLineOption } from "types/src";

const commandOptions: ACARSCommandLine = [
  { name: "db-save-all", type: Boolean, default: false },
  { name: "db-save-days", type: Number, default: 7 },
  { name: "db-alert-save-days", type: Number, default: 120 },
  {
    name: "iata-override",
    type: String,
    multiple: true,
    default: undefined,
  },
  { name: "tar1090url", type: String, multiple: true, default: undefined },
  { name: "log-level", type: Number, default: 3 },
  { name: "enable-adsb", type: Boolean, default: false },
  { name: "adsb-url", type: String, default: undefined },
  { name: "adsb-lat", type: Number, default: undefined },
  { name: "adsb-lon", type: Number, default: undefined },
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

// TODO: Sanity check the entire input before procededing

commandOptions.forEach((option: CommandLineOption) => {
  const name = option.name;
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
    output_options[getter_name] = options[name];
  }
});

module.exports.options = output_options;
