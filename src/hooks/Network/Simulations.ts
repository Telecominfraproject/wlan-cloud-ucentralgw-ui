import { QueryFunctionContext, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosGw, axiosOwls } from 'constants/axiosInstances';
import { AtLeast } from 'models/General';

export type Simulation = {
  clientInterval: number;
  concurrentDeviceS: number;
  deviceType: string;
  devices: number;
  gateway: string;
  healthCheckInterval: number;
  id: string;
  keepAlive: number;
  key: string;
  macPrefix: string;
  minAssociations: number;
  maxAssociations: number;
  minClients: number;
  maxClients: number;
  name: string;
  reconnectionInterval: number;
  simulationLength: number;
  stateInterval: number;
  threads: number;
};

const getSimulations = () => async () =>
  axiosOwls.get(`simulation/*`).then((response) => response.data as { list: Simulation[] });

export const useGetSimulations = () =>
  useQuery(['simulations'], getSimulations(), {
    keepPreviousData: true,
    staleTime: 30000,
  });

const getSimulation = (id?: string) => async () =>
  axiosOwls.get(`simulation/${id}`).then((response) => response.data as { list: Simulation[] });
export const useGetSimulation = ({ id }: { id?: string }) =>
  useQuery(['simulation', id], getSimulation(id), {
    keepPreviousData: true,
    enabled: id !== undefined,
    staleTime: 30000,
  });

const createSimulation = async (newSimulation: Partial<Simulation>) => axiosOwls.post(`simulation/0`, newSimulation);
export const useCreateSimulation = () => {
  const queryClient = useQueryClient();

  return useMutation(createSimulation, {
    onSuccess: () => {
      queryClient.invalidateQueries(['simulations']);
    },
  });
};

const updateSimulation = async (newSimulation: AtLeast<Simulation, 'id'>) =>
  axiosOwls.put(`simulation/${newSimulation.id}`, newSimulation).then((response) => response.data as Simulation);
export const useUpdateSimulation = () => {
  const queryClient = useQueryClient();

  return useMutation(updateSimulation, {
    onSuccess: (newSimulation) => {
      queryClient.setQueryData(['simulation'], newSimulation);
      queryClient.invalidateQueries(['simulations']);
    },
  });
};

const deleteSimulation = async ({ id }: { id: string }) => axiosOwls.delete(`simulation/${id}`);
export const useDeleteSimulation = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteSimulation, {
    onSuccess: () => {
      queryClient.invalidateQueries(['simulations']);
    },
  });
};

const startSimulation = async ({ id }: { id: string }) => axiosOwls.post(`operation/${id}?operation=start`);
export const useStartSimulation = () => {
  const queryClient = useQueryClient();

  return useMutation(startSimulation, {
    onSuccess: () => {
      queryClient.invalidateQueries(['simulations', 'status']);
    },
  });
};
const stopSimulation = async ({ runId, simulationId }: { simulationId: string; runId: string }) =>
  axiosOwls.post(`operation/${simulationId}?runningId=${runId}&operation=stop`);
export const useStopSimulation = () => {
  const queryClient = useQueryClient();

  return useMutation(stopSimulation, {
    onSuccess: () => {
      queryClient.invalidateQueries(['simulations', 'status']);
    },
  });
};
const cancelSimulation = async ({ runId, simulationId }: { simulationId: string; runId: string }) =>
  axiosOwls.post(`operation/${simulationId}?runningId=${runId}&operation=cancel`);
export const useCancelSimulation = () => {
  const queryClient = useQueryClient();

  return useMutation(cancelSimulation, {
    onSuccess: () => {
      queryClient.invalidateQueries(['simulations', 'status']);
    },
  });
};

export type SimulationStatus = {
  endTime: number;
  errorDevices: number;
  id: string;
  liveDevices: number;
  msgsRx: number;
  msgsTx: number;
  owner: string;
  rx: number;
  simulationId: string;
  startTime: number;
  state: 'running' | 'completed' | 'cancelled' | 'none';
  timeToFullDevices: number;
  tx: number;
};
const getSimulationsStatus = async () =>
  axiosOwls.get(`status/*`).then((response) => response.data as SimulationStatus[]);
export const useGetSimulationsStatus = () =>
  useQuery(['simulations', 'status'], getSimulationsStatus, {
    keepPreviousData: true,
    staleTime: Infinity,
  });

const getSimulationStatus = async (context: QueryFunctionContext<[string, string, string]>) =>
  axiosOwls.get(`status/${context.queryKey[2]}`).then((response) => response.data as SimulationStatus);
export const useGetSimulationStatus = ({ id }: { id: string }) =>
  useQuery(['simulations', 'status', id], getSimulationStatus, {
    keepPreviousData: true,
    staleTime: Infinity,
  });

const getSimulationHistory = async (context: QueryFunctionContext<[string, string, string]>) =>
  axiosOwls.get(`results/${context.queryKey[2]}`).then((response) => response.data.list as SimulationStatus[]);
export const useGetSimulationHistory = ({ id }: { id: string }) =>
  useQuery(['simulations', 'history', id], getSimulationHistory, {
    keepPreviousData: true,
    enabled: !!id,
  });

const deleteSimulationResult = async ({ id }: { id: string }) => axiosOwls.delete(`results/${id}`);
export const useDeleteSimulationResult = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteSimulationResult, {
    onSuccess: () => {
      queryClient.invalidateQueries(['simulations', 'history']);
    },
  });
};

const deleteSimulatedDevices = async () => axiosGw.delete('devices?simulatedDevices=true');

export const useDeleteSimulatedDevices = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteSimulatedDevices, {
    onSuccess: () => {
      queryClient.invalidateQueries(['devices']);
    },
  });
};
