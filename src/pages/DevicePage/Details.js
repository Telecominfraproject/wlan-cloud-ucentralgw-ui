import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  CCard,
  CCardHeader,
  CRow,
  CCol,
  CCardBody,
  CPopover,
  CButton,
  CSpinner,
  CLabel,
  CLink,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSync } from '@coreui/icons';
import { prettyDate } from 'utils/helper';
import { CopyToClipboardButton, HideTextButton, useAuth } from 'ucentral-libs';
import { getCountryFromLocale } from 'utils/countries';
import ReactCountryFlag from 'react-country-flag';
import axiosInstance from 'utils/axiosInstance';

import styles from './index.module.scss';

const DeviceDetails = ({ t, loading, getData, status, deviceConfig, lastStats }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [subName, setSubName] = useState('');
  const { currentToken, endpoints } = useAuth();

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const getPassword = () => {
    const password =
      deviceConfig?.devicePassword === '' ? 'openwifi' : deviceConfig?.devicePassword;
    return showPassword ? password : '******';
  };

  const getSubData = async (subId) => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(`${endpoints.owsec}/api/v1/subuser/${subId}`, options)
      .then((response) => setSubName(response.data.name ?? ''))
      .catch(() => setSubName(''));
  };

  const getSubscriber = () => {
    if (!deviceConfig?.subscriber || deviceConfig.subscriber === '') return '';
    getSubData(deviceConfig.subscriber);

    return (
      <CLink
        className="c-subheader-nav-link align-self-center"
        aria-current="page"
        href={`${localStorage.getItem('owprov-ui')}/#/subscriber/${deviceConfig.subscriber}`}
        target="_blank"
      >
        {subName !== '' ? subName : deviceConfig.subscriber}
      </CLink>
    );
  };

  const displayExtra = (key, value, extraData) => {
    if (!extraData || !extraData[key]) return value;

    if (!localStorage.getItem('owprov-ui')) return extraData[key].name;

    return (
      <CLink
        className="c-subheader-nav-link align-self-center"
        aria-current="page"
        href={`${localStorage.getItem('owprov-ui')}/#/${
          key === 'entity' ? 'entity' : 'venue'
        }/${value}`}
        target="_blank"
      >
        {!extraData || !extraData[key] ? value : extraData[key].name}
      </CLink>
    );
  };

  return (
    <CCard className="m-0">
      <CCardHeader className="dark-header">
        <div className="d-flex flex-row-reverse align-items-center">
          <div className="text-right">
            <CPopover content={t('common.refresh')}>
              <CButton size="sm" color="info" onClick={getData}>
                <CIcon content={cilSync} />
              </CButton>
            </CPopover>
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
              <CCol lg="2" xl="1" xxl="1">
                <CLabel>{t('common.serial_num')}: </CLabel>
              </CCol>
              <CCol className="border-right" lg="2" xl="3" xxl="3">
                {deviceConfig?.serialNumber}
                {'      '}
                <CopyToClipboardButton t={t} size="sm" content={deviceConfig?.serialNumber} />
              </CCol>
              <CCol lg="2" xl="1" xxl="1">
                <CLabel className="align-middle">{t('configuration.device_password')}: </CLabel>
              </CCol>
              <CCol lg="2" xl="3" xxl="3">
                {getPassword()}
                {'      '}
                <HideTextButton t={t} toggle={toggleShowPassword} show={showPassword} />
                <CopyToClipboardButton
                  t={t}
                  size="sm"
                  content={
                    deviceConfig?.devicePassword === '' ? 'openwifi' : deviceConfig?.devicePassword
                  }
                />
              </CCol>
              <CCol className="border-left" lg="2" xl="1" xxl="1">
                <CLabel>{t('inventory.subscriber')}:</CLabel>
              </CCol>
              <CCol lg="2" xl="3" xxl="3">
                {getSubscriber()}
              </CCol>
              <CCol lg="2" xl="1" xxl="1">
                <CLabel>MAC:</CLabel>
              </CCol>
              <CCol className="border-right" lg="2" xl="3" xxl="3">
                {deviceConfig?.macAddress}
              </CCol>
              <CCol lg="2" xl="1" xxl="1">
                <CLabel>{t('configuration.type')}: </CLabel>
              </CCol>
              <CCol lg="2" xl="3" xxl="3">
                {deviceConfig?.deviceType}
              </CCol>
              <CCol className="border-left" lg="2" xl="1" xxl="1">
                <CLabel>{t('entity.entity')}:</CLabel>
              </CCol>
              <CCol lg="2" xl="3" xxl="3">
                {deviceConfig?.entity !== ''
                  ? displayExtra(
                      'entity',
                      deviceConfig?.venue?.slice(4),
                      deviceConfig?.extendedInfo,
                    )
                  : ''}
              </CCol>
              <CCol lg="2" xl="1" xxl="1">
                <CLabel>{t('common.manufacturer')}:</CLabel>
              </CCol>
              <CCol className="border-right" lg="2" xl="3" xxl="3">
                {deviceConfig?.manufacturer}
              </CCol>
              <CCol lg="2" xl="1" xxl="1">
                <CLabel>{t('configuration.created')}: </CLabel>
              </CCol>
              <CCol lg="2" xl="3" xxl="3">
                {prettyDate(deviceConfig?.createdTimestamp)}
              </CCol>
              <CCol className="border-left" lg="2" xl="1" xxl="1">
                <CLabel>{t('inventory.venue')}:</CLabel>
              </CCol>
              <CCol lg="2" xl="3" xxl="3">
                {deviceConfig?.venue !== ''
                  ? displayExtra('venue', deviceConfig?.venue?.slice(4), deviceConfig?.extendedInfo)
                  : ''}
              </CCol>
              <CCol lg="2" xl="1" xxl="1">
                <CLabel>Locale:</CLabel>
              </CCol>
              <CCol className="border-right" lg="2" xl="3" xxl="3">
                {deviceConfig?.locale !== '' && (
                  <ReactCountryFlag
                    style={{ width: '24px', height: '24px' }}
                    countryCode={deviceConfig?.locale}
                    svg
                  />
                )}
                {'  '}
                {deviceConfig?.locale && deviceConfig?.locale !== ''
                  ? `${deviceConfig.locale} - `
                  : 'Unknown'}
                {getCountryFromLocale(deviceConfig?.locale ?? '')}
              </CCol>
              <CCol lg="2" xl="1" xxl="1">
                <CLabel>{t('common.modified')}: </CLabel>
              </CCol>
              <CCol lg="2" xl="3" xxl="3">
                {prettyDate(deviceConfig?.modified)}
              </CCol>
              <CCol className="border-left" lg="2" xl="1" xxl="1">
                <CLabel>{t('configuration.location')}:</CLabel>
              </CCol>
              <CCol lg="2" xl="3" xxl="3">
                {deviceConfig?.location}
              </CCol>
            </CRow>
          </div>
        )}
      </CCardBody>
    </CCard>
  );
};

DeviceDetails.propTypes = {
  t: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  getData: PropTypes.func.isRequired,
  status: PropTypes.instanceOf(Object),
  deviceConfig: PropTypes.instanceOf(Object),
  lastStats: PropTypes.instanceOf(Object),
};

DeviceDetails.defaultProps = {
  status: null,
  lastStats: null,
  deviceConfig: null,
};

export default React.memo(DeviceDetails);
