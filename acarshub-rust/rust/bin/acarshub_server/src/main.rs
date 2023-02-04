// Copyright (c) Fred Clausen
//
// Licensed under the MIT license: https://opensource.org/licenses/MIT
// Permission is granted to use, copy, modify, and redistribute the work.
// Full license information available in the project LICENSE file.
//

extern crate acarshub_logging;
extern crate acarshub_options;
#[macro_use]
extern crate log;

use acarshub_logging::SetupLogging;
use acarshub_options::clap::Parser;
use acarshub_options::Input;

use std::process;

fn main() {
    let args: Input = Input::parse();
    args.verbose.enable_logging();
    args.print_values();
    match args.check_config_option_sanity() {
        Ok(_) => {
            trace!("Config options are sane");
        }
        Err(e) => {
            error!("{}", e);
            process::exit(1);
        }
    }
}
