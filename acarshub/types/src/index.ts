export interface ACARSCommandLine extends Array<CommandLineOption> {
  [index: number]: CommandLineOption;
}

export interface CommandLineOption {
  name: string;
  type: StringConstructor | NumberConstructor | BooleanConstructor;
  multiple?: boolean;
  default: undefined | number | string | boolean;
  validator?: (value: any) => boolean;
  format_corrector?: (value: any) => any;
}

export interface ACARSOption {
  DbSaveAll: boolean;
  DbSaveDays: number;
  DbAlertSaveDays: number;
  IataOverride: string[] | undefined;
  Tar1090url: string;
  LogLevel: number;
  EnableAdsb: boolean;
  AdsbSource: string | undefined;
  AdsbPort: number;
  AdsbLat: number | undefined;
  AdsbLon: number | undefined;
  AdsbDisableRangeRings: boolean;
  EnableAcars: boolean;
  EnableVdlm: boolean;
  AcarsSource: string[];
  VdlmSource: string[];
  IataSourcePath: string;
}
export interface ADSBPosition {
  now: number;
  hex: string;
  type: string;
  flight?: string;
  alt_baro?: number;
  alt_geom?: number;
  gs?: number;
  ias?: number;
  tas?: number;
  mach?: number;
  track?: number;
  track_rate?: number;
  roll?: number;
  mag_heading?: number;
  true_heading?: number;
  baro_rate?: number;
  geom_rate?: number;
  squawk?: number;
  emergency?: number;
  category?: number;
  nav_qnh?: number;
  nav_altitude_mcp?: number;
  nav_altitude_fms?: number;
  nav_heading?: number;
  nav_modes?: number;
  lat?: number;
  lon?: number;
  nic?: number;
  rc?: number;
  seen_pos?: number;
  version?: number;
  nic_baro?: number;
  nac_p?: number;
  nac_v?: number;
  sil?: number;
  sil_type?: number;
  gva?: number;
  sda?: number;
  mlat?: string[];
  tisb?: string[];
  messages?: number;
  seen?: number;
  rssi?: number;
  alert?: number;
  spi?: number;
  wd?: number;
  ws?: number;
  oat?: number;
  tat?: number;
  t?: string;
  r?: string;
  // Special handlers added by the processor
  // These are not part of the original message
  callsign: string | undefined; // Used to normalize the flight field to have no spaces.
}

export interface ACARSMessage {
  timestamp: number;
  station_id: string;
  toaddr?: string;
  fromaddr?: string;
  depa?: string;
  dsta?: string;
  eta?: string;
  gtout?: string;
  gtin?: string;
  wloff?: string;
  wlin?: string;
  lat?: number;
  lon?: number;
  alt?: number;
  text?: string;
  tail?: string;
  flight?: string;
  icao?: number;
  freq?: number;
  ack?: string;
  mode?: string;
  label?: string;
  block_id?: string;
  msgno?: string;
  is_response?: number;
  is_onground?: number;
  error?: number | string;
  libacars?: any;
  level?: number;
}

export interface dumpVDL2Message {
  vdl2: {
    app: {
      name: string;
      ver: string;
      proxied?: boolean;
      proxied_by?: string;
      acars_router_version?: string;
    };
    avlc: {
      cr: string;
      dst: {
        addr: string;
        type: string;
      };
      frame_type: string;
      src: {
        addr: string;
        status: string;
        type: string;
      };
      rseq: number;
      sseq: number;
      poll: boolean;
      acars: {
        err: boolean;
        crc_ok: boolean;
        more: boolean;
        reg: string; // needs normalization. Leading period
        mode: number;
        label: string;
        blk_id: number;
        ack: string;
        flight: string;
        msg_num: string;
        msg_num_seq: string;
        sublabel: string;
        msg_text: string;
      };
    };
    burst_len_octets: number;
    freq: string;
    idx: number;
    freq_skew: number;
    hdr_bits_fixed: number;
    noise_level: number;
    octets_corrected_by_fec: number;
    sig_level: number;
    station?: string;
    t: {
      sec: number;
      usec: number;
    };
  };
}

export interface ACARSHubMessage {
  timestamp: number;
  icao_hex?: string;
  iata_callsign?: string;
  icao_callsign?: string;
  tail?: string;
}

export interface IATAtoICAO {
  [key: string]: ICAO;
}

export interface ICAO {
  ICAO: string;
  NAME: string;
}
