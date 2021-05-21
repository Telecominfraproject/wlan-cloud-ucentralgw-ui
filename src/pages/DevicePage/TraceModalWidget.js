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
  CSelect,
} from '@coreui/react';
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-widgets/DatePicker';
import { useSelector } from 'react-redux';
import { convertDateToUtc } from '../../utils/helper';
import 'react-widgets/styles.css';
import { getToken } from '../../utils/authHelper';
import axiosInstance from '../../utils/axiosInstance';

const TraceModalWidget = ({ show, toggleModal }) => {
  const [hadSuccess, setHadSuccess] = useState(false);
  const [hadFailure, setHadFailure] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [usingDuration, setUsingDuration] = useState(true);
  const [duration, setDuration] = useState(20);
  const [packets, setPackets] = useState(100);
  const [chosenDate, setChosenDate] = useState(new Date().toString());
  const [responseBody, setResponseBody] = useState('');
  const [checkingIfSure, setCheckingIfSure] = useState(false);
  const selectedDeviceId = useSelector((state) => state.selectedDeviceId);

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
    setCheckingIfSure(false);
    setDuration(20);
    setPackets(100);
  }, [show]);

  const doAction = () => {
    setHadFailure(false);
    setHadSuccess(false);
    setWaiting(true);

    const token = getToken();
    const dateChosen = new Date(chosenDate);
    const now = new Date();
    let utcDateString = dateChosen.toISOString();

    if (dateChosen <= now) {
      const newDate = new Date();
      newDate.setSeconds(newDate.getSeconds() + 60);
      utcDateString = newDate.toISOString();
    }

    const parameters = {
      serialNumber: selectedDeviceId,
      when: dateChosen <= now ? '' : utcDateString,
      network: 'lan',
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
      .then(() => {
        setResponseBody('Command submitted successfully');
        setHadSuccess(true);
      })
      .catch(() => {
        setResponseBody('Error while submitting command');
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
            {usingDuration ? 'Duration: ' : 'Packets: '}
          </CCol>
          <CCol xs="12" md="8">
            {usingDuration ? (
              <CSelect defaultValue="duration" disabled={waiting}>
                <option value="20" onClick={() => setDuration(20)}>
                  20s
                </option>
                <option value="40" onClick={() => setDuration(40)}>
                  40s
                </option>
                <option value="60" onClick={() => setDuration(60)}>
                  60s
                </option>
                <option value="120" onClick={() => setDuration(120)}>
                  120s
                </option>
              </CSelect>
            ) : (
              <CSelect defaultValue={packets} disabled={waiting}>
                <option value="100" onClick={() => setPackets(100)}>
                  100
                </option>
                <option value="250" onClick={() => setPackets(250)}>
                  250
                </option>
                <option value="500" onClick={() => setPackets(500)}>
                  500
                </option>
                <option value="1000" onClick={() => setPackets(1000)}>
                  1000
                </option>
              </CSelect>
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
            <pre className="ignore">{responseBody} </pre>
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
          <CBadge hidden={waiting || !hadSuccess} color="success" shape="pill">
            Success
          </CBadge>
          <CBadge hidden={waiting || !hadFailure} color="danger" shape="pill">
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
