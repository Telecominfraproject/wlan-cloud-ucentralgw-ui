import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as axios from 'axios';
import { LoginPage, useFormFields, useAuth } from 'ucentral-libs';

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
  newpassword: {
    value: '',
    error: false,
    placeholder: 'login.new_password',
  },
  confirmpassword: {
    value: '',
    error: false,
    placeholder: 'login.confirm_new_password',
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
  const [defaultConfig, setDefaultConfig] = useState({
    value: '',
    error: false,
    hidden: true,
    placeholder: 'login.url',
  });
  const [loading, setLoading] = useState(false);
  const [loginResponse, setLoginResponse] = useState(initialResponseState);
  const [forgotResponse, setForgotResponse] = useState(initialResponseState);
  const [changePasswordResponse, setChangeResponse] = useState(initialResponseState);
  const [policies, setPolicies] = useState({
    passwordPolicy: '',
    passwordPattern: '',
    accessPolicy: '',
  });
  const [isLogin, setIsLogin] = useState(true);
  const [isPasswordChange, setIsChangePassword] = useState(false);
  const [fields, updateFieldWithId, updateField, setFormFields] = useFormFields(initialFormState);
  const axiosInstance = axios.create();
  axiosInstance.defaults.timeout = 5000;

  const toggleForgotPassword = () => {
    setFormFields({
      ...initialFormState,
      ...{
        ucentralsecurl: defaultConfig,
      },
    });
    setLoginResponse(initialResponseState);
    setForgotResponse(initialResponseState);
    setIsLogin(!isLogin);
  };

  const cancelPasswordChange = () => {
    setFormFields({
      ...initialFormState,
      ...{
        ucentralsecurl: defaultConfig,
      },
    });
    setLoginResponse(initialResponseState);
    setForgotResponse(initialResponseState);
    setIsLogin(true);
    setIsChangePassword(false);
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
    if (isPasswordChange && fields.newpassword.value !== fields.confirmpassword.value) {
      updateField('confirmpassword', { error: true });
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
    let uCentralSecUrl = '';

    fetch('./config.json', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((response) => response.json())
      .then((json) => {
        const newUcentralSecConfig = {
          value: json.DEFAULT_UCENTRALSEC_URL,
          error: false,
          hidden: !json.ALLOW_UCENTRALSEC_CHANGE,
          placeholder: json.DEFAULT_UCENTRALSEC_URL,
        };
        uCentralSecUrl = newUcentralSecConfig.value;
        setDefaultConfig(newUcentralSecConfig);
        setFormFields({
          ...fields,
          ...{
            ucentralsecurl: newUcentralSecConfig,
          },
        });
        return axiosInstance.post(
          `${newUcentralSecConfig.value}/api/v1/oauth2?requirements=true`,
          {},
        );
      })
      .then((response) => {
        const newPolicies = response.data;
        newPolicies.accessPolicy = `${uCentralSecUrl}${newPolicies.accessPolicy}`;
        newPolicies.passwordPolicy = `${uCentralSecUrl}${newPolicies.passwordPolicy}`;
        setPolicies(newPolicies);
      })
      .catch();
  };

  const SignIn = () => {
    setLoginResponse(initialResponseState);
    if (signInValidation()) {
      setLoading(true);
      let token = '';

      const parameters = {
        userId: fields.username.value,
        password: fields.password.value,
      };

      if (isPasswordChange) {
        parameters.newPassword = fields.newpassword.value;
      }

      axiosInstance
        .post(`${fields.ucentralsecurl.value}/api/v1/oauth2`, parameters)
        .then((response) => {
          if (response.data.userMustChangePassword) {
            setIsChangePassword(true);
            return null;
          }
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
          if (response) {
            const endpoints = {
              owsec: fields.ucentralsecurl.value,
            };
            for (const endpoint of response.data.endpoints) {
              endpoints[endpoint.type] = endpoint.uri;
            }
            sessionStorage.setItem('gateway_endpoints', JSON.stringify(endpoints));
            setEndpoints(endpoints);
            setCurrentToken(token);
          }
        })
        .catch((error) => {
          if (!isPasswordChange) {
            if (
              error.response.status === 403 &&
              error.response?.data?.ErrorDescription === 'Password change expected.'
            ) {
              setIsChangePassword(true);
            }
            setLoginResponse({
              text: t('login.login_error'),
              error: true,
              tried: true,
            });
          } else {
            setChangeResponse({
              text:
                fields.newpassword.value === fields.password.value
                  ? t('login.previously_used')
                  : t('login.change_password_error'),
              error: true,
              tried: true,
            });
          }
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
      logo="assets/LindsayBB_Logo.png"
      signIn={SignIn}
      loading={loading}
      loginResponse={loginResponse}
      forgotResponse={forgotResponse}
      fields={fields}
      updateField={updateFieldWithId}
      toggleForgotPassword={toggleForgotPassword}
      isLogin={isLogin}
      isPasswordChange={isPasswordChange}
      onKeyDown={onKeyDown}
      sendForgotPasswordEmail={sendForgotPasswordEmail}
      changePasswordResponse={changePasswordResponse}
      cancelPasswordChange={cancelPasswordChange}
      policies={policies}
    />
  );
};

export default Login;
