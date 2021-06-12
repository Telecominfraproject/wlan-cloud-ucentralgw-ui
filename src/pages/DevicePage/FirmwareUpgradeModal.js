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
  CInput,
  CInvalidFeedback,
} from '@coreui/react';
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-widgets/DatePicker';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { convertDateToUtc, convertDateFromUtc, dateToUnix } from 'utils/helper';
import 'react-widgets/styles.css';
import { getToken } from 'utils/authHelper';
import axiosInstance from 'utils/axiosInstance';
import eventBus from 'utils/EventBus';

const FirmwareUpgradeModal = ({ show, toggleModal }) => {
  const [hadSuccess, setHadSuccess] = useState(false);
  const [hadFailure, setHadFailure] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [chosenDate, setChosenDate] = useState(new Date().toString());
  const [firmware, setFirmware] = useState('');
  const [doingNow, setDoingNow] = useState(false);
  const [validFirmware, setValidFirmware] = useState(true);
  const [validDate, setValidDate] = useState(true);
  const [responseBody, setResponseBody] = useState('');
  const [checkingIfSure, setCheckingIfSure] = useState(false);
  const [checkingIfNow, setCheckingIfNow] = useState(false);
  const selectedDeviceId = useSelector((state) => state.selectedDeviceId);

  const formValidation = () => {
    let valid = true;
    if (firmware.trim() === '') {
      setValidFirmware(false);
      valid = false;
    }

    if (chosenDate.trim() === '') {
      setValidDate(false);
      valid = false;
    }
    return valid;
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

  const confirmingIfNow = () => {
    setCheckingIfNow(true);
  };

  useEffect(() => {
    setHadSuccess(false);
    setHadFailure(false);
    setWaiting(false);
    setChosenDate(new Date().toString());
    setFirmware('');
    setValidFirmware(true);
    setResponseBody('');
    setCheckingIfSure(false);
    setDoingNow(false);
    setCheckingIfNow(false);
  }, [show]);

  useEffect(() => {
    setValidFirmware(true);
    setValidDate(true);
  }, [firmware, chosenDate]);

  const postUpgrade = (isNow) => {
    setDoingNow(isNow);
    setHadFailure(false);
    setHadSuccess(false);
    setWaiting(true);

    const token = getToken();
    const utcDate = new Date(chosenDate);
    const utcDateString = utcDate.toISOString();

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      serialNumber: selectedDeviceId,
    };

    const parameters = {
      serialNumber: selectedDeviceId,
      when: isNow ? 0 : dateToUnix(utcDateString),
      uri: firmware,
    };
    axiosInstance
      .post(`/device/${encodeURIComponent(selectedDeviceId)}/upgrade`, parameters, { headers })
      .then(() => {
        setResponseBody('Command submitted successfully');
        setHadSuccess(true);
      })
      .catch(() => {
        setResponseBody('Error while submitting command');
        setHadFailure(true);
      })
      .finally(() => {
        setCheckingIfNow(false);
        setDoingNow(false);
        setCheckingIfSure(false);
        setWaiting(false);
        eventBus.dispatch('actionCompleted', { message: 'An action has been completed' });
      });
  };

  return (
    <CModal show={show} onClose={toggleModal}>
      <CModalHeader closeButton>
        <CModalTitle>Firmware Upgrade</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <h6>Choose a time and a firmware version for this device</h6>
        <CRow style={{ marginTop: '20px' }}>
          <CCol>
            <CButton
              color="primary"
              onClick={() => (formValidation() ? confirmingIfNow() : null)}
              disabled={waiting}
              hidden={checkingIfNow}
              block
            >
              Do Now!
            </CButton>
            <CButton
              color="primary"
              onClick={() => (formValidation() ? postUpgrade(true) : null)}
              disabled={waiting}
              hidden={!checkingIfNow}
              block
            >
              {waiting && doingNow ? 'Loading...' : 'Confirm'}
              <CSpinner hidden={!waiting || doingNow} component="span" size="sm" />
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
            <p>Time of upgrade:</p>
          </CCol>
          <CCol xs="12" md="8">
            <DatePicker
              selected={chosenDate === '' ? new Date() : new Date(chosenDate)}
              value={chosenDate === '' ? new Date() : new Date(chosenDate)}
              className={('form-control', { 'is-invalid': !validDate })}
              includeTime
              placeholder="Select custom date in UTC"
              disabled={waiting}
              onChange={(date) => setDate(date)}
              min={new Date()}
            />
            <CInvalidFeedback>You need a date...</CInvalidFeedback>
          </CCol>
        </CRow>
        <div>Firmware URI:</div>
        <CInput
          disabled={waiting}
          className={('form-control', { 'is-invalid': !validFirmware })}
          type="text"
          id="uri"
          name="uri-input"
          placeholder="https://s3-us-west-2.amazonaws.com/ucentral.arilia.com/20210508-linksys_ea8300-uCentral-trunk-43e1a2d-upgrade.bin"
          autoComplete="firmware-uri"
          onChange={(event) => setFirmware(event.target.value)}
          value={firmware}
        />
        <CInvalidFeedback>You need a url...</CInvalidFeedback>
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
          Schedule Upgrade
        </CButton>
        <CButton
          hidden={!checkingIfSure}
          disabled={waiting}
          color="primary"
          onClick={() => (formValidation() ? postUpgrade() : null)}
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

FirmwareUpgradeModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
};

export default FirmwareUpgradeModal;
