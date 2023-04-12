import { QueryFunctionContext, useQuery } from '@tanstack/react-query';
import { axiosGw } from 'constants/axiosInstances';

export type RadiusSession = {
  started: number;
  lastTransaction: number;
  inputPackets: number;
  outputPackets: number;
  inputOctets: number;
  outputOctets: number;
  inputGigaWords: number;
  outputGigaWords: number;
  sessionTime: number;
  serialNumber: string;
  destination: string;
  userName: string;
  accountingSessionId: string;
  accountingMultiSessionId: string;
  callingStationId: string;
};

export const getDeviceRadiusSessions = async (mac: string) =>
  axiosGw.get(`/radiusSessions/${mac}`).then((res) => res.data.sessions as RadiusSession[]);
const getDeviceSessions = async (context: QueryFunctionContext<[string, string]>) =>
  getDeviceRadiusSessions(context.queryKey[1]);
export const useGetDeviceRadiusSessions = ({ serialNumber }: { serialNumber: string }) =>
  useQuery(['radius-sessions', serialNumber], getDeviceSessions, {
    keepPreviousData: true,
    staleTime: 1000 * 60,
  });

export const getUsernameRadiusSessions = async (username: string) =>
  axiosGw.get(`/radiusSessions/0?userName=${username}`).then((res) => res.data.sessions as RadiusSession[]);
const getUserSessions = async (context: QueryFunctionContext<[string, string, string]>) =>
  getUsernameRadiusSessions(context.queryKey[2]);
export const useGetUserRadiusSessions = ({ userName }: { userName: string }) =>
  useQuery(['radius-sessions', 'username', userName], getUserSessions, {
    staleTime: 1000 * 60,
  });

export const getStationRadiusSessions = async (station: string) =>
  axiosGw.get(`/radiusSessions/0?mac=${station}`).then((res) => res.data.sessions as RadiusSession[]);
const getStationSessions = async (context: QueryFunctionContext<[string, string, string]>) =>
  getStationRadiusSessions(context.queryKey[2]);
export const useGetStationRadiusSessions = ({ station }: { station: string }) =>
  useQuery(['radius-sessions', 'station', station], getStationSessions, {
    staleTime: 1000 * 60,
  });
