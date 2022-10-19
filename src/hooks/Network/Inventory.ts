/* eslint-disable import/prefer-default-export */
import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { axiosProv } from 'constants/axiosInstances';
import { Note } from 'models/Note';

export type InventoryTag = {
  contact: string;
  created: number;
  devClass: string;
  deviceConfiguration: string;
  devicesRules: {
    firmwareUpgrade: string;
    rcOnly: string;
    rrm: string;
  };
  deviceType: string;
  entity: string;
  extendedInfo: {
    venue?: {
      description: string;
      id: string;
      name: string;
    };
    entity?: {
      description: string;
      id: string;
      name: string;
    };
    subscriber?: {
      description: string;
      id: string;
      name: string;
    };
  };
  geoCode: string;
  id: string;
  locale: string;
  location: string;
  managementPolicy: string;
  modified: number;
  name: string;
  notes: Note[];
  qrCode: string;
  realMacAddress: string;
  serialNumber: string;
  state: string;
  subscriber: string;
  tags: unknown[];
  venue: string;
};

const getTag = async (serialNumber?: string) =>
  axiosProv.get(`inventory/${serialNumber}?withExtendedInfo=true`).then(({ data }) => data as InventoryTag);
export const useGetTag = ({ serialNumber, onError }: { serialNumber?: string; onError?: (e: AxiosError) => void }) =>
  useQuery(['tag', serialNumber], () => getTag(serialNumber), {
    enabled: serialNumber !== undefined && serialNumber !== '',
    onError,
  });
