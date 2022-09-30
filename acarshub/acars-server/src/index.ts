const commandLineArgs = require("command-line-args");

const commandOptions = [{ name: "db-save-all", type: Boolean, default: false }];

const options = commandLineArgs(commandOptions);

commandOptions.forEach((option) => {
  if (!options.hasOwnProperty(option.name)) {
    console.log(
      `${option.name} not defined. Using default value: ${option.default}`
    );
    options[option.name] = option.default;
  }
});
console.log(options);
