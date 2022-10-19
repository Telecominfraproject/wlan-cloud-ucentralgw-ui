import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosGw } from 'constants/axiosInstances';
import { AxiosError } from 'models/Axios';

export type DeviceCommandHistory = {
  UUID: string;
  attachFile: number;
  command: string;
  completed: number;
  custom: number;
  details: Record<string, unknown>;
  errorCode: number;
  errorText: string;
  executed: number;
  executionTime: number;
  results: Record<string, unknown>;
  serialNumber: string;
  status: string;
  submitted: number;
  submittedBy: string;
  waitingForFile: number;
  when: number;
};

const getCommands = (limit: number, serialNumber?: string) => async () =>
  axiosGw
    .get(`commands?serialNumber=${serialNumber}&newest=true&limit=${limit}`)
    .then((response) => response.data) as Promise<{
    commands: DeviceCommandHistory[];
  }>;

export const useGetCommandHistory = ({
  serialNumber,
  limit,
  onError,
}: {
  serialNumber?: string;
  limit: number;
  onError?: (e: AxiosError) => void;
}) =>
  useQuery(['commands', serialNumber, { limit }], getCommands(limit, serialNumber), {
    keepPreviousData: true,
    enabled: serialNumber !== undefined && serialNumber !== '',
    staleTime: 30000,
    onError,
  });

const deleteCommandHistory = async (id: string) => axiosGw.delete(`command/${id}`);
export const useDeleteCommand = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteCommandHistory, {
    onSuccess: () => {
      queryClient.invalidateQueries('commands');
    },
  });
};

export type EventQueueResponse = {
  UUID: string;
  attachFile: number;
  command: 'trace';
  completed: number;
  custom: number;
  details: {
    serial: string;
    types: string[];
  };
  errorCode: number;
  errorText: string;
  executed: number;
  executionTime: number;
  results: {
    serial: string;
    events: {
      dhcp: string[];
      wifi: string[];
    };
    status: {
      error: number;
      resultCode?: number;
      resultText?: string;
      text: string;
    };
  };
  serialNumber: string;
  status: string;
  submitted: number;
  submittedBy: string;
  waitingForFile: number;
  when: number;
};
const getEventQueue = async (serialNumber: string) =>
  axiosGw
    .post(`device/${serialNumber}/eventqueue`, {
      types: ['dhcp', 'wifi'],
      serialNumber,
    })
    .then((response) => response.data as EventQueueResponse);
export const useGetEventQueue = () => {
  const queryClient = useQueryClient();

  return useMutation(getEventQueue, {
    onSuccess: () => {
      queryClient.invalidateQueries(['commands']);
    },
  });
};

const configureDevice = (serialNumber: string) => async (configuration: Record<string, unknown>) =>
  axiosGw.post<unknown>(`device/${serialNumber}/configure`, {
    when: 0,
    UUID: 1,
    serialNumber,
    configuration,
  });

export const useConfigureDevice = ({ serialNumber }: { serialNumber: string }) => {
  const queryClient = useQueryClient();

  return useMutation(configureDevice(serialNumber), {
    onSuccess: () => {
      queryClient.invalidateQueries(['commands', serialNumber]);
    },
  });
};
