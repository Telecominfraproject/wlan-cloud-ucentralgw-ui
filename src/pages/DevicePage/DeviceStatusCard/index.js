import React from 'react';
import PropTypes from 'prop-types';
import {
  CCard,
  CCardHeader,
  CRow,
  CCol,
  CCardBody,
  CBadge,
  CAlert,
  CPopover,
  CButton,
  CSpinner,
  CLabel,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSync } from '@coreui/icons';
import { prettyDate, compactSecondsToDetailed } from 'utils/helper';
import MemoryBar from './MemoryBar';

import styles from './index.module.scss';

const errorField = (t) => (
  <CAlert className="py-0" color="danger">
    {t('status.error')}
  </CAlert>
);

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
            <CCol className="mb-1" md="3" xl="3">
              {t('status.connection_status')}:
            </CCol>
            <CCol className="mb-1" md="9" xl="9">
              {status?.connected ? (
                <CBadge color="success">{t('common.connected')}</CBadge>
              ) : (
                <CBadge color="danger">{t('common.not_connected')}</CBadge>
              )}
            </CCol>
            <CCol className="my-1" md="3" xl="3">
              {t('status.uptime')}:
            </CCol>
            <CCol className="my-1" md="9" xl="9">
              {error
                ? errorField(t)
                : compactSecondsToDetailed(
                    lastStats?.unit?.uptime,
                    t('common.day'),
                    t('common.days'),
                    t('common.seconds'),
                  )}
            </CCol>
            <CCol className="my-1" md="3" xl="3">
              {t('status.last_contact')}:
            </CCol>
            <CCol className="my-1" md="9" xl="9">
              {error ? errorField(t) : prettyDate(status?.lastContact)}
            </CCol>
            <CCol className="my-1" md="3" xl="3">
              {t('status.localtime')}:
            </CCol>
            <CCol className="my-1" md="9" xl="9">
              {error ? errorField(t) : prettyDate(lastStats?.unit?.localtime)}
            </CCol>
            <CCol className="mt-1" md="3" xl="3">
              <CLabel>{t('firmware.revision')}: </CLabel>
            </CCol>
            <CCol className="mt-1" md="9" xl="9">
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
            <CCol className="mb-1" md="3" xl="3">
              {t('status.load_averages')}:
            </CCol>
            <CCol className="mb-1" md="9" xl="9">
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
          </CRow>
          <CRow>
            <CCol className="mb-1" md="3" xl="3">
              {t('status.memory')}:
            </CCol>
            <CCol className="mb-1" md="9" xl="9" style={{ paddingTop: '5px' }}>
              {error ? (
                errorField(t)
              ) : (
                <MemoryBar
                  t={t}
                  usedBytes={
                    lastStats?.unit?.memory?.total && lastStats?.unit?.memory?.free
                      ? lastStats?.unit?.memory?.total - lastStats?.unit?.memory?.free
                      : 0
                  }
                  totalBytes={lastStats?.unit?.memory?.total ?? 0}
                />
              )}
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
