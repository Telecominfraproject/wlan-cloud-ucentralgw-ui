import React, { useState, useEffect } from 'react';
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
import axiosInstance from '../../utils/axiosInstance';
import logo from '../../assets/OpenWiFi_LogoLockup_DarkGreyColour.svg';

const Login = () => {
  const dispatch = useDispatch();
  const [userId, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [gatewayUrl, setGatewayUrl] = useState('https://ucentral.dpaas.arilia.com:16001/api/v1');
  const [hadError, setHadError] = useState(false);
  const [emptyUsername, setEmptyUsername] = useState(false);
  const [emptyPassword, setEmptyPassword] = useState(false);
  const [emptyGateway, setEmptyGateway] = useState(false);
  const placeholderUrl = 'Gateway URL (ex: https://ucentral.dpaas.arilia.com:16001/api/v1)';
  const loginErrorText =
    'Login error, confirm that your username, password and gateway url are valid';

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
    axiosInstance
      .post(`${gatewayUrl}/oauth2`, credentials)
      .then((response) => {
        sessionStorage.setItem('gw_url', gatewayUrl);
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

  return (
    <div className="c-app c-default-layout flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md="8">
            <img
              className="c-sidebar-brand-full"
              src={logo}
              style={{ paddingLeft: '17%', width: '85%' }}
              alt="OpenWifi"
            />
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onKeyDown={onKeyDown}>
                    <h1>Login</h1>
                    <p className="text-muted">Sign In to your account</p>
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
                        placeholder="Username"
                        autoComplete="username"
                        onChange={(event) => setUsername(event.target.value)}
                      />
                      <CInvalidFeedback className="help-block">
                        Please enter your username
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
                        placeholder="Password"
                        autoComplete="current-password"
                        onChange={(event) => setPassword(event.target.value)}
                      />
                      <CInvalidFeedback className="help-block">
                        Please enter your password
                      </CInvalidFeedback>
                    </CInputGroup>
                    <CInputGroup className="mb-4">
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
                        Please enter a gateway url
                      </CInvalidFeedback>
                    </CInputGroup>
                    <CRow>
                      <CCol>
                        <CAlert show={hadError} color="danger">
                          {loginErrorText}
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
                          Login
                        </CButton>
                      </CCol>
                      <CCol xs="6" className="text-right"/>
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
