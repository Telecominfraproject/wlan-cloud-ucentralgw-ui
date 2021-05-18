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
  CInvalidFeedback,
} from '@coreui/react';
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-widgets/DatePicker';
import { useSelector } from 'react-redux';
import NumberFormat from 'react-number-format';
import { convertDateToUtc } from '../utils/helper';
import 'react-widgets/styles.css';
import { getToken } from '../utils/authHelper';
import axiosInstance from '../utils/axiosInstance';

const TraceModalWidget = ({ show, toggleModal }) => {
  const [hadSuccess, setHadSuccess] = useState(false);
  const [hadFailure, setHadFailure] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [usingDuration, setUsingDuration] = useState(true);
  const [duration, setDuration] = useState(1);
  const [packets, setPackets] = useState(1);
  const [chosenDate, setChosenDate] = useState(new Date().toString());
  const [responseBody, setResponseBody] = useState('');
  const [checkingIfSure, setCheckingIfSure] = useState(false);
  const selectedDeviceId = useSelector((state) => state.selectedDeviceId);

  const numberRegex = /^[0-9\b]+$/;

  const setDate = (date) => {
    if (date) {
      setChosenDate(date.toString());
    }
  };

  const confirmingIfSure = () => {
    setCheckingIfSure(true);
  };

  const isGoodPackets = (inputObj) => {
    const { value } = inputObj;
    if (value <= 1000 && numberRegex.test(value)) return inputObj;
    return null;
  };
  const isGoodDuration = (inputObj) => {
    const { value } = inputObj;
    if (value <= 60 && numberRegex.test(value)) return inputObj;
    return null;
  };

  useEffect(() => {
    setHadSuccess(false);
    setHadFailure(false);
    setWaiting(false);
    setChosenDate(new Date().toString());
    setResponseBody('');
    setCheckingIfSure(false);
    setDuration(1);
    setPackets(1);
  }, [show]);

  useEffect(() => {
    console.log(`packets: ${packets} duration: ${duration}`);
  }, [duration, packets]);

  const doAction = () => {
    setHadFailure(false);
    setHadSuccess(false);
    setWaiting(true);

    const token = getToken();
    const dateChosen = new Date(chosenDate);
    const now = new Date();
    let utcDateString = dateChosen.toISOString();

    if(dateChosen <= now){
      const newDate = new Date();
      newDate.setSeconds(newDate.getSeconds() + 60);
      utcDateString = newDate.toISOString();
    }

    const parameters = {
      serialNumber: selectedDeviceId,
      when: utcDateString,
      network: 'lan'
    };

    if (usingDuration) {
      parameters.duration = parseInt(duration, 10);
    } else {
      parameters.numberOfPackets = parseInt(packets, 10);
    }

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };

    axiosInstance
      .post(`/device/${selectedDeviceId}/trace`, parameters, { headers })
      .then((response) => {
        setResponseBody(JSON.stringify(response.data, null, 4));
        setHadSuccess(true);
      })
      .catch((error) => {
        setHadFailure(true);
        console.log(error);
        console.log(error.response);
      })
      .finally(() => {
        setCheckingIfSure(false);
        setWaiting(false);
      });
  };

  return (
    <CModal show={show} onClose={toggleModal}>
      <CModalHeader closeButton>
        <CModalTitle>Trace Device</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <h6>
          Launch a remote trace of this device for either a specific duration or a number of packets
        </h6>
        <CRow style={{ marginTop: '20px' }}>
          <CCol>
            <CButton
              disabled={waiting}
              block
              color="primary"
              onClick={() => setUsingDuration(true)}
            >
              Duration
            </CButton>
          </CCol>
          <CCol>
            <CButton
              disabled={waiting}
              block
              color="primary"
              onClick={() => setUsingDuration(false)}
            >
              Packets
            </CButton>
          </CCol>
        </CRow>
        <CRow style={{ marginTop: '20px' }}>
          <CCol md="4" style={{ marginTop: '7px' }}>
            {usingDuration ? 'Duration (s): ' : 'Packets: '}
          </CCol>
          <CCol xs="12" md="8">
            {usingDuration ? (
              <NumberFormat
                value={duration}
                onValueChange={(values) => setDuration(values.value)}
                isAllowed={isGoodDuration}
                suffix="s"
              />
            ) : (
              <NumberFormat
                value={packets}
                onValueChange={(values) => setPackets(values.value)}
                isAllowed={isGoodPackets}
                suffix=" packets"
              />
            )}
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
        <CInvalidFeedback>You need a date...</CInvalidFeedback>

        <div hidden={!hadSuccess && !hadFailure}>
          <div>
            <pre>{responseBody} </pre>
          </div>
        </div>
      </CModalBody>
      <CModalFooter>
        <div hidden={!checkingIfSure}>Are you sure?</div>
        <CButton hidden={checkingIfSure} color="primary" onClick={() => confirmingIfSure()}>
          Schedule
        </CButton>
        <CButton
          hidden={!checkingIfSure}
          disabled={waiting}
          color="primary"
          onClick={() => doAction()}
        >
          {waiting ? 'Loading...' : 'Yes'} {'   '}
          <CSpinner hidden={!waiting} component="span" size="sm" />
          <CBadge hidden={waiting || !hadSuccess} color="success" shape="rounded-pill">
            Success
          </CBadge>
          <CBadge hidden={waiting || !hadFailure} color="danger" shape="rounded-pill">
            Request Failed
          </CBadge>
        </CButton>
        <CButton color="secondary" onClick={toggleModal}>
          Cancel
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default TraceModalWidget;
