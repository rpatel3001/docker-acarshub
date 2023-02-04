// Copyright (c) Fred Clausen
//
// Licensed under the MIT license: https://opensource.org/licenses/MIT
// Permission is granted to use, copy, modify, and redistribute the work.
// Full license information available in the project LICENSE file.
//

use crate::Input;
use std::collections::HashSet;
use std::hash::Hash;
use std::net::SocketAddr;
use std::str::FromStr;

impl Input {
    pub fn check_config_option_sanity(&self) -> Result<(), String> {
        // Create our mutable vector of bool. All check results will come into here.
        let is_input_sane: Vec<bool> = vec![
            // Make sure all provided hosts are valid.
            self.check_host_validity(),
            // Make sure that there are no duplicate hosts between blocks.
            self.check_no_duplicate_hosts(),
            // Make sure that the latitude and longitude are valid.
            self.check_latitude_and_longitude(),
        ];
        // Now, see if we have any failures, and how many of them. If there are any failures, throw back an `Err()`
        match is_input_sane.contains(&false) {
            true => Err(format!(
                "Config option sanity check failed, with {} total errors",
                is_input_sane.iter().filter(|&n| !(*n)).count()
            )),
            false => Ok(()),
        }
    }

    fn check_latitude_and_longitude(&self) -> bool {
        let input_test_results: Vec<bool> = vec![
            self.map_latitude
                .check_latitude("AH_MAP_LATITUDE/--map-latitude"),
            self.map_longitude
                .check_longitude("AH_MAP_LONGITUDE/--map-longitude"),
        ];

        input_test_results.validate_results()
    }

    fn check_no_duplicate_hosts(&self) -> bool {
        let config: Input = self.clone();
        let mut input_test_results: Vec<bool> = Vec::new();
        let mut all_hosts: Vec<String> = Vec::new();

        let check_entries = vec![self.adsb_address.as_ref()];

        all_hosts.get_all_hosts(&check_entries);
        input_test_results.push(has_unique_elements(all_hosts));

        if let Some(config_hosts) = config.adsb_address {
            input_test_results.push(config_hosts.check_host("AH_ADSB_ADDRESS/--adsb-address"));
        }

        input_test_results.validate_results()
    }

    fn check_host_validity(&self) -> bool {
        // We want to verify the ADSB addresses are valid. If they are not, we want to return false.
        let input_test_results: Vec<bool> = vec![self
            .adsb_address
            .check_host_is_valid("AH_ADSB_ADDRESS/--adsb-address")];

        input_test_results.validate_results()
    }
}

trait ValidateHosts {
    fn check_host_is_valid(&self, name: &str) -> bool;
}

impl ValidateHosts for Option<Vec<String>> {
    fn check_host_is_valid(&self, name: &str) -> bool {
        // TODO: validate the hostname doesn't contain any invalid characters
        if let Some(sockets) = self {
            if sockets.is_empty() {
                error!(
                    "{} has been provided, but there are no socket addresses",
                    name
                );
                return false;
            }
            for socket in sockets {
                // check and see if there are alpha characters in the string
                if socket.chars().any(|c| c.is_alphabetic()) {
                    // split the string on ':'
                    let socket_parts = socket.split(':').collect::<Vec<_>>();
                    match socket_parts.len() {
                        1 => {
                            error!("{} has no port specified for: {}", name, socket);
                            return false;
                        }
                        2 => {
                            let port = socket_parts[1];
                            // validate the port is numeric and between 1-65535
                            if !port.chars().all(|c| c.is_numeric()) {
                                error!("{} Port is not numeric for: {}", name, socket);
                                return false;
                            } else {
                                match port.parse::<u16>() {
                                    Ok(parsed_socket) => {
                                        if parsed_socket == 0 {
                                            error!("{}: Socket address is valid, but the port provided is zero: {}", name, socket);
                                            return false;
                                        } else {
                                            trace!("{} is a valid socket address", socket);
                                        }
                                    }
                                    Err(_) => {
                                        error!("{} Port is invalid for: {}", name, socket);
                                        return false;
                                    }
                                }
                            }
                        }
                        _ => {
                            error!(
                                "{} has an address with more than one colon in it: {}",
                                name, socket
                            );
                            return false;
                        }
                    }
                } else {
                    let parse_socket = SocketAddr::from_str(socket);
                    match parse_socket {
                        Err(parse_error) => {
                            error!(
                                "{}: Failed to validate that {} is a properly formatted socket: {}",
                                name, socket, parse_error
                            );
                            return false;
                        }
                        Ok(parsed_socket) => {
                            if parsed_socket.port().eq(&0) {
                                error!("{}: Socket address is valid, but the port provided is zero: {}", name, socket);
                                return false;
                            } else {
                                trace!("{} is a valid socket address", socket);
                            }
                        }
                    }
                }
            }
        }
        true
    }
}

/// Trait for processing check results
trait ReturnValidity {
    fn validate_results(self) -> bool;
}

/// Implementation of `ReturnValidity` for `Vec<bool>`.
///
/// It will check to see if there is an instance of `false` in the `Vec<bool>`.
/// If there is, it will return false, as we have a check that has failed.
impl ReturnValidity for Vec<bool> {
    fn validate_results(self) -> bool {
        match self.contains(&false) {
            // The logic here is "Did a test return false?"
            // If it did, the config has an error and the return should be false.
            true => false,
            false => true,
        }
    }
}

trait HostDuplicateCheck {
    fn get_all_hosts(&mut self, hosts_group: &[Option<&Vec<String>>]);
    fn check_host(self, check_type: &str) -> bool;
}

impl HostDuplicateCheck for Vec<String> {
    fn get_all_hosts(&mut self, hosts_group: &[Option<&Vec<String>>]) {
        let hosts_group = hosts_group.to_vec();
        for config_hosts in hosts_group.into_iter().flatten() {
            for host in config_hosts {
                self.push(host.to_string());
            }
        }
    }

    fn check_host(self, check_type: &str) -> bool {
        let unique_hosts = has_unique_elements(self.to_vec());
        if !unique_hosts {
            error!(
                "Duplicate host in {} configuration!\nContents: {:?}",
                check_type, self
            );
        }
        unique_hosts
    }
}

fn has_unique_elements<T>(iter: T) -> bool
where
    T: IntoIterator,
    T::Item: Eq + Hash,
{
    let mut uniq = HashSet::new();
    iter.into_iter().all(move |x| uniq.insert(x))
}

trait ValidateLatLon {
    fn check_latitude(&self, name: &str) -> bool;
    fn check_longitude(&self, name: &str) -> bool;
}

impl ValidateLatLon for Option<f64> {
    fn check_latitude(&self, name: &str) -> bool {
        if let Some(lat) = self {
            if !(&-90.0..=&90.0).contains(&lat) {
                error!("{} is not a valid latitude: {}", name, lat);
                return false;
            }
        } else {
            error!("{} is missing!", name);
            return false;
        }
        true
    }

    fn check_longitude(&self, name: &str) -> bool {
        if let Some(lon) = self {
            if !(&-180.0..=&180.0).contains(&lon) {
                error!("{} is not a valid longitude: {}", name, lon);
                return false;
            }
        } else {
            error!("{} is missing!", name);
            return false;
        }
        true
    }
}
