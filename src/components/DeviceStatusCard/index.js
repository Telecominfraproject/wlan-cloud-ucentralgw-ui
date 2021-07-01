import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardHeader,
  CRow,
  CCol,
  CCardBody,
  CBadge,
  CModalBody,
  CAlert,
  CPopover,
  CButton,
  CSpinner,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { useAuth } from 'contexts/AuthProvider';
import { useDevice } from 'contexts/DeviceProvider';
import { cilSync } from '@coreui/icons';
import { useTranslation } from 'react-i18next';
import axiosInstance from 'utils/axiosInstance';
import { prettyDate, secondsToDetailed } from 'utils/helper';
import MemoryBar from './MemoryBar';

import styles from './index.module.scss';

const DeviceStatusCard = () => {
  const { t } = useTranslation();
  const { currentToken } = useAuth();
  const { deviceSerialNumber } = useDevice();
  const [lastStats, setLastStats] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const transformLoad = (load) => {
    if (load === undefined) return t('common.na');
    return `${((load / 65536) * 100).toFixed(2)}%`;
  };

  const getData = () => {
    setLoading(true);
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    const lastStatsRequest = axiosInstance.get(
      `/device/${encodeURIComponent(deviceSerialNumber)}/statistics?lastOnly=true`,
      options,
    );
    const statusRequest = axiosInstance.get(
      `/device/${encodeURIComponent(deviceSerialNumber)}/status`,
      options,
    );

    Promise.all([lastStatsRequest, statusRequest])
      .then(([newStats, newStatus]) => {
        setLastStats(newStats.data);
        setStatus(newStatus.data);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setError(false);
    if (deviceSerialNumber) getData();
  }, [deviceSerialNumber]);

  if (!error) {
    return (
      <CCard>
        <CCardHeader>
          <CRow>
            <CCol>
              <div className="text-value-lg">
                {t('status.title', { serialNumber: deviceSerialNumber })}
              </div>
            </CCol>
            <CCol>
              <div className={styles.alignRight}>
                <CPopover content={t('common.refresh')}>
                  <CButton color="secondary" onClick={getData} size="sm">
                    <CIcon content={cilSync} />
                  </CButton>
                </CPopover>
              </div>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          {(!lastStats || !status) && loading ? (
            <div className={styles.centerContainer}>
              <CSpinner className={styles.spinner} />
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div className={styles.overlayContainer} hidden={!loading}>
                <CSpinner className={styles.spinner} />
              </div>
              <CRow className={styles.spacedRow}>
                <CCol md="5">{t('status.connection_status')} :</CCol>
                <CCol xs="10" md="7">
                  {status?.connected ? (
                    <CBadge color="success">{t('common.connected')}</CBadge>
                  ) : (
                    <CBadge color="danger">{t('common.not_connected')}</CBadge>
                  )}
                </CCol>
              </CRow>
              <CRow className={styles.spacedRow}>
                <CCol md="5">{t('status.uptime')} :</CCol>
                <CCol xs="10" md="7">
                  {secondsToDetailed(
                    lastStats?.unit?.uptime,
                    t('common.day'),
                    t('common.days'),
                    t('common.hour'),
                    t('common.hours'),
                    t('common.minute'),
                    t('common.minutes'),
                    t('common.second'),
                    t('common.seconds'),
                  )}
                </CCol>
              </CRow>
              <CRow className={styles.spacedRow}>
                <CCol md="5">{t('status.last_contact')} :</CCol>
                <CCol xs="10" md="7">
                  {prettyDate(status?.lastContact)}
                </CCol>
              </CRow>
              <CRow className={styles.spacedRow}>
                <CCol md="5">{t('status.localtime')} :</CCol>
                <CCol xs="10" md="7">
                  {prettyDate(lastStats?.unit?.localtime)}
                </CCol>
              </CRow>
              <CRow className={styles.spacedRow}>
                <CCol md="5">{t('status.load_averages')} :</CCol>
                <CCol xs="10" md="7">
                  {transformLoad(lastStats?.unit?.load[0])}
                  {' / '}
                  {transformLoad(lastStats?.unit?.load[1])}
                  {' / '}
                  {transformLoad(lastStats?.unit?.load[2])}
                </CCol>
              </CRow>
              <CRow className={styles.spacedRow}>
                <CCol md="5">{t('status.memory')} :</CCol>
                <CCol xs="9" md="6" style={{ paddingTop: '5px' }}>
                  <MemoryBar
                    usedBytes={
                      lastStats?.unit?.memory?.total && lastStats?.unit?.memory?.free
                        ? lastStats?.unit?.memory?.total - lastStats?.unit?.memory?.free
                        : 0
                    }
                    totalBytes={lastStats?.unit?.memory?.total ?? 0}
                  />
                </CCol>
              </CRow>
            </div>
          )}
        </CCardBody>
      </CCard>
    );
  }

  return (
    <CCard>
      <CCardHeader>
        <CRow>
          <CCol>
            <div className="text-value-lg">
              {t('status.title', { serialNumber: deviceSerialNumber })}
            </div>
          </CCol>
        </CRow>
      </CCardHeader>
      <CModalBody>
        <CAlert hidden={!error} color="danger" className={styles.centerContainer}>
          {t('status.error')}
        </CAlert>
      </CModalBody>
    </CCard>
  );
};

export default React.memo(DeviceStatusCard);
