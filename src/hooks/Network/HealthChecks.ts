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

const getHealthChecksWithTimestamps = (serialNumber?: string, start?: number, end?: number) => async () =>
  axiosGw
    .get(`device/${serialNumber}/healthchecks?startDate=${start}&endDate=${end}`)
    .then((response) => response.data) as Promise<{
    values: HealthCheck[];
    serialNumber: string;
  }>;
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
  useQuery(['healthchecks', serialNumber, { start, end }], getHealthChecksWithTimestamps(serialNumber, start, end), {
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
