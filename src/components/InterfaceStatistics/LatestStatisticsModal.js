import React, { useState, useEffect } from 'react';
import {
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalTitle,
  CModalFooter,
} from '@coreui/react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import axiosInstance from 'utils/axiosInstance';
import { getToken } from 'utils/authHelper';
import styles from './index.module.scss';

const LatestStatisticsModal = ({ show, toggle, serialNumber }) => {
  const { t } = useTranslation();
  const [latestStats, setLatestStats] = useState('');

  const getLatestStats = () => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    };

    axiosInstance
      .get(`/device/${serialNumber}/statistics?lastOnly=true`, options)
      .then((response) => {
        setLatestStats(response.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (show) {
      getLatestStats();
    }
  }, [show]);

  return (
    <CModal size="lg" show={show} onClose={toggle}>
      <CModalHeader closeButton>
        <CModalTitle className={styles.modalTitle}>{t('statistics.latest_statistics')}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <pre className="ignore">{JSON.stringify(latestStats, null, 4)}</pre>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={toggle}>
          {t('common.close')}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

LatestStatisticsModal.propTypes = {
  serialNumber: PropTypes.string.isRequired,
  toggle: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
};

export default LatestStatisticsModal;
