import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSwitch,
  CCol,
  CRow,
  CForm,
  CFormGroup,
  CInputRadio,
  CLabel,
} from '@coreui/react';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-widgets/DatePicker';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { dateToUnix } from 'utils/helper';
import 'react-widgets/styles.css';
import { getToken } from 'utils/authHelper';
import axiosInstance from 'utils/axiosInstance';
import eventBus from 'utils/eventBus';
import SuccessfulActionModalBody from 'components/SuccessfulActionModalBody';
import LoadingButton from 'components/LoadingButton';

import styles from './index.module.scss';

const BlinkModal = ({ show, toggleModal }) => {
  const { t } = useTranslation();
  const [isNow, setIsNow] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [chosenDate, setChosenDate] = useState(new Date().toString());
  const [chosenPattern, setPattern] = useState('on');
  const [result, setResult] = useState(null);
  const selectedDeviceId = useSelector((state) => state.selectedDeviceId);

  const toggleNow = () => {
    setIsNow(!isNow);
  }

  const setDate = (date) => {
    if (date) {
      setChosenDate(date.toString());
    }
  };

  useEffect(() => {
    if (show) {
      setWaiting(false);
      setChosenDate(new Date().toString());
      setPattern('on');
      setResult(null);
    }
  }, [show]);

  const doAction = () => {
    setWaiting(true);

    const token = getToken();
    const utcDate = new Date(chosenDate);

    const parameters = {
      serialNumber: selectedDeviceId,
      when: isNow ? 0 : dateToUnix(utcDate),
      pattern: chosenPattern,
      duration: 30,
    };

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };

    axiosInstance
      .post(`/device/${encodeURIComponent(selectedDeviceId)}/leds`, parameters, { headers })
      .then(() => {
        setResult('success');
      })
      .catch(() => {
        setResult('error');
      })
      .finally(() => {
        setWaiting(false);
        eventBus.dispatch('actionCompleted', { message: 'An action has been completed' });
      });
  };

  return (
    <CModal show={show} onClose={toggleModal}>
      <CModalHeader closeButton>
        <CModalTitle>{t('blink.device_leds')}</CModalTitle>
      </CModalHeader>
      {result === 'success' ? (
        <SuccessfulActionModalBody toggleModal={toggleModal} />
      ) : (
        <div>
          <CModalBody>
            <h6>{t('blink.when_blink_leds')}</h6>
            <CRow className={styles.spacedRow}>
              <CCol md="7">{t('blink.pattern')}</CCol>
              <CCol>
                <CForm disabled={waiting}>
                  <CFormGroup variant="checkbox" onClick={() => setPattern('on')}>
                    <CInputRadio
                      defaultChecked={chosenPattern === 'on'}
                      id="radio1"
                      name="radios"
                      value="option1"
                    />
                    <CLabel variant="checkbox" htmlFor="radio1">
                      {t('common.on')}
                    </CLabel>
                  </CFormGroup>
                  <CFormGroup variant="checkbox" onClick={() => setPattern('off')}>
                    <CInputRadio
                      defaultChecked={chosenPattern === 'off'}
                      id="radio2"
                      name="radios"
                      value="option2"
                    />
                    <CLabel variant="checkbox" htmlFor="radio2">
                      {t('common.off')}
                    </CLabel>
                  </CFormGroup>
                  <CFormGroup variant="checkbox" onClick={() => setPattern('blink')}>
                    <CInputRadio
                      defaultChecked={chosenPattern === 'blink'}
                      id="radio3"
                      name="radios"
                      value="option3"
                    />
                    <CLabel variant="checkbox" htmlFor="radio3">
                      {t('blink.blink')}
                    </CLabel>
                  </CFormGroup>
                </CForm>
              </CCol>
            </CRow>
            <CRow className={styles.spacedRow}>
              <CCol md="8">
                <p className={styles.spacedText}>{t('common.execute_now')}</p>
              </CCol>
              <CCol>
                <CSwitch
                  disabled={waiting}
                  color="primary"
                  defaultChecked={isNow}
                  onClick={toggleNow}
                  labelOn={t('common.yes')}
                  labelOff={t('common.no')}
                />
              </CCol>
            </CRow>
            <CRow hidden={isNow} className={styles.spacedRow}>
              <CCol md="4" className={styles.spacedDate}>
                <p>{t('common.date')}</p>
              </CCol>
              <CCol xs="12" md="8">
                <DatePicker
                  selected={new Date(chosenDate)}
                  includeTime
                  value={new Date(chosenDate)}
                  placeholder="Select custom date"
                  disabled={waiting}
                  onChange={(date) => setDate(date)}
                  min={new Date()}
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <LoadingButton
              label={isNow ? t('blink.blink') : t('common.schedule')}
              isLoadingLabel={t('common.loading_ellipsis')}
              isLoading={waiting}
              action={doAction}
              block={false}
              disabled={waiting}
            />
            <CButton color="secondary" onClick={toggleModal}>
              {t('common.cancel')}
            </CButton>
          </CModalFooter>
        </div>
      )}
    </CModal>
  );
};

BlinkModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
};

export default BlinkModal;
