import { Note } from './Note';

export type InventoryTagApiResponse = {
  contact: string;
  created: number;
  description: string;
  devClass: string;
  deviceConfiguration: string;
  deviceRules: {
    firmwareUpgrade: 'inherit' | 'on' | 'off';
    rcOnly: 'inherit' | 'on' | 'off';
    rrm: 'inherit' | 'on' | 'off';
  };
  deviceType: string;
  entity: string;
  extendedInfo?: {
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
    deviceConfiguration?: {
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
  tags: string[];
  venue: string;
};
