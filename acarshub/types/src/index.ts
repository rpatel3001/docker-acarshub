export interface ACARSCommandLine extends Array<CommandLineOption> {
  [index: number]: CommandLineOption;
}

export interface CommandLineOption {
  name: string;
  type: StringConstructor | NumberConstructor | BooleanConstructor;
  multiple?: boolean;
  default: undefined | number | string | boolean;
  validator?: (value: any) => boolean;
}

export interface ACARSOption {
  DbSaveAll: boolean;
  DbSaveDays: number;
  DbAlertSaveDays: number;
  IataOverride: string[] | undefined;
  Tar1090url: string | undefined;
  LogLevel: number;
  EnableAdsb: boolean;
  AdsbUrl: string | undefined;
  AdsbLat: number | undefined;
  AdsbLon: number | undefined;
  AdsbDisableRangeRings: boolean;
  EnableAcars: boolean;
  EnableVdlm: boolean;
  AcarsSource: string[];
  VdlmSource: string[];
}
