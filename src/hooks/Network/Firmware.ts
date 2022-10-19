import { useToast } from '@chakra-ui/react';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { v4 as uuid } from 'uuid';
import { axiosFms, axiosGw } from 'constants/axiosInstances';
import { Firmware } from 'models/Firmware';
import { Note } from 'models/Note';

export const useGetAvailableFirmware = ({ deviceType }: { deviceType: string }) => {
  const { t } = useTranslation();
  const toast = useToast();

  return useQuery(
    ['get-device-profile'],
    () =>
      axiosFms
        .get(`firmwares?deviceType=${deviceType}&limit=10000&offset=0`)
        .then(({ data }: { data: { firmwares: Firmware[] } }) => data),
    {
      enabled: deviceType !== '',
      onError: (e: AxiosError) => {
        if (!toast.isActive('firmware-fetching-error'))
          toast({
            id: 'firmware-fetching-error',
            title: t('common.error'),
            description: t('crud.error_fetching_obj', {
              e: e?.response?.data?.ErrorDescription,
              obj: t('analytics.firmware'),
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

export const useUpdateDeviceToLatest = ({ serialNumber, compatible }: { serialNumber: string; compatible: string }) =>
  useMutation(({ keepRedirector }: { keepRedirector: boolean }) =>
    axiosFms.get(`firmwares?deviceType=${compatible}&latestOnly=true`).then((response) =>
      axiosGw.post(`device/${serialNumber}/upgrade`, {
        serialNumber,
        when: 0,
        keepRedirector,
        uri: response.data.uri,
      }),
    ),
  );

export const useUpdateDeviceFirmware = ({ serialNumber, onClose }: { serialNumber: string; onClose: () => void }) => {
  const { t } = useTranslation();
  const toast = useToast();

  return useMutation(
    ({ keepRedirector, uri }: { keepRedirector: boolean; uri: string }) =>
      axiosGw.post(`device/${serialNumber}/upgrade`, { serialNumber, when: 0, keepRedirector, uri }),
    {
      onSuccess: () => {
        toast({
          id: `device-upgrade-success-${uuid()}`,
          title: t('common.success'),
          description: t('commands.firmware_upgrade_success'),
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
          description: t('commands.firmware_upgrade_error', {
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

export type FirmwareAgeResponse = {
  serialNumber: string;
  age?: number;
  image?: string;
  imageDate?: number;
  latest?: boolean;
  latestId?: string;
  revision?: string;
  uri?: string;
};

const getFirmwareAges = (serialNumbers?: string[]) =>
  axiosFms.get(`firmwareAge?select=${serialNumbers?.join(',')}`).then((response) => response.data) as Promise<{
    ages: FirmwareAgeResponse[];
  }>;

export const useGetFirmwareAges = ({
  serialNumbers,
  onError,
}: {
  serialNumbers?: string[];
  onError?: (e: AxiosError) => void;
  limit?: number;
}) =>
  useQuery(['devices', 'firmwareAge', serialNumbers], () => getFirmwareAges(serialNumbers), {
    enabled: serialNumbers !== undefined && serialNumbers.length > 0,
    keepPreviousData: true,
    onError,
  });

const getFirmwareForDeviceType = async (offset: number, deviceType: string) =>
  axiosFms
    .get(`firmwares?deviceType=${deviceType}&limit=500&offset=${offset}`)
    .then((response) => response.data) as Promise<{
    firmwares: Firmware[];
  }>;
const getAllFirmwareForDeviceType = async (deviceType?: string) => {
  if (deviceType) {
    let offset = 0;
    let firmware: Firmware[] = [];
    let firmwareResponse: { firmwares: Firmware[] };
    do {
      // eslint-disable-next-line no-await-in-loop
      firmwareResponse = await getFirmwareForDeviceType(offset, deviceType);
      firmware = firmware.concat(firmwareResponse.firmwares);
      offset += 500;
    } while (firmwareResponse.firmwares.length === 500);
    return firmware;
  }
  return [] as Firmware[];
};
export const useGetFirmwareDeviceType = ({
  deviceType,
  onError,
}: {
  deviceType?: string;
  onError?: (e: AxiosError) => void;
}) =>
  useQuery(['firmware', deviceType], () => getAllFirmwareForDeviceType(deviceType), {
    enabled: deviceType !== undefined && deviceType.length > 0,
    keepPreviousData: true,
    onError,
  });

const getDeviceTypes = async () =>
  axiosFms.get(`firmwares?deviceSet=true`).then((response) => response.data) as Promise<{
    deviceTypes: string[];
  }>;
export const useGetDeviceTypes = () =>
  useQuery(['deviceTypes', 'all'], getDeviceTypes, {
    keepPreviousData: true,
    staleTime: 60 * 1000,
  });

const updateFirmware = async ({ id, description, notes }: { id: string; description?: string; notes?: Note[] }) =>
  axiosFms.put(`firmware/${id}`, { description, notes }) as Promise<Firmware>;
export const useUpdateUpdateFirmware = () => {
  const queryClient = useQueryClient();

  return useMutation(updateFirmware, {
    onSuccess: () => {
      queryClient.invalidateQueries(['firmware']);
    },
  });
};

export type FirmwareDashboardDeviceType = {
  tag: string;
  value: number;
};
export type FirmwareDashboardEndpoint = {
  tag: string;
  value: number;
};
export type FirmwareDashboardOui = {
  tag: string;
  value: number;
};
export type FirmwareDashboardRevision = {
  tag: string;
  value: number;
};
export type FirmwareDashboardStatus = {
  tag: 'connected' | 'not connected' | 'disconnected';
  value: number;
};
export type FirmwareDashboardSecondsOld = {
  tag: string;
  value: number;
};
export type FirmwareDashboardUnknownFirmwares = {
  tag: string;
  value: number;
};
export type FirmwareDashboardResponse = {
  deviceTypes: FirmwareDashboardDeviceType[];
  endPoints: FirmwareDashboardEndpoint[];
  numberOfDevices: number;
  ouis: FirmwareDashboardOui[];
  revisions: FirmwareDashboardRevision[];
  snapshot: number;
  status: FirmwareDashboardStatus[];
  totalSecondsOld: FirmwareDashboardSecondsOld[];
  unknownFirmwares: FirmwareDashboardUnknownFirmwares[];
  usingLatest: FirmwareDashboardUnknownFirmwares[];
};

const getDashboard = () =>
  axiosFms.get(`deviceReport`).then((response) => response.data) as Promise<FirmwareDashboardResponse>;

export const useGetFirmwareDashboard = () =>
  useQuery(['firmware', 'dashboard'], getDashboard, {
    keepPreviousData: true,
    refetchInterval: 30000,
  });
