import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosGw } from 'constants/axiosInstances';
import { useEndpointStatus } from 'hooks/useEndpointStatus';
import { AxiosError } from 'models/Axios';
import { DeviceConfiguration } from 'models/Device';

export type DefaultConfigurationResponse = {
  configuration: DeviceConfiguration;
  created: number;
  description: string;
  lastModified: number;
  modelIds: string[];
  name: string;
};

const getDefaultConfigurations = async (offset: number) =>
  axiosGw.get(`default_configurations?limit=500&offset=${offset}`).then((response) => response.data) as Promise<{
    configurations: DefaultConfigurationResponse[];
  }>;
const getAllDefaultConfigurations = async () => {
  let offset = 0;
  let configurations: DefaultConfigurationResponse[] = [];
  let configurationsResponse: { configurations: DefaultConfigurationResponse[] };
  do {
    // eslint-disable-next-line no-await-in-loop
    configurationsResponse = await getDefaultConfigurations(offset);
    configurations = configurations.concat(configurationsResponse.configurations);
    offset += 500;
  } while (configurationsResponse.configurations.length === 500);
  return configurations;
};

export const useGetDefaultConfigurations = ({ onError }: { onError?: (e: AxiosError) => void }) => {
  const { isReady } = useEndpointStatus('owgw');
  return useQuery(['defaultConfigurations', 'all'], getAllDefaultConfigurations, {
    enabled: isReady,
    onError,
  });
};

const modifyConfig = async (data: Partial<DefaultConfigurationResponse> & { name: string }) =>
  axiosGw.put(`default_configuration/${data.name}`, data);
export const useUpdateDefaultConfig = () => {
  const queryClient = useQueryClient();

  return useMutation(modifyConfig, {
    onSuccess: () => {
      queryClient.invalidateQueries(['defaultConfigurations']);
    },
  });
};

const createConfig = async (data: Partial<DefaultConfigurationResponse> & { name: string }) =>
  axiosGw.post(`default_configuration/${encodeURIComponent(data.name)}`, data);
export const useCreateDefaultConfig = () => {
  const queryClient = useQueryClient();

  return useMutation(createConfig, {
    onSuccess: () => {
      queryClient.invalidateQueries(['defaultConfigurations']);
    },
  });
};

const deleteConfig = async (id: string) => axiosGw.delete(`default_configuration/${id}`);
export const useDeleteDefaultConfig = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteConfig, {
    onSuccess: () => {
      queryClient.invalidateQueries(['defaultConfigurations']);
    },
  });
};
