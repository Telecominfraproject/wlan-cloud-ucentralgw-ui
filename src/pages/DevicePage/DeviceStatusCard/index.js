/* eslint-disable jsx-a11y/img-redundant-alt */
import React from 'react';
import PropTypes from 'prop-types';
import {
  CAlert,
  CCard,
  CCardHeader,
  CRow,
  CCol,
  CCardBody,
  CBadge,
  CPopover,
  CButton,
  CSpinner,
  CLabel,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSync } from '@coreui/icons';
import { prettyDate, compactSecondsToDetailed, cleanBytesString } from 'utils/helper';

import styles from './index.module.scss';

const errorField = (t) => (
  <CAlert className="py-0" color="danger">
    {t('status.error')}
  </CAlert>
);

const getMemoryColor = (memTotal, memFree) => {
  let memoryUsed = 0;
  if (memTotal > 0) memoryUsed = Math.floor(((memTotal - memFree) / memTotal) * 100);

  if (memoryUsed < 60) return 'success';
  if (memoryUsed <= 85) return 'warning';
  return 'danger';
};

const getMemoryPercentage = (memTotal, memFree) => {
  if (memTotal <= 0) return `0%`;
  return `${Math.floor(((memTotal - memFree) / memTotal) * 100)}%`;
};

const DeviceStatusCard = ({
  t,
  loading,
  error,
  deviceSerialNumber,
  getData,
  status,
  deviceConfig,
  lastStats,
}) => (
  <CCard>
    <CCardHeader className="dark-header">
      <div className="d-flex flex-row-reverse align-items-center">
        <div className="text-right">
          <CPopover content={t('common.refresh')}>
            <CButton size="sm" color="info" onClick={getData}>
              <CIcon content={cilSync} />
            </CButton>
          </CPopover>
        </div>
        <div className="text-value-lg mr-auto">
          {deviceSerialNumber}, {deviceConfig?.compatible}
        </div>
      </div>
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
          <CRow>
            <CCol md="5" lg="5" xl="4" className="text-center align-middle bg-light">
              <img
                style={{
                  maxHeight: '250px',
                  maxWidth: '100%',
                  position: 'relative',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
                src={`assets/devices/${deviceConfig?.compatible}.png`}
                alt="Image not found"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'assets/NotFound.png';
                }}
                height="auto"
                width="auto"
              />
            </CCol>
            <CCol md="7" lg="7" xl="8" className="border-left">
              <CRow>
                <CCol className="mb-1" md="4" xl="4">
                  {t('status.connection_status')}:
                </CCol>
                <CCol className="mb-1" md="8" xl="8">
                  {status?.connected ? (
                    <CBadge color="success">{t('common.connected')}</CBadge>
                  ) : (
                    <CBadge color="danger">{t('common.not_connected')}</CBadge>
                  )}
                </CCol>
                <CCol className="my-1" md="4" xl="4">
                  {t('status.uptime')}:
                </CCol>
                <CCol className="my-1" md="8" xl="8">
                  {error
                    ? errorField(t)
                    : compactSecondsToDetailed(
                        lastStats?.unit?.uptime,
                        t('common.day'),
                        t('common.days'),
                        t('common.seconds'),
                      )}
                </CCol>
                <CCol className="my-1" md="4" xl="4">
                  {t('status.last_contact')}:
                </CCol>
                <CCol className="my-1" md="8" xl="8">
                  {error ? errorField(t) : prettyDate(status?.lastContact)}
                </CCol>
                <CCol className="my-1" md="4" xl="4">
                  {t('status.localtime')}:
                </CCol>
                <CCol className="my-1" md="8" xl="8">
                  {error ? errorField(t) : prettyDate(lastStats?.unit?.localtime)}
                </CCol>
                <CCol className="mt-1" md="4" xl="4">
                  <CLabel>{t('firmware.revision')}: </CLabel>
                </CCol>
                <CCol className="mt-1" md="8" xl="8">
                  <CPopover content={deviceConfig?.firmware}>
                    <CLabel>
                      {deviceConfig?.firmware?.split(' / ').length > 1
                        ? deviceConfig.firmware.split(' / ')[1]
                        : deviceConfig?.firmware}
                    </CLabel>
                  </CPopover>
                </CCol>
              </CRow>
              <CRow>
                <CCol className="mb-1" md="4" xl="4">
                  {t('status.load_averages')}:
                </CCol>
                <CCol className="mb-1" md="8" xl="8">
                  {error ? (
                    errorField(t)
                  ) : (
                    <div>
                      {lastStats?.unit?.load[0] !== undefined
                        ? (lastStats?.unit?.load[0] * 100).toFixed(2)
                        : '-'}
                      %{' / '}
                      {lastStats?.unit?.load[1] !== undefined
                        ? (lastStats?.unit?.load[1] * 100).toFixed(2)
                        : '-'}
                      %{' / '}
                      {lastStats?.unit?.load[2] !== undefined
                        ? (lastStats?.unit?.load[2] * 100).toFixed(2)
                        : '-'}
                      %
                    </div>
                  )}
                </CCol>
                <CCol className="mb-1" md="4" xl="4">
                  {t('status.total_memory')}:
                </CCol>
                <CCol className="mb-1" md="8" xl="8" style={{ paddingTop: '5px' }}>
                  {error ? errorField(t) : cleanBytesString(lastStats?.unit?.memory?.total)}
                </CCol>
                <CCol className="mb-1" md="4" xl="4">
                  {t('status.memory')}:
                </CCol>
                <CCol className="mb-1" md="8" xl="8" style={{ paddingTop: '5px' }}>
                  {error ? (
                    errorField(t)
                  ) : (
                    <CAlert
                      style={{ width: '40px' }}
                      className="p-0 text-center"
                      color={getMemoryColor(
                        lastStats?.unit?.memory?.total ?? 0,
                        lastStats?.unit?.memory?.free ?? 0,
                      )}
                    >
                      {getMemoryPercentage(
                        lastStats?.unit?.memory?.total ?? 0,
                        lastStats?.unit?.memory?.free ?? 0,
                      )}
                    </CAlert>
                  )}
                </CCol>
              </CRow>
            </CCol>
          </CRow>
        </div>
      )}
    </CCardBody>
  </CCard>
);

DeviceStatusCard.propTypes = {
  t: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.bool.isRequired,
  deviceSerialNumber: PropTypes.string.isRequired,
  getData: PropTypes.func.isRequired,
  status: PropTypes.instanceOf(Object),
  deviceConfig: PropTypes.instanceOf(Object),
  lastStats: PropTypes.instanceOf(Object),
};

DeviceStatusCard.defaultProps = {
  status: null,
  lastStats: null,
  deviceConfig: null,
};

export default React.memo(DeviceStatusCard);
