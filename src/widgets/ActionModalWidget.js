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
} from '@coreui/react';
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-widgets/DatePicker';
import { useSelector } from 'react-redux';
import { convertDateToUtc, convertDateFromUtc } from '../utils/helper';
import 'react-widgets/styles.css';
import { getToken } from '../utils/authHelper';
import axiosInstance from '../utils/axiosInstance';

const ActionModalWidget = ({
  show,
  toggleModal,
  title,
  directions,
  actionLabel,
  action,
  extraParameters,
}) => {
  const [hadSuccess, setHadSuccess] = useState(false);
  const [hadFailure, setHadFailure] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [chosenDate, setChosenDate] = useState(null);
  const [responseBody, setResponseBody] = useState('');
  const selectedDeviceId = useSelector((state) => state.selectedDeviceId);

  const formValidation = () => chosenDate !== null;

  const setDateToNow = () => {
    const now = new Date().toISOString();
    setChosenDate(now);
  };

  const setDateToLate = () => {
    const date = convertDateToUtc(new Date());
    if (date.getHours() >= 3) {
      date.setDate(date.getDate() + 1);
    }
    date.setHours(3);
    date.setMinutes(0);

    setChosenDate(convertDateFromUtc(date).toISOString());
  };

  const setDate = (date) => {
    if (date) {
      setChosenDate(convertDateFromUtc(date).toISOString());
    }
  };

  useEffect(() => {
    setHadSuccess(false);
    setHadFailure(false);
    setWaiting(false);
    setChosenDate(false);
    setResponseBody('');
  }, [show]);

  const doAction = () => {
    setHadFailure(false);
    setHadSuccess(false);
    setWaiting(true);

    const token = getToken();

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      serialNumber: selectedDeviceId,
    };

    const necessaryParameters = {
      serialNumber: selectedDeviceId,
      when: chosenDate,
    };

    const parameters = { ...necessaryParameters, ...extraParameters };

    axiosInstance
      .post(`/device/${selectedDeviceId}/${action}`, parameters, { headers })
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
        setWaiting(false);
      });
  };

  return (
    <CModal show={show} onClose={toggleModal}>
      <CModalHeader closeButton>
        <CModalTitle>{title}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <h6>{directions}</h6>
        <CRow style={{ marginTop: '20px' }}>
          <CCol>
            <CButton block color="primary" onClick={() => setDateToNow()}>
              Now
            </CButton>
          </CCol>
          <CCol>
            <CButton block color="primary" onClick={() => setDateToLate()}>
              Later tonight
            </CButton>
          </CCol>
        </CRow>
        <CRow style={{ marginTop: '20px' }}>
          <CCol md="4" style={{ marginTop: '7px' }}>
            <p>Custom (UTC):</p>
          </CCol>
          <CCol xs="12" md="8">
            <DatePicker
              selected={Date.parse(chosenDate)}
              includeTime
              selectTime
              placeholder="Select custom date in UTC"
              disabled={waiting}
              onChange={(date) => setDate(date)}
              min={convertDateToUtc(new Date())}
            />
          </CCol>
        </CRow>

        <div style={{ marginTop: '25px' }}>
          <p>
            Device will {actionLabel} at (UTC): <b>{chosenDate}</b>
          </p>
        </div>

        <div hidden={!hadSuccess && !hadFailure}>
          <div>
            <pre>{responseBody}</pre>
          </div>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton
          disabled={waiting}
          color="primary"
          onClick={() => (formValidation() ? doAction() : null)}
        >
          {waiting ? 'Loading...' : 'Schedule'} {'   '}
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

export default ActionModalWidget;
