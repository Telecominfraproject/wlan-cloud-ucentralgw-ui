import { Note } from './Note';

export type UserRole =
  | 'root'
  | 'admin'
  | 'subscriber'
  | 'partner'
  | 'csr'
  | 'system'
  | 'installer'
  | 'noc'
  | 'accounting';

export interface User {
  name: string;
  avatar: string;
  description: string;
  currentPassword?: string;
  id: string;
  email: string;
  userRole: UserRole;
  userTypeProprietaryInfo: {
    authenticatorSecret: string;
    mfa: {
      enabled: boolean;
      method?: 'authenticator' | 'sms' | 'email' | '';
    };
    mobiles: { number: string }[];
  };
  suspended: boolean;
  notes: Note[];
}
