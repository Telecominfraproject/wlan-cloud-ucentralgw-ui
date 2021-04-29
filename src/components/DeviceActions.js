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
    CInvalidFeedback
  } from '@coreui/react'
import { useSelector } from 'react-redux';

const DeviceActions = () => {
    const [showModal, setShowModal] = useState(false);
    const [firmwareUri, setFirmwareUri] = useState('');
    const [validField, setValidField] = useState(true);

    let selectedDevice = useSelector(state => state.selectedDevice);
    
    const toggleModal = (e) => {
        setShowModal(!showModal);
        //e.preventDefault();
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
                        <CButton block color="primary">Reboot</CButton>
                    </CCol>
                    <CCol>
                        <CButton block color="primary">Blink</CButton>
                    </CCol>
                </CRow>
                <CRow style={{marginTop :'10px'}}>
                    <CCol>
                        <CButton onClick = { toggleModal } block color="primary">Firmware Upgrade</CButton>
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
                  <CInput className={'form-control', {'is-invalid' : !validField}} type="text" id="uri" name="uri-input" placeholder="https://somelocation.com/file=newversion.bin" autoComplete="firmware-uri" onChange={event => formChange(event.target.value)}/>
                  <CInvalidFeedback>You need a url...</CInvalidFeedback>
                </CForm>
              </CModalBody>
              <CModalFooter>
                <CButton color="primary" onClick={event => formValidation()}>Upgrade</CButton>
                <CButton 
                  color="secondary" 
                  onClick={toggleModal}
                >Cancel</CButton>
              </CModalFooter>
            </CModal>
        </CCard>
    );
}

export default DeviceActions