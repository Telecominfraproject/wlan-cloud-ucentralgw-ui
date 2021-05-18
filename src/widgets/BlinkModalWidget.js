import {
    CButton,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CSpinner,
    CCol,
    CRow,
    CForm,
    CFormGroup,
    CInputRadio,
    CLabel
} from '@coreui/react';
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-widgets/DatePicker';
import { useSelector } from 'react-redux';
import { convertDateFromUtc, convertDateToUtc } from '../utils/helper';
import 'react-widgets/styles.css';
import { getToken } from '../utils/authHelper';
import axiosInstance from '../utils/axiosInstance';

const BlinkModalWidget = ({show, toggleModal}) => {
    const [hadSuccess, setHadSuccess] = useState(false);
    const [hadFailure, setHadFailure] = useState(false);
    const [doingNow, setDoingNow] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [chosenDate, setChosenDate] = useState(new Date().toString());
    const [chosenPattern, setPattern] = useState('on');
    const [responseBody, setResponseBody] = useState('');
    const [checkingIfSure, setCheckingIfSure] = useState(false);
    const selectedDeviceId = useSelector((state) => state.selectedDeviceId);
  
    const setDateToLate = () => {
      const date = convertDateToUtc(new Date());
      if (date.getHours() >= 3) {
        date.setDate(date.getDate() + 1);
      }
      date.setHours(3);
      date.setMinutes(0);
  
      setChosenDate(convertDateFromUtc(date).toString());
    };
  
    const setDate = (date) => {
      if (date) {
        setChosenDate(date.toString());
      }
    };
  
    const confirmingIfSure = () => {
      setCheckingIfSure(true);
    };
  
    useEffect(() => {
      setHadSuccess(false);
      setHadFailure(false);
      setWaiting(false);
      setChosenDate(new Date().toString());
      setResponseBody('');
      setPattern('on');
      setCheckingIfSure(false);
    }, [show]);
  
    const doAction = (isNow) => {
      setDoingNow(isNow);
      setHadFailure(false);
      setHadSuccess(false);
      setWaiting(true);
  
      const token = getToken();
      const utcDate = new Date(chosenDate);
      const utcDateString = utcDate.toISOString();
  
      const parameters = {
        serialNumber: selectedDeviceId,
        when: isNow ? 0 : utcDateString,
        pattern: chosenPattern,
        duration: 30
      };
  
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      };
  
      axiosInstance
        .post(`/device/${selectedDeviceId}/leds`, parameters, { headers })
        .then((response) => {
          setResponseBody(JSON.stringify(response.data, null, 4));
          setHadSuccess(true);
        })
        .catch(() => {
          setHadFailure(true);
        })
        .finally(() => {
          setCheckingIfSure(false);
          setWaiting(false);
        });
    };
  
    return (
      <CModal show={show} onClose={toggleModal}>
        <CModalHeader closeButton>
          <CModalTitle>LEDs of Device</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <h6>When would you like make the LEDs of this device blink?</h6>
          <CRow style={{ marginTop: '20px' }}>
            <CCol>
              <CButton 
                onClick={() => doAction(true)} 
                disabled={waiting} 
                block 
                color="primary"
              >
                {waiting && doingNow ? 'Loading...' : 'Do Now!'}
                <CSpinner hidden={!waiting && doingNow} component="span" size="sm" />
              </CButton>
            </CCol>
            <CCol>
              <CButton disabled={waiting} block color="primary" onClick={() => setDateToLate()}>
                Later tonight
              </CButton>
            </CCol>
          </CRow>
          <CRow style={{ marginTop: '20px' }}>
            <CCol md="4" style={{ marginTop: '7px' }}>
              <p>Date:</p>
            </CCol>
            <CCol xs="12" md="8">
              <DatePicker
                selected={new Date(chosenDate)}
                includeTime
                selectTime
                value={new Date(chosenDate)}
                placeholder="Select custom date"
                disabled={waiting}
                onChange={(date) => setDate(date)}
                min={convertDateToUtc(new Date())}
              />
            </CCol>
          </CRow>
          <CRow style={{ marginTop: '20px' }}>
            <CCol md="7">
                Choose a pattern you would like to use:
            </CCol>
            <CCol>
                <CForm>
                    <CFormGroup variant="checkbox" onClick={() => setPattern('on')}>
                        <CInputRadio checked={chosenPattern === 'on'} id="radio1" name="radios" value="option1" />
                        <CLabel variant="checkbox" htmlFor="radio1">On</CLabel>
                    </CFormGroup>
                    <CFormGroup variant="checkbox" onClick={() => setPattern('off')}>
                        <CInputRadio checked={chosenPattern === 'off'} id="radio2" name="radios" value="option2" />
                        <CLabel variant="checkbox" htmlFor="radio2">Off</CLabel>
                    </CFormGroup>
                    <CFormGroup variant="checkbox" onClick={() => setPattern('blink')}>
                        <CInputRadio checked={chosenPattern === 'blink'} id="radio2" name="radios" value="option2" />
                        <CLabel variant="checkbox" htmlFor="radio2">Blink</CLabel>
                    </CFormGroup>
                </CForm>
            </CCol>
          </CRow>
          <div hidden={!hadSuccess && !hadFailure}>
            <div>
              <pre>{responseBody}</pre>
            </div>
          </div>
        </CModalBody>
        <CModalFooter>
          <div hidden={!checkingIfSure}>Are you sure?</div>
          <CButton
            disabled={waiting}
            hidden={checkingIfSure}
            color="primary"
            onClick={() => confirmingIfSure()}
          >
            Schedule
          </CButton>
          <CButton
            hidden={!checkingIfSure}
            disabled={waiting}
            color="primary"
            onClick={() => doAction(false)}
          >
            {waiting && !doingNow ? 'Loading...' : 'Yes'} {'   '}
            <CSpinner hidden={!waiting && doingNow} component="span" size="sm" />
          </CButton>
          <CButton color="secondary" onClick={toggleModal}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>
    );
}

export default BlinkModalWidget;