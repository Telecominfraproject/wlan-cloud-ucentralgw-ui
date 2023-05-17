import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosGw } from 'constants/axiosInstances';
import { AxiosError } from 'models/Axios';

export type DeviceLog = {
  UUID: string;
  recorded: number;
  log: string;
  logType: number;
  data: Record<string, unknown>;
  severity: number;
};

const getDeviceLogs = (limit: number, serialNumber?: string, logType?: 0 | 1 | 2) => async () =>
  axiosGw
    .get(`device/${serialNumber}/logs?newest=true&limit=${limit}&logType=${logType}`)
    .then((response) => response.data) as Promise<{
    values: DeviceLog[];
    serialNumber: string;
  }>;

export const useGetDeviceLogs = ({
  serialNumber,
  limit,
  onError,
  logType,
}: {
  serialNumber?: string;
  limit: number;
  onError?: (e: AxiosError) => void;
  logType?: 0 | 1 | 2;
}) =>
  useQuery(['devicelogs', serialNumber, { limit, logType }], getDeviceLogs(limit, serialNumber, logType ?? 0), {
    keepPreviousData: true,
    enabled: serialNumber !== undefined && serialNumber !== '',
    staleTime: 30000,
    onError,
  });

const deleteLogs = async ({
  serialNumber,
  endDate,
  logType,
}: {
  serialNumber: string;
  endDate: number;
  logType: 0 | 1 | 2;
}) => axiosGw.delete(`device/${serialNumber}/logs?endDate=${endDate}&logType=${logType}`);
export const useDeleteLogs = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteLogs, {
    onSuccess: () => {
      queryClient.invalidateQueries(['devicelogs']);
    },
  });
};

const getLogsBatch = (
  serialNumber?: string,
  start?: number,
  end?: number,
  limit?: number,
  offset?: number,
  logType?: 0 | 1 | 2,
) =>
  axiosGw
    .get(
      `device/${serialNumber}/logs?startDate=${start}&endDate=${end}&limit=${limit}&offset=${offset}&logType=${logType}`,
    )
    .then((response) => response.data) as Promise<{
    values: DeviceLog[];
    serialNumber: string;
  }>;

const getDeviceLogsWithTimestamps =
  (serialNumber?: string, start?: number, end?: number, logType?: 0 | 1 | 2) => async () => {
    let offset = 0;
    const limit = 100;
    let logs: DeviceLog[] = [];
    let latestResponse: {
      values: DeviceLog[];
      serialNumber: string;
    };
    do {
      // eslint-disable-next-line no-await-in-loop
      latestResponse = await getLogsBatch(serialNumber, start, end, limit, offset, logType);
      logs = logs.concat(latestResponse.values);
      offset += limit;
    } while (latestResponse.values.length === limit);
    return {
      values: logs,
    };
  };

export const useGetDeviceLogsWithTimestamps = ({
  serialNumber,
  start,
  end,
  onError,
  logType,
}: {
  serialNumber?: string;
  start?: number;
  end?: number;
  onError?: (e: AxiosError) => void;
  logType?: 0 | 1 | 2;
}) =>
  useQuery(
    ['devicelogs', serialNumber, { start, end, logType }],
    getDeviceLogsWithTimestamps(serialNumber, start, end, logType ?? 0),
    {
      enabled: serialNumber !== undefined && serialNumber !== '' && start !== undefined && end !== undefined,
      staleTime: 1000 * 60,
      onError,
    },
  );
