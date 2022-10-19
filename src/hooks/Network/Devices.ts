import { useToast } from '@chakra-ui/react';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { v4 as uuid } from 'uuid';
import { axiosGw } from 'constants/axiosInstances';
import { DeviceRttyApiResponse, GatewayDevice, WifiScanCommand, WifiScanResult } from 'models/Device';
import { useAuth } from 'contexts/AuthProvider';
import { useEndpointStatus } from 'hooks/useEndpointStatus';
import { Note } from 'models/Note';
import { PageInfo } from 'models/Table';

const getDeviceCount = () =>
  axiosGw.get('devices?countOnly=true').then((response) => response.data) as Promise<{ count: number }>;

export const useGetDeviceCount = ({ enabled }: { enabled: boolean }) => {
  const { t } = useTranslation();
  const toast = useToast();

  return useQuery(['devices', 'count'], getDeviceCount, {
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
  compatible: string;
  connected: boolean;
  createdTimestamp: number;
  devicePassword: string;
  deviceType: 'AP' | 'SWITCH' | 'IOT' | 'MESH';
  entity: string;
  firmware: string;
  fwUpdatePolicy: string;
  ipAddress: string;
  lastConfigurationChange: number;
  lastConfigurationDownload: number;
  lastContact: number | string;
  lastFWUpdate: number;
  locale: string;
  location: string;
  macAddress: string;
  manufacturer: string;
  messageCount: number;
  modified: number;
  notes: Note[];
  owner: string;
  rxBytes: number;
  serialNumber: string;
  subscriber: string;
  txBytes: number;
  venue: string;
  verifiedCertificate: string;
};

const getDevices = (limit: number, offset: number) =>
  axiosGw
    .get(`devices?deviceWithStatus=true&limit=${limit}&offset=${offset}`)
    .then((response) => response.data) as Promise<{ devicesWithStatus: DeviceWithStatus[] }>;

export const useGetDevices = ({
  pageInfo,
  enabled,
  onError,
}: {
  pageInfo?: PageInfo;
  enabled: boolean;
  onError?: (e: AxiosError) => void;
}) => {
  const offset = pageInfo?.limit !== undefined ? pageInfo.limit * pageInfo.index : 0;

  return useQuery(
    ['devices', 'all', { limit: pageInfo?.limit, offset }],
    () => getDevices(pageInfo?.limit || 0, offset),
    {
      keepPreviousData: true,
      enabled: enabled && pageInfo !== undefined,
      staleTime: 30000,
      onError,
    },
  );
};

const getAllDevices = async () => {
  let offset = 0;
  let devices: DeviceWithStatus[] = [];
  let devicesResponse: { devicesWithStatus: DeviceWithStatus[] };
  do {
    // eslint-disable-next-line no-await-in-loop
    devicesResponse = await getDevices(500, offset);
    devices = devices.concat(devicesResponse.devicesWithStatus);
    offset += 500;
  } while (devicesResponse.devicesWithStatus.length === 500);
  return devices;
};

export const useGetAllDevicesWithStatus = ({ onError }: { onError?: (e: AxiosError) => void }) => {
  const { isReady } = useEndpointStatus('owgw');
  return useQuery(['devices', 'all', 'full'], getAllDevices, {
    enabled: isReady && false,
    onError,
  });
};

export type DeviceStatus = {
  UUID: number;
  associations_2G: number;
  associations_5G: number;
  connected: boolean;
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
            id: 'gateway-device-error',
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
      queryClient.invalidateQueries('devices');
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
      queryClient.invalidateQueries('devices');
      queryClient.invalidateQueries(['device', serialNumber]);
    },
  });
};
