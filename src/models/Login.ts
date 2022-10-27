export interface LoginFormProps {
  form: 'login' | 'change-password' | 'forgot-password' | 'mfa';
  data?: {
    userId?: string;
    password?: string;
    verifUuid?: string;
    method?: string;
    rememberMe?: boolean;
  };
}
