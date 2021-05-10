import React, { useState } from 'react'
import {
	CButton,
	CCard,
	CCardHeader,
	CCardBody,
	CRow,
	CCol
} from '@coreui/react'
import ActionModalWidget from '../widgets/ActionModalWidget';

const DeviceActions = () => {
	const [showRebootModal, setShowRebootModal] = useState(false);
	const [showBlinkModal, setShowBlinkModal] = useState(false);
	const [firmwareUri, setFirmwareUri] = useState('');
	const [validField, setValidField] = useState(true);
	
	const toggleRebootModal = (e) => {
		setShowRebootModal(!showRebootModal);
	}

	const toggleBlinkModal = (e) => {
		setShowBlinkModal(!showBlinkModal);
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

	return (
		<CCard>
			<CCardHeader>
					Device Actions
			</CCardHeader>
			<CCardBody>
				<CRow>
					<CCol>
						<CButton block onClick = { toggleRebootModal } color="primary">Reboot</CButton>
					</CCol>
					<CCol>
						<CButton block onClick = { toggleBlinkModal } color="primary">Blink</CButton>
					</CCol>
				</CRow>
				<CRow style={{marginTop :'10px'}}>
					<CCol>
						<CButton block color="primary">Firmware Upgrade</CButton>
					</CCol>
					<CCol>
					</CCol>
				</CRow>
			</CCardBody>
			<ActionModalWidget
				show={showRebootModal}
				toggleModal={toggleRebootModal}
				title='Reboot Device'
				directions='When would you like to reboot this device?'
				actionLabel='reboot'
				action='reboot'
			/>
			<ActionModalWidget
				show={showBlinkModal}
				toggleModal={toggleBlinkModal}
				title='Blink LEDs of Device'
				directions='When would you like make the LEDs of this device blink?'
				actionLabel='blink'
				action='leds'
				extraParameters= {{ duration : 10, pattern : 'on' }}
			/>
			
			{/*<CModal 
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
			</CModal>*/}
		</CCard>
	);
}

export default DeviceActions