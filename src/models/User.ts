import { Note } from './Note';

export interface User {
  name: string;
  avatar: string;
  description: string;
  currentPassword?: string;
  id: string;
  email: string;
  userRole: string;
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
