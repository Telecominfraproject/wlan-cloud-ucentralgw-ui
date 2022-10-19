/* eslint-disable import/prefer-default-export */
import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { axiosGw } from 'constants/axiosInstances';

type DeviceInterfaceStatistics = {
  clients: {
    ipv4_addresses?: string[];
    ipv6_addresses?: string[];
    mac?: string;
    ports?: string[];
  }[];
  counters?: {
    collisions: number;
    multicast: number;
    rx_bytes: number;
    rx_dropped: number;
    rx_errors: number;
    rx_packets: number;
    tx_bytes: number;
    tx_dropped: number;
    tx_errors: number;
    tx_packets: number;
  };
  ssids?: {
    associations?: {
      ack_signal: number;
      ack_signal_avg: number;
      bssid: string;
      connected: number;
      inactive: number;
      ipaddr_v4: string;
      rssi: number;
      rx_bytes: number;
      rx_duration: number;
      rx_packets: number;
      rx_rate: {
        bitrate: number;
        chwidth: number;
        he: boolean;
        he_dcm: number;
        he_gi: number;
        mcs: number;
        nss: number;
      };
      station: string;
      tid_stats: {
        rx_msdu: number;
        tx_msdu: number;
        tx_msdu_failed: number;
        tx_msdu_retries: number;
      }[];
      tx_bytes: number;
      tx_duration: number;
      tx_failed: number;
      tx_packets: number;
      tx_rate: {
        bitrate: number;
        chwidth: number;
        he: boolean;
        he_dcm: number;
        he_gi: number;
        mcs: number;
        nss: number;
      };
      tx_retries: number;
    }[];
    bssid: string;
    iface: string;
    location: string;
    mode: string;
    phy?: string;
    radio?: {
      $ref: string;
    };
    ssid: string;
  }[];
  dns_servers?: string[];
  location: string;
  name: string;
  uptime: number;
};
export type DeviceStatistics = {
  interfaces?: DeviceInterfaceStatistics[];
  radios?: {
    active_ms: number;
    busy_ms: number;
    channel: number;
    channel_width: string;
    noise: number;
    phy: string;
    receive_ms: number;
    transmit_ms: number;
    tx_power: number;
  }[];
  unit?: {
    load: [number, number, number];
    localtime: number;
    memory: {
      buffered: number;
      cached: number;
      free: number;
      total: number;
    };
    uptime: number;
  };
  'link-state'?: {
    downstream: {
      eth1?: {
        carrier?: number;
        duplex?: string;
        speed?: number;
      };
    };
    upstream: {
      eth0?: {
        carrier?: number;
        duplex?: string;
        speed?: number;
      };
    };
  };
  'lldp-peers'?: {
    downstream: {
      eth1?: {
        carrier?: number;
        duplex?: string;
        speed?: number;
      };
    };
    upstream: {
      eth0?: {
        carrier?: number;
        duplex?: string;
        speed?: number;
      };
    };
  };
  version?: number;
};
const getLastStats = (serialNumber?: string) =>
  axiosGw
    .get(`device/${serialNumber}/statistics?lastOnly=true`)
    .then((response) => response.data) as Promise<DeviceStatistics>;

export const useGetDeviceLastStats = ({
  serialNumber,
  onError,
}: {
  serialNumber?: string;
  onError?: (e: AxiosError) => void;
}) =>
  useQuery(['device', serialNumber, 'last-statistics'], () => getLastStats(serialNumber), {
    enabled: serialNumber !== undefined && serialNumber !== '',
    staleTime: 1000 * 60,
    onError,
  });

const getNewestStats = (limit: number, serialNumber?: string) => async () =>
  axiosGw
    .get(`device/${serialNumber}/statistics?newest=true&limit=${limit}`)
    .then((response) => response.data) as Promise<{
    data: { data: DeviceStatistics; UUID: string; recorded: number }[];
  }>;

export const useGetDeviceNewestStats = ({
  serialNumber,
  limit,
  onError,
}: {
  serialNumber?: string;
  limit: number;
  onError?: (e: AxiosError) => void;
}) =>
  useQuery(['deviceStatistics', serialNumber, 'newest', { limit }], getNewestStats(limit, serialNumber), {
    enabled: serialNumber !== undefined && serialNumber !== '',
    staleTime: 1000 * 60,
    onError,
  });

const getOuis = (macs?: string[]) => async () =>
  axiosGw.get(`/ouis?macList=${macs?.join(',')}`).then((response) => response.data) as Promise<{
    tagList: { tag: string; value: string }[];
  }>;
export const useGetMacOuis = ({ macs, onError }: { macs?: string[]; onError?: (e: AxiosError) => void }) =>
  useQuery(['ouis', macs], getOuis(macs), {
    enabled: macs !== undefined && macs.length > 0,
    staleTime: 1000 * 60,
    onError,
  });

const getStatsBetweenTimestamps = (limit: number, start?: number, end?: number, serialNumber?: string) => async () =>
  axiosGw
    .get(`device/${serialNumber}/statistics?startDate=${start}&endDate=${end}&limit=${limit}`)
    .then((response) => response.data) as Promise<{
    data: { data: DeviceStatistics; UUID: string; recorded: number }[];
  }>;

export const useGetDeviceStatsWithTimestamps = ({
  serialNumber,
  limit,
  start,
  end,
  onError,
}: {
  serialNumber?: string;
  limit: number;
  start?: number;
  end?: number;
  onError?: (e: AxiosError) => void;
}) =>
  useQuery(
    ['deviceStatistics', serialNumber, { limit, start, end }],
    getStatsBetweenTimestamps(limit, start, end, serialNumber),
    {
      enabled: serialNumber !== undefined && serialNumber !== '' && start !== undefined && end !== undefined,
      staleTime: 1000 * 60,
      onError,
    },
  );
const getStart = () => {
  const date = new Date();
  date.setHours(date.getHours() - 1);
  return Math.floor(date.getTime() / 1000);
};
const getLatestHour = (limit: number, serialNumber?: string) => async () =>
  axiosGw
    .get(
      `device/${serialNumber}/statistics?startDate=${getStart()}&endDate=${Math.floor(
        new Date().getTime() / 1000,
      )}&limit=${limit}`,
    )
    .then((response) => response.data) as Promise<{
    data: { data: DeviceStatistics; UUID: string; recorded: number }[];
  }>;

export const useGetDeviceStatsLatestHour = ({
  serialNumber,
  limit,
  onError,
}: {
  serialNumber?: string;
  limit: number;
  onError?: (e: AxiosError) => void;
}) =>
  useQuery(['deviceStatistics', serialNumber, 'latestHour'], getLatestHour(limit, serialNumber), {
    enabled: serialNumber !== undefined && serialNumber !== '',
    staleTime: 1000 * 60,
    keepPreviousData: true,
    onError,
  });
