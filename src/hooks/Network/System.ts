import { useToast } from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import * as axios from 'axios';
import { useTranslation } from 'react-i18next';

type System = {
  UI?: string;
  certificates?: { expiresOn: number; filename: string }[];
  hostname: string;
  os: string;
  processors: 16;
  start: number;
  uptime: number;
  version: string;
};

const axiosInstance = axios.default.create();

axiosInstance.defaults.timeout = 120000;
axiosInstance.defaults.headers.get.Accept = 'application/json';
axiosInstance.defaults.headers.post.Accept = 'application/json';

export const useGetSystemInfo = ({ endpoint, name, token }: { endpoint: string; name: string; token: string }) =>
  useQuery(
    ['get-system-info', name, endpoint],
    () =>
      axiosInstance
        .get(`${endpoint}/api/v1/system?command=info`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(({ data }: { data: System }) => data),
    {
      staleTime: 60000,
    },
  );

export const useGetSubsystems = ({
  endpoint,
  enabled,
  name,
  token,
}: {
  endpoint: string;
  enabled: boolean;
  name: string;
  token: string;
}) =>
  useQuery(
    ['get-subsystems', name, endpoint],
    () =>
      axiosInstance
        .post(
          `${endpoint}/api/v1/system`,
          { command: 'getsubsystemnames' },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .then(({ data }: { data: { list: string[] } }) => data.list),
    {
      staleTime: 60000,
      enabled,
    },
  );

export const useReloadSubsystems = ({
  endpoint,
  resetSubs,
  token,
}: {
  endpoint: string;
  resetSubs: () => void;
  token: string;
}) => {
  const { t } = useTranslation();
  const toast = useToast();

  return useMutation(
    (subsToReload: string[]) =>
      axiosInstance.post(
        `${endpoint}/api/v1/system`,
        { command: 'reload', subsystems: subsToReload },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      ),
    {
      onSuccess: () => {
        toast({
          id: 'system-fetching-success',
          title: t('common.success'),
          description: t('system.success_reload'),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
        resetSubs();
      },
      onError: (e: AxiosError) => {
        toast({
          id: 'system-fetching-error',
          title: t('common.error'),
          description: t('crud.error_fetching_obj', {
            e: e?.response?.data?.ErrorDescription,
            obj: t('system.title'),
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
