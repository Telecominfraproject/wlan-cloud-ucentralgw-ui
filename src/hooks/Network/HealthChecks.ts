import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosGw } from 'constants/axiosInstances';
import { AxiosError } from 'models/Axios';

export type HealthCheck = {
  UUID: string;
  recorded: number;
  sanity: number;
  values: Record<string, unknown>;
};

const getHealthChecks = (limit: number, serialNumber?: string) => async () =>
  axiosGw
    .get(`device/${serialNumber}/healthchecks?newest=true&limit=${limit}`)
    .then((response) => response.data) as Promise<{
    values: HealthCheck[];
    serialNumber: string;
  }>;

export const useGetHealthChecks = ({
  serialNumber,
  limit,
  onError,
}: {
  serialNumber?: string;
  limit: number;
  onError?: (e: AxiosError) => void;
}) =>
  useQuery(['healthchecks', serialNumber, { limit }], getHealthChecks(limit, serialNumber), {
    keepPreviousData: true,
    enabled: serialNumber !== undefined && serialNumber !== '',
    staleTime: 30000,
    onError,
  });

const getHealthChecksBatch = (serialNumber?: string, start?: number, end?: number, limit?: number, offset?: number) =>
  axiosGw
    .get(`device/${serialNumber}/healthchecks?startDate=${start}&endDate=${end}&limit=${limit}&offset=${offset}`)
    .then((response) => response.data) as Promise<{
    values: HealthCheck[];
    serialNumber: string;
  }>;

const getHealthChecksByBatches = (serialNumber?: string, start?: number, end?: number) => async () => {
  let offset = 0;
  const limit = 100;
  let checks: HealthCheck[] = [];
  let latestResponse: {
    values: HealthCheck[];
    serialNumber: string;
  };
  do {
    // eslint-disable-next-line no-await-in-loop
    latestResponse = await getHealthChecksBatch(serialNumber, start, end, limit, offset);
    checks = checks.concat(latestResponse.values);
    offset += limit;
  } while (latestResponse.values.length === limit);
  return {
    values: checks,
    serialNumber: latestResponse.serialNumber,
  };
};

export const useGetHealthChecksWithTimestamps = ({
  serialNumber,
  start,
  end,
  onError,
}: {
  serialNumber?: string;
  start?: number;
  end?: number;
  onError?: (e: AxiosError) => void;
}) =>
  useQuery(['healthchecks', serialNumber, { start, end }], getHealthChecksByBatches(serialNumber, start, end), {
    enabled: serialNumber !== undefined && serialNumber !== '' && start !== undefined && end !== undefined,
    staleTime: 1000 * 60,
    onError,
  });

const deleteHealthChecks = async ({ serialNumber, endDate }: { serialNumber: string; endDate: number }) =>
  axiosGw.delete(`device/${serialNumber}/healthchecks?endDate=${endDate}`);
export const useDeleteHealthChecks = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteHealthChecks, {
    onSuccess: () => {
      queryClient.invalidateQueries(['healthchecks']);
    },
  });
};
