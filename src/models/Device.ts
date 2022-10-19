import { Configuration } from './Configuration';
import { Note } from './Note';

export interface GatewayDevice {
  UUID: number;
  compatible: string;
  configuration: unknown;
  createdTimestamp: number;
  devicePassword: string;
  deviceType: string;
  entity: string;
  firmware: string;
  fwUpdatePolicy: string;
  lastConfigurationChange: number;
  lastConfigurationDownload: number;
  lastFWUpdate: number;
  locale: string;
  location: string;
  macAddress: string;
  manufacturer: string;
  modified: number;
  notes: Note[];
  owner: string;
  serialNumber: string;
  subscriber: string;
  venue: string;
}

export interface DeviceLocation {
  addressLines?: string[];
  addressLineOne?: string;
  addressLineTwo?: string;
}

export interface DeviceContact {
  primaryEmail: string;
}

export type RadioConfiguration = {
  band?: '2G' | '5G' | '6G';
  bandwidth?: number;
  'beacon-interval'?: number;
  channel?: string;
  'channel-mode'?: string;
  'channel-width'?: number;
  country?: string;
  'dtim-period'?: number;
  'maximum-clients'?: number;
  'tx-power'?: number;
};

export type DeviceConfiguration = {
  interfaces?: Record<string, unknown>[];
  metrics?: Record<string, unknown>;
  radios?: RadioConfiguration[];
  globals?: Record<string, unknown>;
  services?: Record<string, unknown>;
  uuid: string;
};

export interface Device {
  name: string;
  description: string;
  operatorId: string;
  id: string;
  serialNumber: string;
  deviceType: string;
  location: DeviceLocation;
  contact: DeviceContact;
  configuration?: DeviceConfiguration;
  notes?: Note[];
}

export interface EditDevice {
  name: string;
  description: string;
  operatorId?: string;
  id?: string;
  location?: {
    addressLines: string[];
  };
  serialNumber?: string;
  configuration?: Configuration[];
  notes?: Note[];
}

export interface WifiScanCommand {
  dfs: boolean;
  activeScan: boolean;
  bandwidth: '' | '20' | '40' | '80';
}

interface BssidResult {
  bssid: string;
  capability: number;
  channel: number;
  frequency: number;
  ht_oper: string;
  ies: string[];
  last_seen: number;
  signal: number;
  ssid?: string;
  meshid?: string;
  tsf: number;
  vht_oper: string;
}

export interface WifiScanResult {
  UUID: string;
  attachFile: number;
  completed: number;
  errorCode: number;
  errorText: string;
  executed: number;
  executionTime: number;
  results: {
    serial: string;
    status: {
      error: number;
      resultCode: number;
      scan: BssidResult[];
    };
  };
}

export interface DeviceScanResult {
  ssid: string;
  signal: number | string;
}
export interface ScanChannel {
  channel: number;
  devices: DeviceScanResult[];
}

export type DeviceRttyApiResponse = {
  server: string;
  viewport: string;
  connectionId: string;
};
