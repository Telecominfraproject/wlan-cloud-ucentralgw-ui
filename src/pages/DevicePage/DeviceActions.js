import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { CButton, CCard, CCardHeader, CCardBody, CRow, CCol } from '@coreui/react';
import ActionModal from './ActionModal';
import FirmwareUpgradeModal from './FirmwareUpgradeModal';
import ConfigureModal from './ConfigureModal';
import TraceModal from './TraceModal';
import WifiScanModal from './WifiScanModal';
import BlinkModal from './BlinkModal';
import FactoryResetModal from './FactoryResetModal';
import axiosInstance from '../../utils/axiosInstance';
import { getToken } from '../../utils/authHelper';
import LoadingButton from '../../components/LoadingButton';

const DeviceActions = ({ selectedDeviceId }) => {
  const [showRebootModal, setShowRebootModal] = useState(false);
  const [showBlinkModal, setShowBlinkModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTraceModal, setShowTraceModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [showConfigModal, setConfigModal] = useState(false);
  const [showFactoryModal, setShowFactoryModal] = useState(false);

  const toggleRebootModal = () => {
    setShowRebootModal(!showRebootModal);
  };

  const toggleBlinkModal = () => {
    setShowBlinkModal(!showBlinkModal);
  };

  const toggleUpgradeModal = () => {
    setShowUpgradeModal(!showUpgradeModal);
  };

  const toggleTraceModal = () => {
    setShowTraceModal(!showTraceModal);
  };

  const toggleScanModal = () => {
    setShowScanModal(!showScanModal);
  };

  const toggleConfigModal = () => {
    setConfigModal(!showConfigModal);
  };

  const toggleFactoryResetModal = () => {
    setShowFactoryModal(!showFactoryModal);
  }

  const getRttysInfo = () => {
    setConnectLoading(true);
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    };

    axiosInstance
      .get(`/device/${encodeURIComponent(selectedDeviceId)}/rtty`, options)
      .then((response) => {
        const url = `https://${response.data.server}:${response.data.viewport}/connect/${response.data.connectionId}`;
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
        if (newWindow) newWindow.opener = null;
      })
      .catch(() => {})
      .finally(() => {
        setConnectLoading(false);
      });
  };

  return (
    <CCard>
      <CCardHeader>Device Actions</CCardHeader>
      <CCardBody>
        <CRow>
          <CCol>
            <CButton block onClick={toggleRebootModal} color="primary">
              Reboot
            </CButton>
          </CCol>
          <CCol>
            <CButton block onClick={toggleBlinkModal} color="primary">
              Blink
            </CButton>
          </CCol>
        </CRow>
        <CRow style={{ marginTop: '10px' }}>
          <CCol>
            <CButton block color="primary" onClick={toggleUpgradeModal}>
              Firmware Upgrade
            </CButton>
          </CCol>
          <CCol>
            <CButton block color="primary" onClick={toggleTraceModal}>
              Trace
            </CButton>
          </CCol>
        </CRow>
        <CRow style={{ marginTop: '10px' }}>
          <CCol>
            <CButton block color="primary" onClick={toggleScanModal}>
              Wifi Scan
            </CButton>
          </CCol>
          <CCol>
            <CButton block color="primary" onClick={toggleFactoryResetModal}>
              Factory Reset
            </CButton>
          </CCol>
        </CRow>
        <CRow style={{ marginTop: '10px' }}>
          <CCol>
            <LoadingButton
              isLoading={connectLoading}
              label="Connect"
              isLoadingLabel="Connecting..."
              action={getRttysInfo}
            />
          </CCol>
          <CCol>
            <CButton block color="primary" onClick={toggleConfigModal}>
              Configure
            </CButton>
          </CCol>
        </CRow>
      </CCardBody>
      <ActionModal
        show={showRebootModal}
        toggleModal={toggleRebootModal}
        title="Reboot Device"
        directions="When would you like to reboot this device?"
        actionLabel="reboot"
        action="reboot"
      />
      <BlinkModal show={showBlinkModal} toggleModal={toggleBlinkModal} />
      <FirmwareUpgradeModal show={showUpgradeModal} toggleModal={toggleUpgradeModal} />
      <TraceModal show={showTraceModal} toggleModal={toggleTraceModal} />
      <WifiScanModal show={showScanModal} toggleModal={toggleScanModal} />
      <ConfigureModal show={showConfigModal} toggleModal={toggleConfigModal} />
      <FactoryResetModal show={showFactoryModal} toggleModal={toggleFactoryResetModal} />
    </CCard>
  );
};

DeviceActions.propTypes = {
  selectedDeviceId: PropTypes.string.isRequired,
};

export default DeviceActions;
