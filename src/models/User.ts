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

export type User = {
  avatar: string;
  blackListed: boolean;
  creationDate: number;
  currentLoginURI: string;
  currentPassword: string;
  description: string;
  email: string;
  id: string;
  lastEmailCheck: number;
  lastLogin: number;
  lastPasswordChange: number;
  lastPasswords: string[];
  locale: string;
  location: string;
  modified: number;
  name: string;
  notes: Note[];
  oauthType: string;
  oauthUserInfo: string;
  owner: string;
  securityPolicy: string;
  securityPolicyChange: number;
  signingUp: string;
  suspended: boolean;
  userRole: UserRole;
  userTypeProprietaryInfo: {
    authenticatorSecret: string;
    mfa: {
      enabled: boolean;
      method?: 'authenticator' | 'sms' | 'email' | '';
    };
    mobiles: { number: string }[];
  };
  validated: boolean;
  validationDate: number;
  validationEmail: string;
  validationURI: string;
  waitingForEmailCheck: boolean;
};
