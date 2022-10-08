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
}
export interface ADSBPosition {
  now: number;
  hex: string;
  type: string;
  flight: string;
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
  matched?: boolean; // This line and below are custom parameters injected by javascript or from the backend
  matched_text?: string[];
  matched_icao?: string[];
  matched_flight?: string[];
  matched_tail?: string[];
  uid: string;
  decodedText?: any; // no type for typescript acars decoder; so set to any
  data?: string;
  message_type: string;
  msg_time?: number;
  duplicates?: string;
  msgno_parts?: string;
  label_type?: string;
  toaddr_decoded?: string;
  toaddr_hex?: string;
  fromaddr_hex?: string;
  fromaddr_decoded?: string;
  icao_url?: string;
  icao_hex?: string;
  decoded_msg?: string;
  icao_flight?: string;
}
