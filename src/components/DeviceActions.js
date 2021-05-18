import React, { useState } from 'react';
import { CButton, CCard, CCardHeader, CCardBody, CRow, CCol } from '@coreui/react';
import ActionModalWidget from '../widgets/ActionModalWidget';
import FirmwareUpgradeModal from './FirmwareUpgradeModal';
import TraceModalWidget from '../widgets/TraceModalWidget';
import WifiScanModalWidget from '../widgets/WifiScanModalWidget';

const DeviceActions = () => {
  const [showRebootModal, setShowRebootModal] = useState(false);
  const [showBlinkModal, setShowBlinkModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTraceModal, setShowTraceModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);

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
          <CCol/>
        </CRow>
      </CCardBody>
      <ActionModalWidget
        show={showRebootModal}
        toggleModal={toggleRebootModal}
        title="Reboot Device"
        directions="When would you like to reboot this device?"
        actionLabel="reboot"
        action="reboot"
      />
      <ActionModalWidget
        show={showBlinkModal}
        toggleModal={toggleBlinkModal}
        title="Blink LEDs of Device"
        directions="When would you like make the LEDs of this device blink?"
        actionLabel="blink"
        action="leds"
        extraParameters={{ duration: 10, pattern: 'on' }}
      />
      <FirmwareUpgradeModal show={showUpgradeModal} toggleModal={toggleUpgradeModal} />
      <TraceModalWidget show={showTraceModal} toggleModal={toggleTraceModal} />
      <WifiScanModalWidget show={showScanModal} toggleModal={toggleScanModal} />
    </CCard>
  );
};

export default DeviceActions;
