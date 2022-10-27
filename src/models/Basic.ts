import { Note } from './Note';

export interface BasicObjectInfo {
  name: string;
  description: string;
  notes: Note[];
  id: string;
  created: number;
  modified: number;
}

export type DeviceRules = {
  firmwareUpgrade: 'inherit' | 'off' | 'on';
  rcOnly: 'inherit' | 'off' | 'on';
  rrm: 'inherit' | 'off' | string;
};
