import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosGw } from 'constants/axiosInstances';
import { UserRole } from 'models/User';

export type Script = {
  id: string;
  name: string;
  description: string;
  uri: string;
  defaultUploadURI: string;
  content: string;
  version: string;
  deferred: boolean;
  timeout: number;
  type: 'shell' | 'bundle';
  created: number;
  modified: number;
  author: string;
  restricted: UserRole[];
};

type ScriptResponse = {
  scripts: Script[];
};

const getScripts = (limit: number, offset: number) =>
  axiosGw.get(`scripts?limit=${limit}&offset=${offset}`).then((response) => response.data as ScriptResponse);

const getAllScripts = async () => {
  let offset = 0;
  let scripts: Script[] = [];
  let response: ScriptResponse;
  do {
    // eslint-disable-next-line no-await-in-loop
    response = await getScripts(100, offset);
    scripts = scripts.concat(response.scripts);
    offset += 100;
  } while (response.scripts.length === 500);
  return scripts;
};

export const useGetAllDeviceScripts = () =>
  useQuery(['deviceScripts', 'all'], getAllScripts, {
    staleTime: 30000,
    keepPreviousData: true,
  });

const getScript = (id: string) => axiosGw.get(`script/${id}`).then((response) => response.data as Script);
export const useGetDeviceScript = ({ id }: { id?: string }) =>
  useQuery(['deviceScript', id], () => getScript(id ?? ''), {
    enabled: !!id,
    staleTime: 30000,
    keepPreviousData: true,
  });

const deleteScript = async (id: string) => axiosGw.delete(`script/${id}`);
export const useDeleteScript = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient();

  return useMutation(deleteScript, {
    onSuccess: () => {
      queryClient.invalidateQueries(['deviceScripts']);
      queryClient.invalidateQueries(['deviceScript', id]);
    },
  });
};

const updateScript = async (data: {
  id: string;
  description?: string;
  name?: string;
  uri?: string;
  content?: string;
  defaultUploadURI?: string;
  version?: string;
  deferred?: boolean;
  timeout?: number;
}) => axiosGw.put(`script/${data.id}`, data).then((response) => response.data as Script);
export const useUpdateScript = ({ id }: { id?: string }) => {
  const queryClient = useQueryClient();

  return useMutation(updateScript, {
    onSuccess: (response) => {
      queryClient.invalidateQueries(['deviceScripts']);
      queryClient.setQueryData(['deviceScript', id], response);
    },
  });
};

const createScript = async (data: Partial<Script>) =>
  axiosGw.post(`script/0`, data).then((response) => response.data as Script);
export const useCreateScript = () => {
  const queryClient = useQueryClient();

  return useMutation(createScript, {
    onSuccess: (response) => {
      queryClient.invalidateQueries(['deviceScripts']);
      queryClient.setQueryData(['deviceScript', response.id], response);
    },
  });
};
