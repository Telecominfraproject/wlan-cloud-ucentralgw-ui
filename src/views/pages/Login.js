import React, { useState, useEffect } from 'react'
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
  CInvalidFeedback
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilLockLocked, cilLink} from '@coreui/icons';
import { useDispatch } from 'react-redux';
import axiosInstance from '../../utils/axiosInstance';


const Login = () => {
	const dispatch = useDispatch();
	const [userId, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [gatewayUrl, setGatewayUrl] = useState('https://ucentral.dpaas.arilia.com:16001/api/v1');
	const [error, setError] = useState(false);
	const [emptyUsername, setEmptyUsername] = useState(false);
	const [emptyPassword, setEmptyPassword] = useState(false);
	const [emptyGateway, setEmptyGateway] = useState(false);
  
	const onKeyDown = (event) => {
	if(event.code === 'Enter' && formValidation()){
		SignIn({ userId, password });
	}
	};

	const SignIn = (credentials) => {
		axiosInstance.post(`${gatewayUrl}/oauth2`, credentials)
		.then((response) => {
			sessionStorage.setItem('gw_url', gatewayUrl);
			sessionStorage.setItem('access_token', response.data.access_token);
			dispatch({type: 'set', connected: true});
		})
		.catch(error => {
			console.log(error);
			setError(true);
			console.log(error.response);
		});
	};
  
	const formValidation = () => {
		setError(false);

		let isSuccesful = true;

		if(userId.trim() === ''){
			setEmptyUsername(true);
			isSuccesful = false;
		}

		if(password.trim() === ''){
			setEmptyPassword(true);
			isSuccesful = false;
		}

		if(gatewayUrl.trim() === ''){
			setEmptyGateway(true);
			isSuccesful = false;
		}
		
		return isSuccesful;
	};

	useEffect(() => { if (emptyUsername) setEmptyUsername(false); }, [userId]);
	useEffect(() => { if (emptyPassword) setEmptyPassword(false); }, [password]);
	useEffect(() => { if (emptyGateway) setEmptyGateway(false); }, [gatewayUrl]);

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
										<CPopover content="Username">
											<CInputGroupPrepend>
											<CInputGroupText>
												<CIcon name="cilUser" content={cilUser }/>
											</CInputGroupText>
											</CInputGroupPrepend>
										</CPopover>
										<CInput invalid = { emptyUsername } autoFocus required type="text" placeholder="Username" autoComplete="username" onChange={event => setUsername(event.target.value)}/>
										<CInvalidFeedback className="help-block">
											Please enter your username
										</CInvalidFeedback>
									</CInputGroup>
									<CInputGroup className="mb-4">
										<CPopover content="Password">
											<CInputGroupPrepend>
											<CInputGroupText>
												<CIcon name="cilLockLocked" content={ cilLockLocked }/>
											</CInputGroupText>
											</CInputGroupPrepend>
										</CPopover>
										<CInput invalid = { emptyPassword } type="password" required placeholder="Password" autoComplete="current-password" onChange={event => setPassword(event.target.value)} />
										<CInvalidFeedback className="help-block">
											Please enter your password
										</CInvalidFeedback>
									</CInputGroup>
									<CInputGroup className="mb-4">
										<CPopover content="Gateway URL">
										<CInputGroupPrepend>
											<CInputGroupText>
											<CIcon name="cilLink" content={ cilLink }/>
											</CInputGroupText>
										</CInputGroupPrepend>
										</CPopover>
										<CInput invalid = { emptyGateway } type="text" required placeholder="Gateway URL (ex: https://ucentral.dpaas.arilia.com:16001/api/v1)" value={gatewayUrl} autoComplete="gateway-url" onChange={event => setGatewayUrl(event.target.value)} />
										<CInvalidFeedback className="help-block">
											Please enter a gateway url
										</CInvalidFeedback>
									</CInputGroup>
									<CRow>
										<CCol>
										<CAlert show = { error } color="danger">
											Login error, confirm that your username, password and gateway url are valid
										</CAlert>
										</CCol>
									</CRow>
									<CRow>
									<CCol xs="6">
										<CButton color="primary" className="px-4" onClick={event => formValidation() ? SignIn({ userId, password }) : null }>Login
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
  