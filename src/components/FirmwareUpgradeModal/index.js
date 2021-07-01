import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CSwitch,
  CCol,
  CRow,
  CInput,
  CInvalidFeedback,
  CModalFooter,
} from '@coreui/react';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-widgets/DatePicker';
import PropTypes from 'prop-types';
import { dateToUnix } from 'utils/helper';
import 'react-widgets/styles.css';
import { useAuth } from 'contexts/AuthProvider';
import { useDevice } from 'contexts/DeviceProvider';
import axiosInstance from 'utils/axiosInstance';
import eventBus from 'utils/eventBus';
import getDeviceConnection from 'utils/deviceHelper';
import ButtonFooter from './UpgradeFooter';
import styles from './index.module.scss';
import UpgradeWaitingBody from './UpgradeWaitingBody';

const FirmwareUpgradeModal = ({ show, toggleModal }) => {
  const { t } = useTranslation();
  const { currentToken } = useAuth();
  const { deviceSerialNumber } = useDevice();
  const [isNow, setIsNow] = useState(true);
  const [waitForUpgrade, setWaitForUpgrade] = useState(false);
  const [date, setDate] = useState(new Date().toString());
  const [firmware, setFirmware] = useState('');
  const [validFirmware, setValidFirmware] = useState(true);
  const [validDate, setValidDate] = useState(true);
  const [blockFields, setBlockFields] = useState(false);
  const [disabledWaiting, setDisableWaiting] = useState(false);
  const [waitingForUpgrade, setWaitingForUpgrade] = useState(false);
  const [showWaitingConsole, setShowWaitingConsole] = useState(false);
  const [deviceConnected, setDeviceConnected] = useState(true);

  const toggleNow = () => {
    if (isNow) {
      setWaitForUpgrade(false);
      setDisableWaiting(true);
    } else {
      setDisableWaiting(false);
    }

    setIsNow(!isNow);
  };

  const toggleWaitForUpgrade = () => {
    setWaitForUpgrade(waitForUpgrade);
  };

  const formValidation = () => {
    let valid = true;
    if (firmware.trim() === '') {
      setValidFirmware(false);
      valid = false;
    }

    if (!isNow && date.trim() === '') {
      setValidDate(false);
      valid = false;
    }
    return valid;
  };

  useEffect(() => {
    setBlockFields(false);
    setShowWaitingConsole(false);
  }, [show]);

  useEffect(() => {
    setValidFirmware(true);
    setValidDate(true);
  }, [firmware, date]);

  useEffect(() => {
    if (deviceSerialNumber !== null && show) {
      const asyncGet = async () => {
        const isConnected = await getDeviceConnection(deviceSerialNumber, currentToken);
        setDisableWaiting(!isConnected);
        setDeviceConnected(isConnected);
      };
      asyncGet();
    }
  }, [show]);

  const postUpgrade = () => {
    if (formValidation()) {
      setWaitingForUpgrade(true);
      setBlockFields(true);
      const headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
        serialNumber: deviceSerialNumber,
      };

      const parameters = {
        serialNumber: deviceSerialNumber,
        when: isNow ? 0 : dateToUnix(date),
        uri: firmware,
      };
      axiosInstance
        .post(`/device/${encodeURIComponent(deviceSerialNumber)}/upgrade`, parameters, { headers })
        .then(() => {
          if (waitForUpgrade) {
            setShowWaitingConsole(true);
          }
        })
        .catch(() => {})
        .finally(() => {
          setBlockFields(false);
          setWaitingForUpgrade(false);
          eventBus.dispatch('actionCompleted', { message: 'An action has been completed' });
        });
    }
  };

  if (showWaitingConsole) {
    return (
      <CModal show={show} onClose={toggleModal}>
        <CModalHeader closeButton>
          <CModalTitle>{t('upgrade.title')}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <UpgradeWaitingBody serialNumber={deviceSerialNumber} />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={toggleModal}>
            {t('common.close')}
          </CButton>
        </CModalFooter>
      </CModal>
    );
  }

  return (
    <CModal show={show} onClose={toggleModal}>
      <CModalHeader closeButton>
        <CModalTitle>{t('upgrade.title')}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <h6>{t('upgrade.directions')}</h6>
        <CRow className={styles.spacedRow}>
          <CCol md="4" className={styles.spacedColumn}>
            <p>{t('upgrade.firmware_uri')}</p>
          </CCol>
          <CCol md="8">
            <CInput
              disabled={blockFields}
              className={('form-control', { 'is-invalid': !validFirmware })}
              type="text"
              id="uri"
              name="uri-input"
              autoComplete="firmware-uri"
              onChange={(event) => setFirmware(event.target.value)}
              value={firmware}
            />
            <CInvalidFeedback>{t('upgrade.need_uri')}</CInvalidFeedback>
          </CCol>
        </CRow>
        <CRow className={styles.spacedRow}>
          <CCol md="8">
            <p className={styles.spacedText}>{t('common.execute_now')}</p>
          </CCol>
          <CCol>
            <CSwitch
              disabled={blockFields}
              color="primary"
              defaultChecked={isNow}
              onClick={toggleNow}
              labelOn={t('common.yes')}
              labelOff={t('common.no')}
            />
          </CCol>
        </CRow>
        <CRow className={styles.spacedRow} hidden={isNow}>
          <CCol md="4" className={styles.spacedColumn}>
            <p>{t('upgrade.time')}</p>
          </CCol>
          <CCol xs="12" md="8">
            <DatePicker
              selected={new Date(date)}
              value={new Date(date)}
              className={('form-control', { 'is-invalid': !validDate })}
              includeTime
              disabled={blockFields}
              onChange={(newDate) => setDate(newDate.toString())}
            />
            <CInvalidFeedback>{t('common.need_date')}</CInvalidFeedback>
          </CCol>
        </CRow>
        <CRow
          className={styles.spacedRow}
          hidden={true || !isNow || disabledWaiting || !deviceConnected}
        >
          <CCol md="8">
            <p className={styles.spacedText}>
              {t('upgrade.wait_for_upgrade')}
              <b hidden={!disabledWaiting}> {t('upgrade.offline_device')}</b>
            </p>
          </CCol>
          <CCol>
            <CSwitch
              disabled={blockFields || disabledWaiting}
              color="primary"
              defaultChecked={waitForUpgrade}
              onClick={toggleWaitForUpgrade}
              labelOn={t('common.yes')}
              labelOff={t('common.no')}
            />
          </CCol>
        </CRow>
      </CModalBody>
      <ButtonFooter
        isNow={isNow}
        isShown={show}
        isLoading={waitingForUpgrade}
        action={postUpgrade}
        color="primary"
        toggleParent={toggleModal}
      />
    </CModal>
  );
};

FirmwareUpgradeModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
};

export default FirmwareUpgradeModal;
