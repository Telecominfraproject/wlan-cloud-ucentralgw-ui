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
  CInvalidFeedback,
} from '@coreui/react';
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-widgets/DatePicker';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { convertDateToUtc, convertDateFromUtc } from '../../utils/helper';
import 'react-widgets/styles.css';
import { getToken } from '../../utils/authHelper';
import axiosInstance from '../../utils/axiosInstance';

const ActionModal = ({ show, toggleModal, title, directions, action }) => {
  const [hadSuccess, setHadSuccess] = useState(false);
  const [hadFailure, setHadFailure] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [validDate, setValidDate] = useState(true);
  const [chosenDate, setChosenDate] = useState(new Date().toString());
  const [doingNow, setDoingNow] = useState(false);
  const [responseBody, setResponseBody] = useState('');
  const [checkingIfSure, setCheckingIfSure] = useState(false);
  const selectedDeviceId = useSelector((state) => state.selectedDeviceId);

  const formValidation = () => {
    if (chosenDate === '') {
      setValidDate(false);
      return false;
    }
    return true;
  };

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
    setDoingNow(false);
    setChosenDate(new Date().toString());
    setResponseBody('');
    setValidDate(true);
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
      when: isNow ? '' : utcDateString,
    };

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };

    axiosInstance
      .post(`/device/${selectedDeviceId}/${action}`, parameters, { headers })
      .then(() => {
        setResponseBody('Command submitted successfully');
        setHadSuccess(true);
      })
      .catch(() => {
        setResponseBody('Error while submitting command');
        setHadFailure(true);
      })
      .finally(() => {
        setDoingNow(false);
        setCheckingIfSure(false);
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
            <CButton onClick={() => doAction(true)} disabled={waiting} block color="primary">
              {waiting && doingNow ? 'Loading...' : 'Do Now!'}
              <CSpinner hidden={!waiting || !doingNow} component="span" size="sm" />
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
              className={('form-control', { 'is-invalid': !validDate })}
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
            <pre className="ignore">{responseBody}</pre>
          </div>
        </div>
      </CModalBody>
      <CModalFooter>
        <div hidden={!checkingIfSure}>Are you sure?</div>
        <CButton
          hidden={checkingIfSure}
          disabled={waiting}
          color="primary"
          onClick={() => (formValidation() ? confirmingIfSure() : null)}
        >
          Schedule
        </CButton>
        <CButton
          hidden={!checkingIfSure}
          disabled={waiting}
          color="primary"
          onClick={() => (formValidation() ? doAction(false) : null)}
        >
          {waiting && !doingNow ? 'Loading...' : 'Yes'} {'   '}
          <CSpinner hidden={!waiting || doingNow} component="span" size="sm" />
        </CButton>
        <CButton color="secondary" onClick={toggleModal}>
          Cancel
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

ActionModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  directions: PropTypes.string.isRequired,
  action: PropTypes.string.isRequired,
};

export default ActionModal;
