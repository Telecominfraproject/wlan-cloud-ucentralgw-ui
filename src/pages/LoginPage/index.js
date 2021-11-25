import React from 'react';
import { useTranslation } from 'react-i18next';
import * as axios from 'axios';
import { LoginPage, useAuth, useToast } from 'ucentral-libs';

const Login = () => {
  const { t, i18n } = useTranslation();
  const { setCurrentToken, setEndpoints } = useAuth();
  const { addToast } = useToast();

  return (
    <LoginPage
      t={t}
      i18n={i18n}
      setCurrentToken={setCurrentToken}
      setEndpoints={setEndpoints}
      addToast={addToast}
      axios={axios}
    />
  );
};

export default Login;
