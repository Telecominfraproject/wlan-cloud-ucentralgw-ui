import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { axiosGw } from 'constants/axiosInstances';
import { PageInfo } from 'models/Table';

const getBlacklistCount = () =>
  axiosGw.get('blacklist?countOnly=true').then((response) => response.data) as Promise<{ count: number }>;

export const useGetBlacklistCount = ({ enabled }: { enabled: boolean }) =>
  useQuery(['blacklist', 'count'], getBlacklistCount, {
    enabled,
  });

export type BlacklistDevice = {
  author: string;
  created: number;
  reason: string;
  serialNumber: string;
};

const getBlacklistDevices = (limit: number, offset: number) =>
  axiosGw.get(`blacklist?limit=${limit}&offset=${offset}`).then((response) => response.data) as Promise<{
    devices: BlacklistDevice[];
  }>;

export const useGetBlacklistDevices = ({
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
    ['blacklist', 'all', { limit: pageInfo?.limit, offset }],
    () => getBlacklistDevices(pageInfo?.limit || 0, offset),
    {
      keepPreviousData: true,
      enabled: enabled && pageInfo !== undefined,
      staleTime: 30000,
      onError,
    },
  );
};

const deleteBlacklist = async (serialNumber: string) => axiosGw.delete(`blacklist/${serialNumber}`);
export const useDeleteBlacklistDevice = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteBlacklist, {
    onSuccess: () => {
      queryClient.invalidateQueries(['blacklist']);
    },
  });
};

const updateBlacklist = async (data: { serialNumber: string; reason: string }) =>
  axiosGw.put(`blacklist/${data.serialNumber}`, data).then((response: { data: BlacklistDevice }) => response.data);
export const useUpdateBlacklist = () => {
  const queryClient = useQueryClient();

  return useMutation(updateBlacklist, {
    onSuccess: (data) => {
      const queries = queryClient.getQueriesData(['blacklist', 'all']);

      for (const [key, devices] of queries) {
        const val = devices as undefined | { devices: BlacklistDevice[] };
        const indexToUpdate = val?.devices?.findIndex((device) => device.serialNumber === data.serialNumber);
        if (indexToUpdate !== undefined && indexToUpdate >= 0) {
          const newArray = [...(val?.devices ?? [])];
          newArray[indexToUpdate] = data;
          queryClient.setQueryData(key, { devices: newArray });
        }
      }
    },
  });
};

const addBlacklist = async (data: { serialNumber: string; reason: string }) =>
  axiosGw.post(`blacklist/${data.serialNumber}`, data).then((response: { data: BlacklistDevice }) => response.data);
export const useCreateBlacklist = () => {
  const queryClient = useQueryClient();

  return useMutation(addBlacklist, {
    onSuccess: () => {
      queryClient.invalidateQueries(['blacklist', 'count']);
      queryClient.invalidateQueries(['blacklist', 'all']);
    },
  });
};
