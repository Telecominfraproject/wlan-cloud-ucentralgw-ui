import { Note } from './Note';

export type AnalyticsBoardDevice = {
  associations_2g: number;
  associations_5g: number;
  associations_6g: number;
  boardId: string;
  connected: boolean;
  connectionIp: string;
  deviceType: string;
  health: number;
  lastConnection: number;
  lastContact: number;
  lastDisconnection: number;
  lastFirmware: string;
  lastFirmwareUpdate: number;
  lastHealth: number;
  lastPing: number;
  lastState: number;
  locale: string;
  memory: number;
  pings: number;
  serialNumber: string;
  states: number;
  type: string;
  uptime: number;
};

export type AnalyticsBoardDevicesApiResponse = {
  devices: AnalyticsBoardDevice[];
};

export type AnalyticsBoardApiResponse = {
  created: number;
  description: string;
  id: string;
  modified: number;
  name: string;
  notes: Note[];
  tags: string[];
  venueList: {
    description: string;
    id: string;
    interval: number;
    monitorSubVenues: boolean;
    name: string;
    retention: number;
  };
};

export type AnalyticsClientLifecycleApiResponse = {
  ack_signal: number;
  ack_signal_avg: number;
  active_ms: number;
  bssid: string;
  busy_ms: number;
  channel: number;
  channel_width: number;
  connected: number;
  inactive: number;
  ipv4: string;
  ipv6: string;
  mode: string;
  noise: number;
  receive_ms: number;
  rssi: number;
  rx_bitrate: number;
  rx_bytes: number;
  rx_chwidth: number;
  rx_duration: number;
  rx_mcs: number;
  rx_nss: number;
  rx_packets: number;
  rx_vht: boolean;
  ssid: string;
  station_id: string;
  timestamp: number;
  tx_bitrate: number;
  tx_bytes: number;
  tx_chwidth: number;
  tx_duration: number;
  tx_mcs: number;
  tx_nss: number;
  tx_packets: number;
  tx_power: number;
  tx_retries: number;
  tx_vht: boolean;
  venue_id: string;
};

export type AnalyticsApData = {
  collisions: number;
  multicast: number;
  rx_bytes: number;
  rx_bytes_bw: number;
  rx_bytes_delta: number;
  rx_dropped: number;
  rx_dropped_delta: number;
  rx_dropped_pct: number;
  rx_errors: number;
  rx_errors_delta: number;
  rx_errors_pct: number;
  rx_packets: number;
  rx_packets_bw: number;
  rx_packets_delta: number;
  tx_bytes: number;
  tx_bytes_bw: number;
  tx_bytes_delta: number;
  tx_dropped: number;
  tx_dropped_delta: number;
  tx_dropped_pct: number;
  tx_errors: number;
  tx_errors_delta: number;
  tx_errors_pct: number;
  tx_packets: number;
  tx_packets_bw: number;
  tx_packets_delta: number;
};

export type AnalyticsRadioData = {
  active_ms: number;
  active_pct: number;
  band: number;
  busy_ms: number;
  busy_pct: number;
  channel: number;
  channel_width: number;
  noise: number;
  receive_ms: number;
  receive_pct: number;
  temperature: number;
  transmit_ms: number;
  transmit_pct: number;
  tx_power: number;
};

export type AnalyticsAssociationData = {
  connected: number;
  inactive: number;
  rssi: number;
  rx_bytes: number;
  rx_bytes_bw: number;
  rx_bytes_delta: number;
  rx_packets: number;
  rx_packets_bw: number;
  rx_packets_delta: number;
  rx_rate: {
    bitrate: number;
    chwidth: number;
    ht: boolean;
    mcs: number;
    nss: number;
    sgi: boolean;
  };
  station: string;
  tx_bytes: number;
  tx_bytes_bw: number;
  tx_bytes_delta: number;
  tx_duration: number;
  tx_duration_delta: number;
  tx_duration_pct: number;
  tx_failed: number;
  tx_failed_delta: number;
  tx_failed_pct: number;
  tx_packets: number;
  tx_packets_bw: number;
  tx_packets_delta: number;
  tx_rate: {
    bitrate: number;
    chwidth: number;
    ht: boolean;
    mcs: number;
    nss: number;
    sgi: boolean;
  };
  tx_retries: number;
  tx_retries_delta: number;
  tx_retries_pct: number;
};

export type AnalyticsSsidData = {
  associations: AnalyticsAssociationData[];
  band: 2;
  bssid: string;
  channel: number;
  mode: string;
  rx_bytes_bw: {
    avg: number;
    max: number;
    min: number;
  };
  rx_packets_bw: {
    avg: number;
    max: number;
    min: number;
  };
  ssid: string;
  tx_bytes_bw: {
    avg: number;
    max: number;
    min: number;
  };
  tx_duration_pct: {
    avg: number;
    max: number;
    min: number;
  };
  tx_failed_pct: {
    avg: number;
    max: number;
    min: number;
  };
  tx_packets_bw: {
    avg: number;
    max: number;
    min: number;
  };
  tx_retries_pct: {
    avg: number;
    max: number;
    min: number;
  };
};

export type AnalyticsTimePointApiResponse = {
  ap_data: AnalyticsApData;
  boardId: string;
  device_info: AnalyticsBoardDevice;
  id: string;
  radio_data: AnalyticsRadioData[];
  serialNumber: string;
  ssid_data: AnalyticsSsidData[];
  timestamp: number;
};

export type AnalyticsTimePointsApiResponse = {
  points: AnalyticsTimePointApiResponse[][];
};
