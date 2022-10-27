import { Note } from './Note';

export interface Firmware {
  created: number;
  description: string;
  deviceType: string;
  digest: string;
  downloadCount: number;
  firmwareHash: string;
  id: string;
  image: string;
  imageDate: number;
  latest: boolean;
  location: string;
  notes: Note[];
  owner: string;
  release: string;
  revision: string;
  size: number;
  uploader: string;
  uri: string;
}
