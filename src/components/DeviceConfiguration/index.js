import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CFormGroup,
  CCol,
  CLabel,
  CForm,
  CInput,
  CCollapse,
  CCardFooter,
  CButton,
  CRow,
  CPopover,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import PropTypes from 'prop-types';
import { cilWindowMaximize, cilClone } from '@coreui/icons';
import { prettyDate } from 'utils/helper';
import axiosInstance from 'utils/axiosInstance';
import { getToken } from 'utils/authHelper';
import DeviceConfigurationModal from './DeviceConfigurationModal';
import styles from './index.module.scss';

const DeviceConfiguration = ({ selectedDeviceId }) => {
  const { t } = useTranslation();
  const [collapse, setCollapse] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [device, setDevice] = useState(null);
  const [copyPasswordSuccess, setCopyPasswordSuccess] = useState('');

  const toggle = (e) => {
    setCollapse(!collapse);
    e.preventDefault();
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const copyPasswordToClipboard = () => {
    const password = device.devicePassword === '' ? 'openwifi' : device.devicePassword;
    navigator.clipboard.writeText(password);
    setCopyPasswordSuccess(t('common.copied'));
  };

  const getDevice = () => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    };

    axiosInstance
      .get(`/device/${encodeURIComponent(selectedDeviceId)}`, options)
      .then((response) => {
        setDevice(response.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (selectedDeviceId) getDevice();
    setCopyPasswordSuccess(null);
  }, [selectedDeviceId]);

  if (device) {
    return (
      <div>
        <CCard>
          <CCardHeader>
            <CRow>
              <CCol><div className="text-value-lg">{t('configuration.details')}</div></CCol>
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
            <CForm
              action=""
              method="post"
              encType="multipart/form-data"
              className="form-horizontal"
            >
              <CFormGroup row>
                <CCol md="3">
                  <CLabel>{t('common.uuid')} : </CLabel>
                </CCol>
                <CCol xs="12" md="9">
                  {device.UUID}
                </CCol>
              </CFormGroup>
              <CFormGroup row>
                <CCol md="3">
                  <CLabel>{t('common.serial_number')} : </CLabel>
                </CCol>
                <CCol xs="12" md="9">
                  {device.serialNumber}
                </CCol>
              </CFormGroup>
              <CFormGroup row>
                <CCol md="3">
                  <CLabel>{t('configuration.type')} : </CLabel>
                </CCol>
                <CCol xs="12" md="9">
                  {device.deviceType}
                </CCol>
              </CFormGroup>
              <CFormGroup row>
                <CCol md="3">
                  <CLabel>{t('configuration.last_configuration_change')} : </CLabel>
                </CCol>
                <CCol xs="12" md="9">
                  {prettyDate(device.lastConfigurationChange)}
                </CCol>
              </CFormGroup>
              <CFormGroup row>
                <CCol md="3">
                  <CLabel>{t('common.mac')} :</CLabel>
                </CCol>
                <CCol xs="12" md="9">
                  {device.macAddress}
                </CCol>
              </CFormGroup>
              <CFormGroup row>
                <CCol md="3">
                  <CLabel>{t('configuration.created')} : </CLabel>
                </CCol>
                <CCol xs="12" md="9">
                  {prettyDate(device.createdTimestamp)}
                </CCol>
              </CFormGroup>
              <CFormGroup row>
                <CCol md="3">
                  <CLabel>{t('configuration.last_configuration_download')} : </CLabel>
                </CCol>
                <CCol xs="12" md="9">
                  {prettyDate(device.lastConfigurationDownload)}
                </CCol>
              </CFormGroup>
              <CFormGroup row>
                <CCol md="3">
                  <CLabel>{t('configuration.device_password')} : </CLabel>
                </CCol>
                <CCol xs="12" md="9">
                  {device.devicePassword === '' ? 'openwifi' : device.devicePassword}
                  <CPopover content={t('common.copy_to_clipboard')}>
                    <CButton onClick={copyPasswordToClipboard} size="sm">
                      <CIcon content={cilClone} />
                    </CButton>
                  </CPopover>
                  {copyPasswordSuccess}
                </CCol>
              </CFormGroup>
              <CCollapse show={collapse}>
                <CFormGroup row>
                  <CCol md="3">
                    <CLabel>{t('common.manufacturer')} :</CLabel>
                  </CCol>
                  <CCol xs="12" md="9">
                    {device.manufacturer}
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol md="3">
                    <CLabel htmlFor="text-input">{t('configuration.notes')} :</CLabel>
                  </CCol>
                  <CCol xs="12" md="9">
                    <CInput id="text-input" name="text-input" placeholder={device.notes} />
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol md="3">
                    <CLabel>{t('configuration.owner')} :</CLabel>
                  </CCol>
                  <CCol xs="12" md="9">
                    {device.owner}
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol md="3">
                    <CLabel>{t('configuration.location')} :</CLabel>
                  </CCol>
                  <CCol xs="12" md="9">
                    {device.location}
                  </CCol>
                </CFormGroup>
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
            </CForm>
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

DeviceConfiguration.propTypes = {
  selectedDeviceId: PropTypes.string.isRequired,
};

export default DeviceConfiguration;
