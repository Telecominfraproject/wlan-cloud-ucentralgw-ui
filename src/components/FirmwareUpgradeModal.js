import {
	CButton,
	CModal,
	CModalHeader,
	CModalTitle,
	CModalBody,
	CModalFooter,
	CSpinner,
    CBadge,
    CCol,
    CRow,
    CInput,
    CInvalidFeedback
} from '@coreui/react';
import React, { useState, useEffect } from 'react';
import { convertDateToUtc, convertDateFromUtc } from '../utils/helper'
import DatePicker from "react-widgets/DatePicker";
import { useSelector } from 'react-redux';
import "react-widgets/styles.css";
import { getToken } from '../utils/authHelper';
import axiosInstance from '../utils/axiosInstance';

const FirmwareUpgradeModal = ({ show, toggleModal }) => {
	const [hadSuccess, setHadSuccess] = useState(false);
	const [hadFailure, setHadFailure] = useState(false);
    const [waiting, setWaiting] = useState(false);
	const [chosenDate, setChosenDate] = useState(null);
    const [firmware, setFirmware] = useState('');
    const [validFirmware, setValidFirmware] = useState(true);
    const [responseBody, setResponseBody] = useState('');
    const [checkingIfSure, setCheckingIfSure] = useState(false);
    const selectedDeviceId = useSelector(state => state.selectedDeviceId);
    
    const formValidation = () => {
        if (firmware.trim() === ''){
            setValidFirmware(false);
            return false;
        }
        return (chosenDate !== null);
    }

    const setDateToNow = () => {
        const now = (new Date()).toISOString();
        setChosenDate(now);
    }

    const setDateToLate = () => {
        const date = convertDateToUtc(new Date());
        if (date.getHours() >= 3){
            date.setDate(date.getDate() + 1);
        }
        date.setHours(3);
        date.setMinutes(0);

        setChosenDate(convertDateFromUtc(date).toISOString());
    }

    const setDate = (date) => {
        if(date){
            setChosenDate(date.toISOString());
        }
    }

    const confirmingIfSure = () => {
        setCheckingIfSure(true);
    }
    useEffect(() => {
        setHadSuccess(false);
        setHadFailure(false);
        setWaiting(false);
        setChosenDate(null);
        setFirmware('');
        setValidFirmware(true);
        setResponseBody('');
        setCheckingIfSure(false);
    },[show]);

    useEffect(() => {
        setValidFirmware(true);
    },[firmware]);

    const postUpgrade = () => {
        setHadFailure(false);
        setHadSuccess(false);
        setWaiting(true);

        const token = getToken();

		const headers = {
			'Accept': 'application/json',
			'Authorization': `Bearer ${token}`,
			'serialNumber': selectedDeviceId
		};

        const parameters = {
            serialNumber: selectedDeviceId,
            when: chosenDate,
            uri: firmware
        }
		axiosInstance.post(`/device/${selectedDeviceId}/upgrade`, parameters,{ headers: headers})
		.then((response) => {
            setResponseBody(JSON.stringify(response.data, null, 4));
			setHadSuccess(true);
		})
		.catch(error => {
			setHadFailure(true);
			console.log(error);
			console.log(error.response);
		})
		.finally (() => {
            setCheckingIfSure(false);
			setWaiting(false);
		});
    }

    return (
        <CModal 
            show={show} 
            onClose={toggleModal}
        >
            <CModalHeader closeButton>
                <CModalTitle>Firmware Upgrade</CModalTitle>
            </CModalHeader>
            <CModalBody>
                <h6>Choose a time and a firmware version for this device</h6>
                <CRow style={{marginTop: '20px'}}>
                    <CCol>
                        <CButton block color="primary" onClick={ () => setDateToNow() } >Now</CButton>
                    </CCol>
                    <CCol>
                        <CButton block color="primary" onClick={ () => setDateToLate() }>Later tonight</CButton> 
                    </CCol>
                </CRow>
                <CRow style={{marginTop: '20px'}}>
                    <CCol md="4" style={{marginTop: '7px'}}>
                        <p>Local time:</p>
                    </CCol>
                    <CCol xs="12" md="8">
                        <DatePicker
                            selected = { Date.parse(chosenDate) }
                            includeTime 
                            selectTime
                            placeholder = 'Select custom date in UTC'
                            disabled = {waiting}
                            onChange = {date => setDate(date)}  
                            min = { new Date() }
                        />
                    </CCol>
                </CRow>

                <div style={{marginTop : '25px'}}>
                    <p>Device will upgrade at (UTC): <b>{ chosenDate }</b></p>
                </div>
                <CInput 
                    disabled = { waiting }
                    className = {'form-control', {'is-invalid' : !validFirmware}} 
                    type = "text" 
                    id="uri" 
                    name="uri-input" 
                    placeholder="https://somelocation.com/file=newversion.bin" 
                    autoComplete="firmware-uri" 
                    onChange={event => setFirmware(event.target.value)}
                    value={firmware}
                />
			    <CInvalidFeedback>You need a url...</CInvalidFeedback>
                <div hidden={(!hadSuccess && !hadFailure)}>
                    <div><pre>{responseBody}</pre></div>
                </div>
            </CModalBody>
            <CModalFooter>
                <div hidden= { !checkingIfSure }>
                    Are you sure?
                </div>
                <CButton
                    hidden = { checkingIfSure } 
                    color="primary" 
                    onClick={event => formValidation() ? confirmingIfSure() : null}
                >
                    Schedule Upgrade
                </CButton>
                <CButton
                    hidden = { !checkingIfSure } 
                    disabled={ waiting }
                    color="primary" 
                    onClick={event => formValidation() ? postUpgrade() : null}
                >
                    { waiting ? 'Loading...' : 'Yes'} {'   '}
                    <CSpinner hidden={ !waiting } component="span" size="sm"/>
                    <CBadge hidden = { (waiting || !hadSuccess) } color="success" shape="rounded-pill">
                        Success
                    </CBadge>
                    <CBadge hidden = { (waiting || !hadFailure) }color="danger" shape="rounded-pill">
                        Request Failed
                    </CBadge>
                </CButton>
                <CButton 
                    color="secondary" 
                    onClick={ toggleModal }
                >
                    Cancel
                </CButton>
            </CModalFooter>
            
		</CModal>
    );
    
}

export default FirmwareUpgradeModal;