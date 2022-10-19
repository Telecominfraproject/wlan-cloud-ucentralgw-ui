import { useQuery } from 'react-query';
import { axiosGw } from 'constants/axiosInstances';

export type ControllerDashboardAssociations = {
  tag: '2G' | '5G' | '6G';
  value: number;
};
export type ControllerDashboardCertificates = {
  tag: 'verified' | 'serial mismatch' | 'no certificate' | string;
  value: number;
};
export type ControllerDashboardCommands = {
  tag: string;
  value: number;
};
export type ControllerDashboardDeviceType = {
  tag: string;
  value: number;
};
export type ControllerDashboardHealth = {
  tag: '100%' | '>90%' | '>60%' | '<60%';
  value: number;
};
export type ControllerDashboardLastContact = {
  tag: string;
  value: number;
};
export type ControllerDashboardMemoryUsed = {
  tag: string;
  value: number;
};
export type ControllerDashboardStatus = {
  tag: 'connected' | 'not connected' | 'disconnected';
  value: number;
};
export type ControllerDashboardUptimes = {
  tag: 'now' | '>day' | '>week' | '>month' | '>hour';
  value: number;
};
export type ControllerDashboardVendor = {
  tag: string;
  value: number;
};

export type ControllerDashboardResponse = {
  associations: ControllerDashboardAssociations[];
  certificates: ControllerDashboardCertificates[];
  commands: ControllerDashboardCommands[];
  deviceType: ControllerDashboardDeviceType[];
  healths: ControllerDashboardHealth[];
  lastContact: ControllerDashboardLastContact[];
  memoryUsed: ControllerDashboardMemoryUsed[];
  numberOfDevices: number;
  snapshot: number;
  status: ControllerDashboardStatus[];
  upTimes: ControllerDashboardUptimes[];
  vendors: ControllerDashboardVendor[];
};

const getDashboard = () =>
  axiosGw.get(`deviceDashboard`).then((response) => response.data) as Promise<ControllerDashboardResponse>;

export const useGetControllerDashboard = () =>
  useQuery(['controller', 'dashboard'], getDashboard, {
    keepPreviousData: true,
    refetchInterval: 30000,
  });
