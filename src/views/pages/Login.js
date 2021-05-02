import React, { useState } from 'react'
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
  CRow
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilLockLocked} from '@coreui/icons';
import { useDispatch } from 'react-redux';
import axiosInstance from '../../utils/axiosInstance';


const Login = () => {
  const dispatch = useDispatch();
  const [userId, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const onKeyDown = (event) => {
    if(event.code === 'Enter' && formValidation()){
      SignIn({ userId, password });
    }
  };

  const SignIn = (credentials) => {
    axiosInstance.post('/oauth2', credentials)
    .then((response) => {
        sessionStorage.setItem('access_token', response.data.access_token);
        dispatch({type: 'set', connected: true});
    })
    .catch(error => {
        console.log(error.response);
    });
  };
  
  const formValidation = () => {
      if (userId.trim() === '' || password.trim() === ''){
          return false;
      }
      return true;
  };

  return (
    <div className="c-app c-default-layout flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md="8">
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onKeyDown = { onKeyDown }>
                    <h1>Login</h1>
                    <p className="text-muted">Sign In to your account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupPrepend>
                        <CInputGroupText>
                          <CIcon name="cilUser" content={cilUser}/>
                        </CInputGroupText>
                      </CInputGroupPrepend>
                      <CInput autoFocus type="text" placeholder="Username" autoComplete="username" onChange={event => setUsername(event.target.value)}/>
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupPrepend>
                        <CInputGroupText>
                          <CIcon name="cilLockLocked" content={cilLockLocked}/>
                        </CInputGroupText>
                      </CInputGroupPrepend>
                      <CInput type="password" placeholder="Password" autoComplete="current-password" onChange={event => setPassword(event.target.value)} />
                    </CInputGroup>
                    <CRow>
                      <CCol xs="6">
                        <CButton color="primary" className="px-4" onClick={event => formValidation() ? SignIn({ userId, password }) : alert('bad')}>Login
                      </CButton>
                      </CCol>
                      <CCol xs="6" className="text-right">
                        <CButton color="link" className="px-0">Forgot password?</CButton>
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
  )
}
  
  export default Login
  