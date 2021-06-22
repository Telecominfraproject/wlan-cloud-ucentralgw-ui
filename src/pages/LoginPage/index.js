import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CRow,
  CPopover,
  CAlert,
  CInvalidFeedback,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser, cilLockLocked, cilLink } from '@coreui/icons';
import { useDispatch } from 'react-redux';
import axiosInstance from 'utils/axiosInstance';
import logo from 'assets/OpenWiFi_LogoLockup_DarkGreyColour.svg';
import LanguageSwitcher from 'components/LanguageSwitcher';
import styles from './index.module.scss';

const Login = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [userId, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [gatewayUrl, setGatewayUrl] = useState('');
  const [hadError, setHadError] = useState(false);
  const [emptyUsername, setEmptyUsername] = useState(false);
  const [emptyPassword, setEmptyPassword] = useState(false);
  const [emptyGateway, setEmptyGateway] = useState(false);
  const [defaultConfig, setDefaultConfig] = useState({
    DEFAULT_GATEWAY_URL: 'https://ucentral.dpaas.arilia.com:16001',
    ALLOW_GATEWAY_CHANGE: true,
  });
  const placeholderUrl = 'Gateway URL (ex: https://your-url:port)';

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

  const formValidation = () => {
    setHadError(false);

    let isSuccessful = true;

    if (userId.trim() === '') {
      setEmptyUsername(true);
      isSuccessful = false;
    }

    if (password.trim() === '') {
      setEmptyPassword(true);
      isSuccessful = false;
    }

    if (gatewayUrl.trim() === '') {
      setEmptyGateway(true);
      isSuccessful = false;
    }
    return isSuccessful;
  };

  const SignIn = (credentials) => {
    const gatewayUrlToUse = defaultConfig.ALLOW_GATEWAY_CHANGE
      ? gatewayUrl
      : defaultConfig.DEFAULT_GATEWAY_URL;

    axiosInstance
      .post(`${gatewayUrlToUse}/api/v1/oauth2`, credentials)
      .then((response) => {
        sessionStorage.setItem('gw_url', `${gatewayUrlToUse}/api/v1`);
        sessionStorage.setItem('access_token', response.data.access_token);
        dispatch({ type: 'set', connected: true });
      })
      .catch(() => {
        setHadError(true);
      });
  };

  const onKeyDown = (event) => {
    if (event.code === 'Enter' && formValidation()) {
      SignIn({ userId, password });
    }
  };

  useEffect(() => {
    if (emptyUsername) setEmptyUsername(false);
  }, [userId]);
  useEffect(() => {
    if (emptyPassword) setEmptyPassword(false);
  }, [password]);
  useEffect(() => {
    if (emptyGateway) setEmptyGateway(false);
  }, [gatewayUrl]);
  useEffect(() => {
    getDefaultConfig();
  }, []);
  useEffect(() => {
    setGatewayUrl(defaultConfig.DEFAULT_GATEWAY_URL);
  }, [defaultConfig]);

  return (
    <div className="c-app c-default-layout flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md="8">
            <img
              className={[styles.logo, 'c-sidebar-brand-full'].join(' ')}
              src={logo}
              alt="OpenWifi"
            />
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onKeyDown={onKeyDown}>
                    <h1>{t('login.login')}</h1>
                    <p className="text-muted">{t('login.sign_in_to_account')}</p>
                    <CInputGroup className="mb-3">
                      <CPopover content="Username">
                        <CInputGroupPrepend>
                          <CInputGroupText>
                            <CIcon name="cilUser" content={cilUser} />
                          </CInputGroupText>
                        </CInputGroupPrepend>
                      </CPopover>
                      <CInput
                        invalid={emptyUsername}
                        autoFocus
                        required
                        type="text"
                        placeholder={t('login.username')}
                        autoComplete="username"
                        onChange={(event) => setUsername(event.target.value)}
                      />
                      <CInvalidFeedback className="help-block">
                        {t('login.please_enter_username')}
                      </CInvalidFeedback>
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CPopover content="Password">
                        <CInputGroupPrepend>
                          <CInputGroupText>
                            <CIcon content={cilLockLocked} />
                          </CInputGroupText>
                        </CInputGroupPrepend>
                      </CPopover>
                      <CInput
                        invalid={emptyPassword}
                        required
                        type="password"
                        placeholder={t('login.password')}
                        autoComplete="current-password"
                        onChange={(event) => setPassword(event.target.value)}
                      />
                      <CInvalidFeedback className="help-block">
                        {t('login.please_enter_password')}
                      </CInvalidFeedback>
                    </CInputGroup>
                    <CInputGroup className="mb-4" hidden={!defaultConfig.ALLOW_GATEWAY_CHANGE}>
                      <CPopover content="Gateway URL">
                        <CInputGroupPrepend>
                          <CInputGroupText>
                            <CIcon name="cilLink" content={cilLink} />
                          </CInputGroupText>
                        </CInputGroupPrepend>
                      </CPopover>
                      <CInput
                        invalid={emptyGateway}
                        type="text"
                        required
                        placeholder={placeholderUrl}
                        value={gatewayUrl}
                        autoComplete="gateway-url"
                        onChange={(event) => setGatewayUrl(event.target.value)}
                      />
                      <CInvalidFeedback className="help-block">
                        {t('login.please_enter_gateway')}
                      </CInvalidFeedback>
                    </CInputGroup>
                    <CRow>
                      <CCol>
                        <CAlert show={hadError} color="danger">
                          {t('login.login_error')}
                        </CAlert>
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol xs="6">
                        <CButton
                          color="primary"
                          className="px-4"
                          onClick={() => (formValidation() ? SignIn({ userId, password }) : null)}
                        >
                          {t('login.login')}
                        </CButton>
                      </CCol>
                      <CCol xs="6">
                        <div className={styles.languageSwitcher}>
                          <LanguageSwitcher />
                        </div>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Login;
