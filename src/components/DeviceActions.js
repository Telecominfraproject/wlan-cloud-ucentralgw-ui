import React, { useState } from 'react'
import {
	CButton,
	CCard,
	CCardHeader,
	CCardBody,
	CRow,
	CCol,
	CModal,
	CModalHeader,
	CModalTitle,
	CModalBody,
	CModalFooter,
	CForm,
	CInput,
	CInvalidFeedback,
	CSpinner,
	CBadge
} from '@coreui/react'
import { useSelector } from 'react-redux';
import axiosInstance from '../utils/axiosInstance';
import { getToken } from '../utils/authHelper';

const DeviceActions = () => {
	const [showModal, setShowModal] = useState(false);
	const [firmwareUri, setFirmwareUri] = useState('');
	const [validField, setValidField] = useState(true);
	const [rebootIsLoading, setRebootLoading] = useState(false);
	const [hadRebootSuccess, setRebootSuccess] = useState(false);
	const [hadRebootFailure, setRebootFailure] = useState(false);
	const [blinkIsLoading, setBlinkLoading] = useState(false);
	const [hadBlinkSuccess, setBlinkSuccess] = useState(false);
	const [hadBlinkFailure, setBlinkFailure] = useState(false);

	let selectedDevice = useSelector(state => state.selectedDevice);
	
	const toggleModal = (e) => {
		setShowModal(!showModal);
	}

	const formChange = (fieldValue) => {
		if(!validField){
			setValidField(true);
		}
		setFirmwareUri(fieldValue);
	}

	const formValidation = () => {
		if (firmwareUri.trim() === ''){
			setValidField(false);
			return false;
		}
		return true;
	};

	const reboot = () => {
		setRebootSuccess(false);
		setRebootFailure(false);
		setRebootLoading(true);
		const token = getToken();

		const headers = {
			'Accept': 'application/json',
			'Authorization': `Bearer ${token}`,
			'serialNumber': selectedDevice.serialNumber
		};

		axiosInstance.post(`/device/${selectedDevice.serialNumber}/reboot`, {
			serialNumber : selectedDevice.serialNumber
		},{ headers: headers})
		.then((response) => {
			setRebootSuccess(true);
		})
		.catch(error => {
			setRebootFailure(true);
			console.log(error);
			console.log(error.response);
		})
		.finally (() => {
			setRebootLoading(false);
		});
	}

	const blink = () => {
		setBlinkSuccess(false);
		setBlinkFailure(false);
		setBlinkLoading(true);
		const token = getToken();

		const headers = {
			'Accept': 'application/json',
			'Authorization': `Bearer ${token}`,
			'serialNumber': selectedDevice.serialNumber
		};

		axiosInstance.post(`/device/${selectedDevice.serialNumber}/leds`, {
			serialNumber : selectedDevice.serialNumber
		},{ headers: headers})
		.then((response) => {
			setBlinkSuccess(true);
		})
		.catch(error => {
			setBlinkFailure(true);
			console.log(error);
			console.log(error.response);
		})
		.finally (() => {
			setBlinkLoading(false);
		});
	}

	return (
		<CCard>
			<CCardHeader>
					Device Actions
			</CCardHeader>
			<CCardBody>
				<CRow>
					<CCol>
						<CButton block disabled={ rebootIsLoading } color="primary" onClick={ reboot }>
							{ rebootIsLoading ? 'Loading...' : 'Reboot'} {'   '}
							<CSpinner hidden={ !rebootIsLoading } component="span" size="sm"/>
							<CBadge hidden = { (rebootIsLoading || !hadRebootSuccess) } color="success" shape="rounded-pill">
								Success
							</CBadge>
							<CBadge hidden = { (rebootIsLoading || !hadRebootFailure) }color="danger" shape="rounded-pill">
								Request Failed
							</CBadge>
						</CButton>
					</CCol>
					<CCol>
						<CButton block disabled={ blinkIsLoading } color="primary" onClick={ blink }>
							{ blinkIsLoading ? 'Loading...' : 'Blink'} {'   '}
							<CSpinner hidden={ !blinkIsLoading } component="span" size="sm"/>
							<CBadge hidden = { (blinkIsLoading || !hadBlinkSuccess) } color="success" shape="rounded-pill">
								Success
							</CBadge>
							<CBadge hidden = { (blinkIsLoading || !hadBlinkFailure) }color="danger" shape="rounded-pill">
								Request Failed
							</CBadge>
						</CButton>
					</CCol>
				</CRow>
				<CRow style={{marginTop :'10px'}}>
					<CCol>
						<CButton block onClick = { toggleModal } color="primary">Firmware Upgrade</CButton>
					</CCol>
				</CRow>
			</CCardBody>
			<CModal 
				show={showModal} 
				onClose={toggleModal}
			>
				<CModalHeader closeButton>
					<CModalTitle>Firmware Upgrade</CModalTitle>
				</CModalHeader>
				<CModalBody>
					<p>Insert the link of the firmware version you would like to upgrade the device to.</p>
					<CForm action="" method="post" encType="multipart/form-data" className="form-horizontal">
						<CInput 
							className={'form-control', {'is-invalid' : !validField}} 
							type="text" 
							id="uri" 
							name="uri-input" 
							placeholder="https://somelocation.com/file=newversion.bin" 
							autoComplete="firmware-uri" 
							onChange={event => formChange(event.target.value)}
						/>
						<CInvalidFeedback>You need a url...</CInvalidFeedback>
					</CForm>
				</CModalBody>
				<CModalFooter>
					<CButton color="primary" onClick={event => formValidation()}>Upgrade</CButton>
					<CButton 
						color="secondary" 
						onClick={toggleModal}
					>
						Cancel
					</CButton>
				</CModalFooter>
			</CModal>
		</CCard>
	);
}

export default DeviceActions