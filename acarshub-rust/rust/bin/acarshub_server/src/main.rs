// Copyright (c) Fred Clausen
//
// Licensed under the MIT license: https://opensource.org/licenses/MIT
// Permission is granted to use, copy, modify, and redistribute the work.
// Full license information available in the project LICENSE file.
//

extern crate acarshub_logging;
extern crate acarshub_options;
extern crate log;

use acarshub_logging::SetupLogging;
use acarshub_options::clap::Parser;
use acarshub_options::Input;

fn main() {
    let args: Input = Input::parse();
    args.verbose.enable_logging();
    args.print_values();
}
