import { useQuery } from '@tanstack/react-query';
import { axiosGw, axiosProv, axiosSec } from 'constants/axiosInstances';

export type EndpointApiResponse = {
  authenticationType: string;
  id: number;
  type: string;
  uri: string;
  vendor: string;
};

export const useGetEndpoints = ({ onSuccess }: { onSuccess: (data: EndpointApiResponse[]) => void }) =>
  useQuery(
    ['get-endpoints'],
    () =>
      axiosSec
        .get('systemEndpoints')
        .then(({ data }: { data: { endpoints: EndpointApiResponse[] } }) => data.endpoints),
    {
      enabled: false,
      staleTime: Infinity,
      onSuccess,
    },
  );

export const useGetGatewayUi = () =>
  useQuery(['get-gw-ui'], () => axiosGw.get('system?command=info').then(({ data }) => data.UI), {
    enabled: true,
    staleTime: Infinity,
  });
export const useGetProvUi = () =>
  useQuery(['provisioning', 'ui'], () => axiosProv.get('system?command=info').then(({ data }) => data.UI as string), {
    enabled: true,
    staleTime: Infinity,
  });
