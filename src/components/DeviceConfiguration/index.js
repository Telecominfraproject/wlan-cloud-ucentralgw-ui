import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCol,
  CLabel,
  CCollapse,
  CCardFooter,
  CButton,
  CRow,
  CPopover,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilWindowMaximize } from '@coreui/icons';
import { prettyDate } from 'utils/helper';
import axiosInstance from 'utils/axiosInstance';
import { CopyToClipboardButton, NotesTable, useAuth, useDevice } from 'ucentral-libs';
import DeviceConfigurationModal from './DeviceConfigurationModal';
import styles from './index.module.scss';

const DeviceConfiguration = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { deviceSerialNumber } = useDevice();
  const [loading, setLoading] = useState(false);
  const [collapse, setCollapse] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [device, setDevice] = useState(null);

  const toggle = (e) => {
    setCollapse(!collapse);
    e.preventDefault();
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const getDevice = () => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(
        `${endpoints.ucentralgw}/api/v1/device/${encodeURIComponent(deviceSerialNumber)}`,
        options,
      )
      .then((response) => {
        setDevice(response.data);
      })
      .catch(() => {});
  };

  const saveNote = (currentNote) => {
    setLoading(true);

    const parameters = {
      serialNumber: deviceSerialNumber,
      notes: [{ note: currentNote }],
    };

    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .put(
        `${endpoints.ucentralgw}/api/v1/device/${encodeURIComponent(deviceSerialNumber)}`,
        parameters,
        { headers },
      )
      .then(() => {
        getDevice();
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (deviceSerialNumber) getDevice();
  }, [deviceSerialNumber]);

  if (device) {
    return (
      <div>
        <CCard>
          <CCardHeader>
            <CRow>
              <CCol>
                <div className="text-value-lg">{t('configuration.title')}</div>
              </CCol>
              <CCol>
                <div className={styles.alignRight}>
                  <CPopover content={t('configuration.view_json')}>
                    <CButton color="secondary" onClick={toggleModal} size="sm">
                      <CIcon content={cilWindowMaximize} />
                    </CButton>
                  </CPopover>
                </div>
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody>
            <CRow className={styles.spacedRow}>
              <CCol md="3">
                <CLabel>{t('configuration.uuid')} : </CLabel>
              </CCol>
              <CCol xs="12" md="9">
                {device.UUID}
              </CCol>
            </CRow>
            <CRow className={styles.spacedRow}>
              <CCol md="3">
                <CLabel>{t('common.serial_number')} : </CLabel>
              </CCol>
              <CCol xs="12" md="9">
                {device.serialNumber}
                <CopyToClipboardButton t={t} size="sm" content={device.serialNumber} />
              </CCol>
            </CRow>
            <CRow className={styles.spacedRow}>
              <CCol md="3">
                <CLabel>{t('configuration.type')} : </CLabel>
              </CCol>
              <CCol xs="12" md="9">
                {device.deviceType}
              </CCol>
            </CRow>
            <CRow className={styles.spacedRow}>
              <CCol md="3">
                <CLabel>{t('configuration.last_configuration_change')} : </CLabel>
              </CCol>
              <CCol xs="12" md="9">
                {prettyDate(device.lastConfigurationChange)}
              </CCol>
            </CRow>
            <CRow className={styles.spacedRow}>
              <CCol md="3">
                <CLabel>{t('common.mac')} :</CLabel>
              </CCol>
              <CCol xs="12" md="9">
                {device.macAddress}
              </CCol>
            </CRow>
            <CRow className={styles.spacedRow}>
              <CCol md="3">
                <CLabel>{t('configuration.created')} : </CLabel>
              </CCol>
              <CCol xs="12" md="9">
                {prettyDate(device.createdTimestamp)}
              </CCol>
            </CRow>
            <CRow className={styles.spacedRow}>
              <CCol md="3" className={styles.topPadding}>
                <CLabel>{t('configuration.device_password')} : </CLabel>
              </CCol>
              <CCol xs="12" md="9">
                {device.devicePassword === '' ? 'openwifi' : device.devicePassword}
                <CopyToClipboardButton
                  t={t}
                  size="sm"
                  content={device?.devicePassword === '' ? 'openwifi' : device.devicePassword}
                />
              </CCol>
            </CRow>
            <NotesTable
              t={t}
              notes={device.notes}
              loading={loading}
              addNote={saveNote}
              descriptionColumn={false}
            />
            <CCollapse show={collapse}>
              <CRow className={styles.spacedRow}>
                <CCol md="3">
                  <CLabel>{t('configuration.last_configuration_download')} : </CLabel>
                </CCol>
                <CCol xs="12" md="9">
                  {prettyDate(device.lastConfigurationDownload)}
                </CCol>
              </CRow>
              <CRow className={styles.spacedRow}>
                <CCol md="3">
                  <CLabel>{t('common.manufacturer')} :</CLabel>
                </CCol>
                <CCol xs="12" md="9">
                  {device.manufacturer}
                </CCol>
              </CRow>
              <CRow className={styles.spacedRow}>
                <CCol md="3">
                  <CLabel>{t('configuration.owner')} :</CLabel>
                </CCol>
                <CCol xs="12" md="9">
                  {device.owner}
                </CCol>
              </CRow>
              <CRow className={styles.spacedRow}>
                <CCol md="3">
                  <CLabel>{t('configuration.location')} :</CLabel>
                </CCol>
                <CCol xs="12" md="9">
                  {device.location}
                </CCol>
              </CRow>
            </CCollapse>
            <CCardFooter>
              <CButton show={collapse ? 'true' : 'false'} onClick={toggle} block>
                <CIcon
                  className={styles.blackIcon}
                  name={collapse ? 'cilChevronTop' : 'cilChevronBottom'}
                  size="lg"
                />
              </CButton>
            </CCardFooter>
          </CCardBody>
        </CCard>
        <DeviceConfigurationModal show={showModal} toggle={toggleModal} configuration={device} />
      </div>
    );
  }

  return (
    <CCard>
      <CCardHeader>{t('configuration.details')}</CCardHeader>
      <CCardBody />
    </CCard>
  );
};

export default DeviceConfiguration;
