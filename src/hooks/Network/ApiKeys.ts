import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosSec } from 'constants/axiosInstances';
import { AxiosError } from 'models/Axios';

export type ApiKey = {
  id: string;
  userUuid: string;
  name: string;
  description: string;
  apiKey: string;
  expiresOn: number;
  lastUse: number;
};

export type ApiKeyResponse = {
  apiKeys: ApiKey[];
};

const getKeys = async (uuid?: string) =>
  axiosSec
    .get(`apiKey/${uuid}`)
    .then(({ data }: { data: ApiKeyResponse }) => data)
    .catch((e: AxiosError) => {
      if (e.response?.status === 404) {
        return {
          apiKeys: [],
        } as ApiKeyResponse;
      }
      throw e;
    });

export const useGetUserApiKeys = ({ userId }: { userId?: string }) =>
  useQuery(['apiKeys', userId], () => getKeys(userId), {
    enabled: userId !== undefined && userId !== '',
    staleTime: 1000 * 60 * 30,
  });

const deleteKey = async ({ userId, keyId }: { userId: string; keyId: string }) =>
  axiosSec.delete(`apiKey/${userId}?keyUuid=${keyId}`, {});
export const useDeleteApiKey = ({ userId }: { userId?: string }) => {
  const queryClient = useQueryClient();

  return useMutation(deleteKey, {
    onSuccess: () => {
      if (userId !== undefined && userId.length > 0) {
        queryClient.invalidateQueries(['apiKeys', userId]);
      }
    },
  });
};

const updateKey = async ({ description, userId, keyId }: { description: string; userId: string; keyId: string }) =>
  axiosSec.put(`apiKey/${userId}?keyUuid=${keyId}`, { id: keyId, userUuid: userId, description });
export const useUpdateApiKey = ({ userId }: { userId?: string }) => {
  const queryClient = useQueryClient();

  return useMutation(updateKey, {
    onSuccess: () => {
      if (userId !== undefined && userId.length > 0) {
        queryClient.invalidateQueries(['apiKeys', userId]);
      }
    },
  });
};

const createKey = async ({
  data,
  userId,
}: {
  userId: string;
  data: { userUuid: string; name: string; description: string; expiresOn: number };
}) => axiosSec.post(`apiKey/${userId}`, data);

export const useCreateApiKey = ({ userId }: { userId?: string }) => {
  const queryClient = useQueryClient();

  return useMutation(createKey, {
    onSuccess: () => {
      if (userId !== undefined && userId.length > 0) {
        queryClient.invalidateQueries(['apiKeys', userId]);
      }
    },
  });
};
