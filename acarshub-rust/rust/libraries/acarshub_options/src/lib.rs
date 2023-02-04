// Copyright (c) Fred Clausen
//
// Licensed under the MIT license: https://opensource.org/licenses/MIT
// Permission is granted to use, copy, modify, and redistribute the work.
// Full license information available in the project LICENSE file.
//

pub extern crate clap as clap;
#[macro_use]
extern crate log;
extern crate acarshub_logging;

use acarshub_logging::SetupLogging;
use clap::Parser;

#[derive(Parser, Debug, Clone, Default)]
#[command(name = "ACARS Hub Server", author, version, about, long_about = None)]
pub struct Input {
    // Output Options
    /// Set the log level. debug, trace, info are valid options.
    #[clap(short, long, action = clap::ArgAction::Count)]
    pub verbose: u8,
}

impl Input {
    pub fn print_values(&self) {
        debug!(
            "ACARS Hub Log Verbosity: {}",
            self.verbose.set_logging_level()
        );
    }
}
