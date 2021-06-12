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
import { convertDateToUtc, convertDateFromUtc, dateToUnix } from 'utils/helper';
import 'react-widgets/styles.css';
import { getToken } from 'utils/authHelper';
import axiosInstance from 'utils/axiosInstance';
import eventBus from 'utils/eventBus';
import LoadingButton from 'components/LoadingButton/LoadingButton';
import SuccessfulActionModalBody from 'components/SuccessfulActionModalBody/SuccessfulActionModalBody';

const ActionModal = ({ show, toggleModal }) => {
  const [hadSuccess, setHadSuccess] = useState(false);
  const [hadFailure, setHadFailure] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [validDate, setValidDate] = useState(true);
  const [chosenDate, setChosenDate] = useState(new Date().toString());
  const [doingNow, setDoingNow] = useState(false);
  const [responseBody, setResponseBody] = useState('');
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

  useEffect(() => {
    if (show) {
      setHadSuccess(false);
      setHadFailure(false);
      setWaiting(false);
      setDoingNow(false);
      setChosenDate(new Date().toString());
      setResponseBody('');
      setValidDate(true);
    }
  }, [show]);

  const doAction = (isNow) => {
    if (isNow !== undefined) setDoingNow(isNow);
    setHadFailure(false);
    setHadSuccess(false);
    setWaiting(true);

    const token = getToken();
    const utcDate = new Date(chosenDate);
    const utcDateString = utcDate.toISOString();

    const parameters = {
      serialNumber: selectedDeviceId,
      when: isNow ? 0 : dateToUnix(utcDateString),
    };

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };

    axiosInstance
      .post(`/device/${encodeURIComponent(selectedDeviceId)}/reboot`, parameters, { headers })
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
        setWaiting(false);
        eventBus.dispatch('actionCompleted', { message: 'An action has been completed' });
      });
  };

  return (
    <CModal show={show} onClose={toggleModal}>
      <CModalHeader closeButton>
        <CModalTitle>Reboot Device</CModalTitle>
      </CModalHeader>
      {hadSuccess ? (
        <SuccessfulActionModalBody toggleModal={toggleModal} />
      ) : (
        <div>
          <CModalBody>
            <h6>When would you like to reboot this device?</h6>
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
            <LoadingButton
              label="Schedule"
              isLoadingLabel="Loading..."
              isLoading={waiting}
              action={doAction}
              variant="outline"
              block={false}
              disabled={waiting}
            />
            <CButton color="secondary" onClick={toggleModal}>
              Cancel
            </CButton>
          </CModalFooter>
        </div>
      )}
    </CModal>
  );
};

ActionModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
};

export default ActionModal;
