import { QueryFunctionContext, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosSec } from 'constants/axiosInstances';

export type SecretName = 'google.maps.apikey' | string;

export type Secret = {
  key: SecretName;
  value: string;
};

export type SecretDictionaryValue = {
  key: SecretName;
  description: string;
};

const getSecret = async (context: QueryFunctionContext<string[], unknown>) =>
  axiosSec.get(`/systemSecret/${context.queryKey[1]}`).then(({ data }: { data: Secret }) => data);

export const useGetSystemSecret = ({ secret }: { secret: SecretName }) =>
  useQuery(['secrets', secret], getSecret, {
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 10,
  });

const getAllSecrets = async () =>
  axiosSec.get('/systemSecret/0?all=true').then(({ data }: { data: { secrets: Secret[] } }) => data.secrets);

export const useGetAllSystemSecrets = () => {
  const queryClient = useQueryClient();

  return useQuery(['secrets'], getAllSecrets, {
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 10,
    onSuccess: (data) => {
      for (const secret of data) {
        queryClient.setQueryData(['secrets', secret.key], secret);
      }
    },
  });
};

const getSecretsDictionary = async () =>
  axiosSec
    .get('/systemSecret/0?dictionary=true')
    .then(({ data }: { data: { knownKeys: SecretDictionaryValue[] } }) => data.knownKeys);

export const useGetSystemSecretsDictionary = () =>
  useQuery(['secrets', 'dictionary'], getSecretsDictionary, {
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 10,
  });

const updateSecret = async ({ key, value }: { key: string; value: string }) =>
  axiosSec.put(`/systemSecret/${key}?value=${value}`, { key, value });

export const useUpdateSystemSecret = () => {
  const queryClient = useQueryClient();
  return useMutation(updateSecret, {
    onSuccess: () => {
      queryClient.invalidateQueries(['secrets']);
    },
  });
};

export const useCreateSystemSecret = () => {
  const queryClient = useQueryClient();
  return useMutation(updateSecret, {
    onSuccess: () => {
      queryClient.invalidateQueries(['secrets']);
    },
  });
};

const deleteSecret = async (key: string) => axiosSec.delete(`/systemSecret/${key}`);

export const useDeleteSystemSecret = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteSecret, {
    onSuccess: () => {
      queryClient.invalidateQueries(['secrets']);
    },
  });
};
