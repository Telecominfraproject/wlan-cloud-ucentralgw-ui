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
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-widgets/DatePicker';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { convertDateToUtc, convertDateFromUtc, dateToUnix } from 'utils/helper';
import 'react-widgets/styles.css';
import { getToken } from 'utils/authHelper';
import axiosInstance from 'utils/axiosInstance';
import eventBus from 'utils/eventBus';
import styles from './index.module.scss';

const FirmwareUpgradeModal = ({ show, toggleModal }) => {
  const { t } = useTranslation();
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
        setResponseBody(t('commands.error'));
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
        <CModalTitle>{t('upgrade.title')}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <h6>{t('upgrade.directions')}</h6>
        <CRow className={styles.spacedRow}>
          <CCol>
            <CButton
              color="primary"
              onClick={() => (formValidation() ? confirmingIfNow() : null)}
              disabled={waiting}
              hidden={checkingIfNow}
              block
            >
              {t('common.do_now')}
            </CButton>
            <CButton
              color="primary"
              onClick={() => (formValidation() ? postUpgrade(true) : null)}
              disabled={waiting}
              hidden={!checkingIfNow}
              block
            >
              {waiting && doingNow ? t('common.loading_ellipsis') : t('common.confirm')}
              <CSpinner hidden={!waiting || doingNow} component="span" size="sm" />
            </CButton>
          </CCol>
          <CCol>
            <CButton disabled={waiting} block color="primary" onClick={setDateToLate}>
              {t('common.later_tonight')}
            </CButton>
          </CCol>
        </CRow>
        <CRow className={styles.spacedRow}>
          <CCol md="4" className={styles.spacedColumn}>
            <p>{t('upgrade.time')}</p>
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
            <CInvalidFeedback>{t('common.need_date')}</CInvalidFeedback>
          </CCol>
        </CRow>
        <div>{t('upgrade.firmware_uri')}</div>
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
        <CInvalidFeedback>{t('upgrade.need_uri')}</CInvalidFeedback>
        <div hidden={!hadSuccess && !hadFailure}>
          <div>
            <pre className="ignore">{responseBody}</pre>
          </div>
        </div>
      </CModalBody>
      <CModalFooter>
        <div hidden={!checkingIfSure}>{t('common.are_you_sure')}</div>
        <CButton
          hidden={checkingIfSure}
          disabled={waiting}
          color="primary"
          onClick={() => (formValidation() ? confirmingIfSure() : null)}
        >
          {t('common.schedule')}
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
          {t('common.cancel')}
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
