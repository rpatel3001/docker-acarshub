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

mod sanity_check;

use acarshub_logging::SetupLogging;
use clap::Parser;

#[derive(Parser, Debug, Clone, Default)]
#[command(name = "ACARS Hub Server", author, version, about, long_about = None)]
pub struct Input {
    // Output Options
    /// Set the log level. debug, trace, info are valid options.
    #[clap(short, long, action = clap::ArgAction::Count)]
    pub verbose: u8,
    /// Enable reception of VDLM messages
    #[clap(long, env = "AH_ENABLE_VDLM", value_parser)]
    pub enable_vdlm: bool,
    /// Enable reception of ACARS messages
    #[clap(long, env = "AH_ENABLE_ACARS", value_parser)]
    pub enable_acars: bool,
    // Input Options
    /// Set the address(s) and port(s) to listen on for ADSB messages.
    /// Multiple addresses can be specified by separating them with a comma.
    #[clap(long, env = "AH_ADSB_ADDRESS", value_parser, value_delimiter = ',')]
    pub adsb_address: Option<Vec<String>>,
    // General Options
    // Set the number of days the database will retain data
    #[clap(long, env = "AH_DB_RETENTION_DAYS", value_parser, default_value = "30")]
    pub db_retention_days: u64,
    // Map options
    /// Disable range rings for the web map
    #[clap(long, env = "AH_DISABLE_RANGE_RINGS", value_parser)]
    pub disable_range_rings: bool,
    // ADSB map site latitude
    #[clap(long, env = "AH_MAP_LATITUDE", value_parser)]
    pub map_latitude: Option<f64>,
    // ADSB map site longitude
    #[clap(long, env = "AH_MAP_LONGITUDE", value_parser)]
    pub map_longitude: Option<f64>,
}

impl Input {
    pub fn print_values(&self) {
        debug!(
            "ACARS Hub Log Verbosity: {}",
            self.verbose.set_logging_level()
        );
        debug!("ACARS Hub Enable VDLM: {}", self.enable_vdlm);
        debug!("ACARS Hub Enable ACARS: {}", self.enable_acars);
        debug!("ACARS Hub ADSB Addresses: {:?}", self.adsb_address);
        debug!("ACARS Hub DB Retention Days: {}", self.db_retention_days);
        debug!(
            "ACARS Hub Disable Range Rings: {}",
            self.disable_range_rings
        );
        debug!("ACARS Hub Map Latitude: {:?}", self.map_latitude);
        debug!("ACARS Hub Map Longitude: {:?}", self.map_longitude);
    }
}
