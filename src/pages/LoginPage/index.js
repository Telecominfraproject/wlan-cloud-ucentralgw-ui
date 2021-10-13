import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as axios from 'axios';
import { LoginPage, useFormFields, useAuth, useToast } from 'ucentral-libs';
import { setItem } from 'utils/localStorageHelper';

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
  const { addToast } = useToast();
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
  const [formType, setFormType] = useState('login');
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
    if (formType === 'login') setFormType('forgot-password');
    else setFormType('login');
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
    setFormType('login');
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
    if (
      formType === 'change-password' &&
      fields.newpassword.value !== fields.confirmpassword.value
    ) {
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

  const getGatewayUIUrl = (token, gwUrl) => {
    axiosInstance
      .get(`${gwUrl}/api/v1/system?command=info`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.UI) setItem('owgw-ui', response.data.UI);
      })
      .catch(() => {});
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

      if (formType === 'change-password') {
        parameters.newPassword = fields.newpassword.value;
      }

      axiosInstance
        .post(`${fields.ucentralsecurl.value}/api/v1/oauth2`, parameters)
        .then((response) => {
          // If there's MFA to do
          if (response.data.method && response.data.created) {
            setFormType(`validation-${response.data.method}-${response.data.uuid}`);
            return null;
          }
          if (response.data.userMustChangePassword) {
            setFormType('change-password');
            return null;
          }
          setItem('access_token', response.data.access_token);
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
            if (endpoints.owgw) getGatewayUIUrl(token, endpoints.owgw);
            setItem('gateway_endpoints', JSON.stringify(endpoints));
            setEndpoints(endpoints);
            setCurrentToken(token);
          }
        })
        .catch((error) => {
          if (formType !== 'change-password') {
            if (
              error.response.status === 403 &&
              error.response?.data?.ErrorDescription === 'Password change expected.'
            ) {
              setFormType('change-password');
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

  const validateCode = (code) => {
    const options = {
      headers: {
        Accept: 'application/json',
      },
    };

    const parameters = {
      uuid: formType.split('-').slice(2).join('-'),
      answer: code,
    };

    let token = '';

    return axiosInstance
      .post(
        `${fields.ucentralsecurl.value}/api/v1/oauth2?completeMFAChallenge=true`,
        parameters,
        options,
      )
      .then((response) => {
        if (response.data.userMustChangePassword) {
          setFormType('change-password');
          return null;
        }
        setItem('access_token', response.data.access_token);
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
          if (endpoints.owgw) getGatewayUIUrl(token, endpoints.owgw);
          setItem('gateway_endpoints', JSON.stringify(endpoints));
          setEndpoints(endpoints);
          setCurrentToken(token);
        }
      })
      .catch(() => false)
      .finally(() => {
        setLoading(false);
        return true;
      });
  };

  const resendValidationCode = () => {
    const options = {
      headers: {
        Accept: 'application/json',
      },
    };

    const parameters = {
      uuid: formType.split('-').slice(2).join('-'),
    };

    return axiosInstance
      .post(`${fields.ucentralsecurl.value}/api/v1/oauth2?resendMFACode=true`, parameters, options)
      .then(() => {
        addToast({
          title: t('common.success'),
          body: t('user.new_code_sent'),
          color: 'success',
          autohide: true,
        });
        return true;
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('login.authentication_expired'),
          color: 'danger',
          autohide: true,
        });
        if (e.response?.data?.ErrorCode === 403) setFormType('login');
        return false;
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
      loading={loading}
      logo="assets/OpenWiFi_LogoLockup_DarkGreyColour.svg"
      loginResponse={loginResponse}
      forgotResponse={forgotResponse}
      fields={fields}
      updateField={updateFieldWithId}
      toggleForgotPassword={toggleForgotPassword}
      formType={formType}
      onKeyDown={onKeyDown}
      sendForgotPasswordEmail={sendForgotPasswordEmail}
      changePasswordResponse={changePasswordResponse}
      cancelPasswordChange={cancelPasswordChange}
      policies={policies}
      validateCode={validateCode}
      resendValidationCode={resendValidationCode}
    />
  );
};

export default Login;
