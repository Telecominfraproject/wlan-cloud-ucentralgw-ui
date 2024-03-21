import { useToast } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { axiosGw } from 'constants/axiosInstances';
import { useAuth } from 'contexts/AuthProvider';
import { useEndpointStatus } from 'hooks/useEndpointStatus';
import { AxiosError } from 'models/Axios';
import { DeviceRttyApiResponse, GatewayDevice, WifiScanCommand, WifiScanResult } from 'models/Device';
import { Note } from 'models/Note';
import { PageInfo } from 'models/Table';
import { DeviceCommandHistory } from './Commands';

export const DEVICE_PLATFORMS = ['all', 'ap', 'switch'] as const;
export type DevicePlatform = (typeof DEVICE_PLATFORMS)[number];

const getDeviceCount = (platform: DevicePlatform) =>
  axiosGw.get(`devices?countOnly=true&platform=${platform}`).then((response) => response.data) as Promise<{
    count: number;
  }>;

export const useGetDeviceCount = ({ enabled, platform = 'all' }: { enabled: boolean; platform?: DevicePlatform }) => {
  const { t } = useTranslation();
  const toast = useToast();

  return useQuery(['devices', 'count', { platform }], () => getDeviceCount(platform), {
    enabled,
    onError: (e: AxiosError) => {
      if (!toast.isActive('inventory-fetching-error'))
        toast({
          id: 'inventory-fetching-error',
          title: t('common.error'),
          description: t('crud.error_fetching_obj', {
            obj: t('devices.one'),
            e: e?.response?.data?.ErrorDescription,
          }),
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
    },
  });
};

export type DeviceWithStatus = {
  UUID: number;
  associations_2G: number;
  associations_5G: number;
  associations_6G: number;
  blackListed?: boolean;
  compatible: string;
  connected: boolean;
  connectReason?: string;
  certificateExpiryDate?: number;
  createdTimestamp: number;
  devicePassword: string;
  deviceType: 'ap' | 'switch';
  entity: string;
  firmware: string;
  fwUpdatePolicy: string;
  hasGPS: boolean;
  hasRADIUSSessions: number | boolean;
  ipAddress: string;
  lastConfigurationChange: number;
  lastConfigurationDownload: number;
  lastContact: number | string;
  lastFWUpdate: number;
  lastRecordedContact: number;
  load: number;
  locale: string;
  location: string;
  macAddress: string;
  manufacturer: string;
  memoryUsed: number;
  messageCount: number;
  modified: number;
  notes: Note[];
  owner: string;
  sanity: number;
  started: number;
  restrictedDevice: boolean;
  rxBytes: number;
  serialNumber: string;
  simulated: boolean;
  subscriber: string;
  temperature: number;
  txBytes: number;
  venue: string;
  verifiedCertificate: string;
};

export const getSingleDeviceWithStatus = (serialNumber: string) =>
  axiosGw
    .get(`devices?deviceWithStatus=true&select=${serialNumber}`)
    .then((response) => {
      const deviceWithStatus: DeviceWithStatus | undefined = response.data.devicesWithStatus[0];
      if (deviceWithStatus === undefined) {
        return undefined;
      }
      return deviceWithStatus;
    })
    .catch(() => undefined);

const getDevices = (limit: number, offset: number, platform: DevicePlatform) =>
  axiosGw
    .get(`devices?deviceWithStatus=true&limit=${limit}&offset=${offset}&platform=${platform}`)
    .then((response) => response.data) as Promise<{ devicesWithStatus: DeviceWithStatus[] }>;

export const useGetDevices = ({
  pageInfo,
  enabled,
  onError,
  platform = 'all',
}: {
  pageInfo?: PageInfo;
  enabled: boolean;
  onError?: (e: AxiosError) => void;
  platform?: DevicePlatform;
}) => {
  const offset = pageInfo?.limit !== undefined ? pageInfo.limit * pageInfo.index : 0;

  return useQuery(
    ['devices', 'all', { limit: pageInfo?.limit, offset, platform }],
    () => getDevices(pageInfo?.limit || 0, offset, platform),
    {
      keepPreviousData: true,
      enabled: enabled && pageInfo !== undefined,
      staleTime: 30000,
      onError,
    },
  );
};

const getAllDevices = async (platform: DevicePlatform) => {
  let offset = 0;
  let devices: DeviceWithStatus[] = [];
  let devicesResponse: { devicesWithStatus: DeviceWithStatus[] };
  do {
    // eslint-disable-next-line no-await-in-loop
    devicesResponse = await getDevices(500, offset, platform);
    devices = devices.concat(devicesResponse.devicesWithStatus);
    offset += 500;
  } while (devicesResponse.devicesWithStatus.length === 500);
  return devices;
};

export const useGetAllDevicesWithStatus = ({
  onError,
  platform = 'all',
}: {
  onError?: (e: AxiosError) => void;
  platform?: DevicePlatform;
}) => {
  const { isReady } = useEndpointStatus('owgw');
  return useQuery(['devices', 'all', 'full', { platform }], () => getAllDevices(platform), {
    enabled: isReady && false,
    onError,
  });
};

export type DeviceStatus = {
  UUID: number;
  associations_2G: number;
  associations_5G: number;
  connected: boolean;
  connectReason?: string;
  certificateExpiryDate: number;
  connectionCompletionTime: number;
  firmware: string;
  ipAddress: string;
  kafkaClients: number;
  kafkaPackets: number;
  lastContact: number;
  locale: string;
  messageCount: number;
  rxBytes: number;
  sessionId: number;
  started: number;
  totalConnectionTime: number;
  txBytes: number;
  verifiedCertificate: string;
  webSocketClients: number;
  websocketPackets: number;
};

const getDeviceStatus = (serialNumber?: string) =>
  axiosGw.get(`device/${serialNumber}/status`).then((response) => response.data) as Promise<DeviceStatus>;

export const useGetDeviceStatus = ({
  serialNumber,
  onError,
}: {
  serialNumber?: string;
  onError?: (e: AxiosError) => void;
}) =>
  useQuery(['device', serialNumber, 'status'], () => getDeviceStatus(serialNumber), {
    enabled: serialNumber !== undefined && serialNumber !== '',
    onError,
  });

export type DevicesStats = {
  averageConnectionTime: number;
  connectedDevices: number;
  connectingDevices: number;
  tx: number;
  rx: number;
};

const getInitialStats = async () =>
  axiosGw.get(`devices?connectionStatistics=true`).then(({ data }: { data: DevicesStats }) => data);
export const useGetDevicesStats = ({ onError }: { onError?: (e: AxiosError) => void }) => {
  const { isUserLoaded } = useAuth();

  return useQuery(['devices', 'all', 'connection-statistics'], () => getInitialStats(), {
    enabled: isUserLoaded,
    onError,
  });
};

export type DeviceHealthCheck = {
  serialNumber: string;
  values: {
    UUID: number;
    recorded: number;
    sanity: number;
    values: {
      unit: {
        memory: number;
      };
    };
  }[];
};
const getDeviceHealthChecks = (serialNumber?: string, limit?: number) =>
  axiosGw
    .get(`device/${serialNumber}/healthchecks?newest=true&limit=${limit ?? 50}`)
    .then((response) => response.data) as Promise<DeviceHealthCheck>;

export const useGetDeviceHealthChecks = ({
  serialNumber,
  onError,
  limit,
}: {
  serialNumber?: string;
  onError?: (e: AxiosError) => void;
  limit?: number;
}) =>
  useQuery(['device', serialNumber, 'healthchecks', { limit }], () => getDeviceHealthChecks(serialNumber, limit), {
    enabled: serialNumber !== undefined && serialNumber !== '',
    keepPreviousData: true,
    onError,
  });

export const useGetDevice = ({ serialNumber, onClose }: { serialNumber?: string; onClose?: () => void }) => {
  const { t } = useTranslation();
  const toast = useToast();

  return useQuery(
    ['device', serialNumber],
    () => axiosGw.get(`device/${serialNumber}`).then(({ data }: { data: GatewayDevice }) => data),
    {
      staleTime: 60 * 1000,
      enabled: serialNumber !== undefined && serialNumber !== '',
      onError: (e: AxiosError) => {
        if (!toast.isActive('gateway-device-fetching-error'))
          toast({
            id: 'gateway-device-fetching-error',
            title: t('common.error'),
            description:
              e?.response?.status === 404
                ? t('devices.not_found_gateway')
                : t('crud.error_fetching_obj', {
                    e: e?.response?.data?.ErrorDescription,
                    obj: t('devices.one'),
                  }),
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
        if (onClose) onClose();
      },
    },
  );
};

const deleteDevice = async (serialNumber: string) => axiosGw.delete(`device/${serialNumber}`);
export const useDeleteDevice = ({ serialNumber }: { serialNumber: string }) => {
  const queryClient = useQueryClient();

  return useMutation(deleteDevice, {
    onSuccess: () => {
      queryClient.invalidateQueries(['devices']);
      queryClient.invalidateQueries(['device', serialNumber]);
    },
  });
};

export const useRebootDevice = ({ serialNumber }: { serialNumber: string }) =>
  useMutation(() => axiosGw.post(`device/${serialNumber}/reboot`, { serialNumber, when: 0 }));

export const useBlinkDevice = ({ serialNumber }: { serialNumber: string }) =>
  useMutation(() =>
    axiosGw.post(`device/${serialNumber}/leds`, { serialNumber, when: 0, pattern: 'blink', duration: 30 }),
  );
export const useFactoryReset = ({
  serialNumber,
  keepRedirector,
  onClose,
}: {
  serialNumber: string;
  keepRedirector: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const toast = useToast();

  return useMutation(() => axiosGw.post(`device/${serialNumber}/factory`, { serialNumber, keepRedirector }), {
    onSuccess: () => {
      toast({
        id: `factory-reset-success-${uuid()}`,
        title: t('common.success'),
        description: t('commands.factory_reset_success'),
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      onClose();
    },
    onError: (e: AxiosError) => {
      toast({
        id: uuid(),
        title: t('common.error'),
        description: t('commands.factory_reset_error', {
          e: e?.response?.data?.ErrorDescription,
        }),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    },
  });
};

export const useWifiScanDevice = ({ serialNumber }: { serialNumber: string }) => {
  const toast = useToast();
  const { t } = useTranslation();

  return useMutation(
    ({ dfs, bandwidth, activeScan }: WifiScanCommand): Promise<WifiScanResult | undefined> =>
      axiosGw
        .post<WifiScanResult>(`device/${serialNumber}/wifiscan`, {
          serialNumber,
          override_dfs: dfs,
          bandwidth: bandwidth !== '' ? bandwidth : undefined,
          activeScan,
        })
        .then(({ data }: { data: WifiScanResult }) => data),
    {
      onSuccess: () => {},
      onError: (e: AxiosError) => {
        toast({
          id: uuid(),
          title: t('common.error'),
          description: t('commands.wifiscan_error', {
            e: e?.response?.data?.ErrorDescription,
          }),
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      },
    },
  );
};

export const useGetDeviceRtty = ({ serialNumber, extraId }: { serialNumber: string; extraId: string | number }) => {
  const { t } = useTranslation();
  const toast = useToast();

  return useQuery(
    ['get-gateway-device-rtty', serialNumber, extraId],
    () => axiosGw.get(`device/${serialNumber}/rtty`).then(({ data }: { data: DeviceRttyApiResponse }) => data),
    {
      enabled: false,
      onSuccess: ({ server, viewport, connectionId }) => {
        const url = `https://${server}:${viewport}/connect/${connectionId}`;
        window.open(url, '_blank')?.focus();
      },
      onError: (e: AxiosError) => {
        if (!toast.isActive('get-gateway-device-rtty-error'))
          toast({
            id: 'get-gateway-device-rtty',
            title: t('common.error'),
            description:
              e?.response?.status === 404
                ? t('devices.not_found_gateway')
                : t('devices.error_rtty', {
                    e: e?.response?.data?.ErrorDescription,
                  }),
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
      },
    },
  );
};

export type DeviceCapabilities = {
  capabilities: { [key: string]: unknown }[];
  serialNumber: string;
  firstUpdate: number;
  lastUpdate: number;
};
const getCapabilities = async (serialNumber: string) =>
  axiosGw.get(`device/${serialNumber}/capabilities`).then(({ data }: { data: DeviceCapabilities }) => data);
export const useGetDeviceCapabilities = ({
  serialNumber,
  onError,
}: {
  serialNumber: string;
  onError?: (e: AxiosError) => void;
}) => {
  const { isUserLoaded } = useAuth();

  return useQuery(['deviceCapabilities', serialNumber], () => getCapabilities(serialNumber), {
    enabled: isUserLoaded,
    onError,
  });
};

const modifyDevice = async ({ serialNumber, notes }: { serialNumber: string; notes?: Note[] }) =>
  axiosGw.put(`device/${serialNumber}`, { notes });
export const useUpdateDevice = ({ serialNumber }: { serialNumber: string }) => {
  const queryClient = useQueryClient();

  return useMutation(modifyDevice, {
    onSuccess: () => {
      queryClient.invalidateQueries(['devices']);
      queryClient.invalidateQueries(['device', serialNumber]);
    },
  });
};

const deleteDeviceBatch = async (pattern: string) => {
  if (pattern.length < 6) throw new Error('Pattern must be at least 6 characters long');

  axiosGw.delete(`devices?macPattern=${pattern}`);
};

export const useDeleteDeviceBatch = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteDeviceBatch, {
    onSuccess: () => {
      queryClient.invalidateQueries(['devices']);
    },
  });
};

export type PowerCyclePort = {
  /** Ex.: Ethernet0 */
  name: string;
  /** Cycle length in MS. Default is 10 000 */
  cycle?: number;
};

export type PowerCycleRequest = {
  serial: string;
  when: number;
  ports: PowerCyclePort[];
};

export const usePowerCycle = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (request: PowerCycleRequest) =>
      axiosGw.post(`device/${request.serial}/powercycle`, request).then((res) => res.data as DeviceCommandHistory),
    {
      onSettled: () => {
        queryClient.invalidateQueries(['commands']);
      },
    },
  );
};
