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
import { cilWindowMaximize } from '@coreui/icons';
import { prettyDate } from 'utils/helper';
import axiosInstance from 'utils/axiosInstance';
import { getToken } from 'utils/authHelper';
import DeviceConfigurationModal from './DeviceConfigurationModal';

const DeviceConfiguration = ({ selectedDeviceId }) => {
  const { t } = useTranslation();
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
  }, [selectedDeviceId]);

  if (device) {
    return (
      <div>
        <CCard>
          <CCardHeader>
            <CRow>
              <CCol>{t('configuration.details')}</CCol>
              <CCol>
                <div style={{ float: 'right' }}>
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
                    style={{ color: 'black' }}
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
