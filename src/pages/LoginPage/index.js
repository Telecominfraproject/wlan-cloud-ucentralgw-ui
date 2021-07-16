import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as axios from 'axios';
import { LoginPage, useFormFields } from 'ucentral-libs';
import { useAuth } from 'contexts/AuthProvider';

const initialFormState = {
  username: {
    value: '',
    error: false,
    placeholder: 'login.username',
  },
  password: {
    value: '',
    error: false,
    placeholder: 'login.password',
  },
  ucentralsecurl: {
    value: '',
    error: false,
    hidden: true,
    placeholder: 'login.url',
  },
  forgotusername: {
    value: '',
    error: false,
    placeholder: 'login.username',
  },
};

const initialResponseState = {
  text: '',
  error: false,
  tried: false,
};

const Login = () => {
  const { t, i18n } = useTranslation();
  const { setCurrentToken, setEndpoints } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginResponse, setLoginResponse] = useState(initialResponseState);
  const [forgotResponse, setForgotResponse] = useState(initialResponseState);
  const [isLogin, setIsLogin] = useState(true);
  const [fields, updateFieldWithId, updateField, setFormFields] = useFormFields(initialFormState);
  const axiosInstance = axios.create();
  axiosInstance.defaults.timeout = 5000;

  const toggleForgotPassword = () => {
    setFormFields(initialFormState);
    setLoginResponse(initialResponseState);
    setForgotResponse(initialResponseState);
    setIsLogin(!isLogin);
  };

  const signInValidation = () => {
    let valid = true;
    if (fields.ucentralsecurl.value === '') {
      updateField('ucentralsecurl', { error: true });
      valid = false;
    }
    if (fields.password.value === '') {
      updateField('password', { error: true });
      valid = false;
    }
    if (fields.username.value === '') {
      updateField('username', { error: true });
      valid = false;
    }
    return valid;
  };

  const forgotValidation = () => {
    let valid = true;

    if (fields.ucentralsecurl.value === '') {
      updateField('ucentralsecurl', { error: true });
      valid = false;
    }
    if (fields.forgotusername.value === '') {
      updateField('forgotusername', { error: true });
      valid = false;
    }
    return valid;
  };

  const onKeyDown = (event, action) => {
    if (event.code === 'Enter') {
      action();
    }
  };

  const getDefaultConfig = async () => {
    fetch('./config.json', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((response) => response.json())
      .then((json) => {
        setFormFields({
          ...fields,
          ...{
            ucentralsecurl: {
              value: json.DEFAULT_UCENTRALSEC_URL,
              error: false,
              hidden: !json.ALLOW_UCENTRALSEC_CHANGE,
              placeholder: json.DEFAULT_UCENTRALSEC_URL,
            },
          },
        });
      })
      .catch();
  };

  const SignIn = () => {
    setLoginResponse(initialResponseState);
    if (signInValidation()) {
      setLoading(true);
      let token = '';

      axiosInstance
        .post(`${fields.ucentralsecurl.value}/api/v1/oauth2`, {
          userId: fields.username.value,
          password: fields.password.value,
        })
        .then((response) => {
          sessionStorage.setItem('access_token', response.data.access_token);
          token = response.data.access_token;
          return axiosInstance.get(`${fields.ucentralsecurl.value}/api/v1/systemEndpoints`, {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${response.data.access_token}`,
            },
          });
        })
        .then((response) => {
          const endpoints = {
            ucentralsec: fields.ucentralsecurl.value,
          };
          for (const endpoint of response.data.endpoints) {
            endpoints[endpoint.type] = endpoint.uri;
          }
          sessionStorage.setItem('gateway_endpoints', JSON.stringify(endpoints));
          setEndpoints(endpoints);
          setCurrentToken(token);
        })
        .catch(() => {
          setLoginResponse({
            text: t('login.login_error'),
            error: true,
            tried: true,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const sendForgotPasswordEmail = () => {
    setForgotResponse(initialResponseState);

    if (forgotValidation()) {
      setLoading(true);

      axiosInstance
        .post(`${fields.ucentralsecurl.value}/api/v1/oauth2?forgotPassword=true`, {
          userId: fields.forgotusername.value,
        })
        .then(() => {
          updateField('forgotusername', {
            value: '',
          });
          setForgotResponse({
            text: t('login.forgot_password_success'),
            error: false,
            tried: true,
          });
        })
        .catch(() => {
          setForgotResponse({
            text: t('login.forgot_password_error'),
            error: true,
            tried: true,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    getDefaultConfig();
  }, []);

  return (
    <LoginPage
      t={t}
      i18n={i18n}
      signIn={SignIn}
      loading={loading}
      loginResponse={loginResponse}
      forgotResponse={forgotResponse}
      fields={fields}
      updateField={updateFieldWithId}
      toggleForgotPassword={toggleForgotPassword}
      isLogin={isLogin}
      onKeyDown={onKeyDown}
      sendForgotPasswordEmail={sendForgotPasswordEmail}
    />
  );
};

export default Login;
