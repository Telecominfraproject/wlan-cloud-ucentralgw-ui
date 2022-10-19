import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { axiosGw } from 'constants/axiosInstances';

export type DeviceLog = {
  UUID: string;
  recorded: number;
  log: string;
  logType: number;
  data: Record<string, unknown>;
  severity: number;
};

const getDeviceLogs = (limit: number, serialNumber?: string) => async () =>
  axiosGw.get(`device/${serialNumber}/logs?newest=true&limit=${limit}`).then((response) => response.data) as Promise<{
    values: DeviceLog[];
    serialNumber: string;
  }>;

export const useGetDeviceLogs = ({
  serialNumber,
  limit,
  onError,
}: {
  serialNumber?: string;
  limit: number;
  onError?: (e: AxiosError) => void;
}) =>
  useQuery(['devicelogs', serialNumber, { limit }], getDeviceLogs(limit, serialNumber), {
    keepPreviousData: true,
    enabled: serialNumber !== undefined && serialNumber !== '',
    staleTime: 30000,
    onError,
  });

const deleteLogs = async ({ serialNumber, endDate }: { serialNumber: string; endDate: number }) =>
  axiosGw.delete(`device/${serialNumber}/logs?endDate=${endDate}`);
export const useDeleteLogs = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteLogs, {
    onSuccess: () => {
      queryClient.invalidateQueries('devicelogs');
    },
  });
};
