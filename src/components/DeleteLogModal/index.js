import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CModal, CModalHeader, CModalTitle, CModalBody, CCol, CRow } from '@coreui/react';
import DatePicker from 'react-widgets/DatePicker';
import PropTypes from 'prop-types';
import ConfirmFooter from 'components/ConfirmFooter';
import { dateToUnix } from 'utils/helper';
import axiosInstance from 'utils/axiosInstance';
import { useDevice } from 'contexts/DeviceProvider';
import { useAuth } from 'contexts/AuthProvider';
import eventBus from 'utils/eventBus';
import styles from './index.module.scss';

const DeleteLogModal = ({ show, toggle, object }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { deviceSerialNumber } = useDevice();
  const [loading, setLoading] = useState(false);
  const [maxDate, setMaxDate] = useState(new Date().toString());

  const setDate = (date) => {
    if (date) {
      setMaxDate(date.toString());
    }
  };

  const deleteLog = async () => {
    setLoading(true);

    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
      params: {
        endDate: dateToUnix(maxDate),
      },
    };
    return axiosInstance
      .delete(`${endpoints.ucentralgw}/api/v1/device/${deviceSerialNumber}/${object}`, options)
      .then(() => {})
      .catch(() => {})
      .finally(() => {
        if (object === 'healthchecks')
          eventBus.dispatch('deletedHealth', { message: 'Healthcheck was deleted' });
        else if (object === 'logs')
          eventBus.dispatch('deletedLogs', { message: 'Deleted device logs' });
        setLoading(false);
        toggle();
      });
  };

  useEffect(() => {
    setLoading(false);
    setMaxDate(new Date().toString());
  }, [show]);

  return (
    <CModal className={styles.modal} show={show} onClose={toggle}>
      <CModalHeader closeButton>
        <CModalTitle>
          {object === 'healthchecks'
            ? t('delete_logs.healthchecks_title')
            : t('delete_logs.device_logs_title')}
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <h6>{t('delete_logs.explanation', { object })}</h6>
        <CRow className={styles.spacedRow}>
          <CCol md="4" className={styles.spacedDate}>
            <p>{t('common.date')}:</p>
          </CCol>
          <CCol xs="12" md="8">
            <DatePicker
              selected={new Date(maxDate)}
              includeTime
              value={new Date(maxDate)}
              placeholder="Select custom date"
              disabled={loading}
              onChange={(date) => setDate(date)}
            />
          </CCol>
        </CRow>
      </CModalBody>
      <ConfirmFooter
        isShown={show}
        isLoading={loading}
        action={deleteLog}
        color="primary"
        toggleParent={toggle}
      />
    </CModal>
  );
};

DeleteLogModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  object: PropTypes.string.isRequired,
};

export default DeleteLogModal;
