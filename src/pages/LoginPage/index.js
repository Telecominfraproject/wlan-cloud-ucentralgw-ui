import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as axios from 'axios';
import { LoginPage } from 'ucentral-libs';
import { useAuth } from 'contexts/AuthProvider';

const Login = () => {
  const { t, i18n } = useTranslation();
  const { setCurrentToken, setEndpoints } = useAuth();
  const [hadError, setHadError] = useState(false);
  const [defaultConfig, setDefaultConfig] = useState({
    DEFAULT_UCENTRALSEC_URL: '',
    ALLOW_UCENTRALSEC_CHANGE: true,
  });
  const axiosInstance = axios.create();
  axiosInstance.defaults.timeout = 5000;

  const getDefaultConfig = async () => {
    fetch('./config.json', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((response) => response.json())
      .then((json) => {
        setDefaultConfig(json);
      })
      .catch();
  };

  const SignIn = (credentials, uCentralSecUrl) => {
    let token = '';
    const finalUCentralSecUrl = defaultConfig.ALLOW_UCENTRALSEC_CHANGE
      ? uCentralSecUrl
      : defaultConfig.DEFAULT_UCENTRALSEC_URL;

    axiosInstance
      .post(`${finalUCentralSecUrl}/api/v1/oauth2`, credentials)
      .then((response) => {
        sessionStorage.setItem('access_token', response.data.access_token);
        token = response.data.access_token;
        return axiosInstance.get(`${finalUCentralSecUrl}/api/v1/systemEndpoints`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${response.data.access_token}`,
          },
        });
      })
      .then((response) => {
        const endpoints = {
          ucentralsec: finalUCentralSecUrl,
        };
        for (const endpoint of response.data.endpoints) {
          endpoints[endpoint.type] = endpoint.uri;
        }
        sessionStorage.setItem('gateway_endpoints', JSON.stringify(endpoints));
        setEndpoints(endpoints);
        setCurrentToken(token);
      })
      .catch(() => {
        setHadError(true);
      });
  };

  useEffect(() => {
    getDefaultConfig();
  }, []);

  return (
    <LoginPage
      t={t}
      i18n={i18n}
      signIn={SignIn}
      defaultConfig={defaultConfig}
      error={hadError}
      setHadError={setHadError}
    />
  );
};

export default Login;
