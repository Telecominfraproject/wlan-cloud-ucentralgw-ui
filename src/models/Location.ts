import { Note } from './Note';

export interface CreateLocation {
  name: string;
  description?: string;
  id?: string;
  notes?: Note[];
  type: 'SERVICE' | 'EQUIPMENT' | 'AUTO' | 'MANUAL' | 'SPECIAL' | 'UNKNOWN' | 'CORPORATE';
  buildingName: string;
  addressLines: string[];
  city: string;
  state: string;
  postal: string;
  country: string;
  phones: string[];
  mobiles: string[];
  inUse?: string[];
  entity: string;
  geoCode: string;
}

export interface Location {
  name: string;
  description: string;
  id: string;
  notes: Note[];
  type: 'SERVICE' | 'EQUIPMENT' | 'AUTO' | 'MANUAL' | 'SPECIAL' | 'UNKNOWN' | 'CORPORATE';
  buildingName: string;
  addressLines: string[];
  city: string;
  state: string;
  postal: string;
  country: string;
  phones: string[];
  mobiles: string[];
  inUse: string[];
  entity: string;
  geoCode: string;
}

export interface AddressValue {
  long_name?: string;
  short_name?: string;
  types?: string[];
}

export interface AddressObject {
  street_number: AddressValue;
  route: AddressValue;
  administrative_area_level_3: AddressValue;
  administrative_area_level_2: AddressValue;
  administrative_area_level_1: AddressValue;
  locality: AddressValue;
  postal_code: AddressValue;
  country: AddressValue;
  geoCode?: string;
}

export interface GoogleResult {
  value: {
    address_components: AddressValue[];
    geometry: {
      location: string;
    };
  };
  label: string;
}
