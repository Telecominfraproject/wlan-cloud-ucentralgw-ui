import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CButton, CCard, CCardHeader, CCardBody, CRow, CCol } from '@coreui/react';
import axiosInstance from 'utils/axiosInstance';
import { LoadingButton, useAuth, useDevice, useToast } from 'ucentral-libs';
import RebootModal from 'components/RebootModal';
import DeviceFirmwareModal from 'components/DeviceFirmwareModal';
import ConfigureModal from 'components/ConfigureModal';
import TraceModal from 'components/TraceModal';
import WifiScanModal from 'components/WifiScanModal';
import BlinkModal from 'components/BlinkModal';
import FactoryResetModal from 'components/FactoryResetModal';
import EventQueueModal from 'components/EventQueueModal';
import TelemetryModal from 'components/TelemetryModal';

const DeviceActions = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { addToast } = useToast();
  const { deviceSerialNumber } = useDevice();
  const [upgradeStatus, setUpgradeStatus] = useState({
    loading: false,
  });
  const [device, setDevice] = useState({});
  const [showRebootModal, setShowRebootModal] = useState(false);
  const [showBlinkModal, setShowBlinkModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTraceModal, setShowTraceModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [showConfigModal, setConfigModal] = useState(false);
  const [showFactoryModal, setShowFactoryModal] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [showTelemetryModal, setShowTelemetryModal] = useState(false);

  const toggleRebootModal = () => setShowRebootModal(!showRebootModal);

  const toggleBlinkModal = () => setShowBlinkModal(!showBlinkModal);

  const toggleUpgradeModal = () => setShowUpgradeModal(!showUpgradeModal);

  const toggleTraceModal = () => setShowTraceModal(!showTraceModal);

  const toggleScanModal = () => setShowScanModal(!showScanModal);

  const toggleConfigModal = () => setConfigModal(!showConfigModal);

  const toggleFactoryResetModal = () => setShowFactoryModal(!showFactoryModal);

  const toggleQueueModal = () => setShowQueueModal(!showQueueModal);

  const toggleTelemetryModal = () => setShowTelemetryModal(!showTelemetryModal);

  const getRttysInfo = () => {
    setConnectLoading(true);
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(
        `${endpoints.owgw}/api/v1/device/${encodeURIComponent(deviceSerialNumber)}/rtty`,
        options,
      )
      .then((response) => {
        const url = `https://${response.data.server}:${response.data.viewport}/connect/${response.data.connectionId}`;
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
        if (newWindow) newWindow.opener = null;
      })
      .catch((e) => {
        addToast({
          title: t('common.error'),
          body: t('connect.error_trying_to_connect', { error: e.response?.data?.ErrorDescription }),
          color: 'danger',
          autohide: true,
        });
      })
      .finally(() => {
        setConnectLoading(false);
      });
  };

  const getDeviceInformation = () => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(`${endpoints.owgw}/api/v1/device/${deviceSerialNumber}`, options)
      .then((response) => {
        setDevice(response.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (upgradeStatus.result !== undefined) {
      addToast({
        title: upgradeStatus.result.success ? t('common.success') : t('common.error'),
        body: upgradeStatus.result.success
          ? t('firmware.upgrade_command_submitted')
          : upgradeStatus.result.error,
        color: upgradeStatus.result.success ? 'success' : 'danger',
        autohide: true,
      });
      setUpgradeStatus({
        loading: false,
      });
      setShowUpgradeModal(false);
    }
  }, [upgradeStatus]);

  useEffect(() => {
    getDeviceInformation();
  }, [deviceSerialNumber]);

  return (
    <CCard>
      <CCardHeader className="p-1">
        <div className="text-value-lg">{t('actions.title')}</div>
      </CCardHeader>
      <CCardBody>
        <CRow>
          <CCol>
            <CButton block onClick={toggleRebootModal} color="primary">
              {t('actions.reboot')}
            </CButton>
          </CCol>
          <CCol>
            <CButton block onClick={toggleBlinkModal} color="primary">
              {t('actions.blink')}
            </CButton>
          </CCol>
        </CRow>
        <CRow className="my-1">
          <CCol>
            <CButton block color="primary" onClick={toggleUpgradeModal}>
              {t('actions.firmware_upgrade')}
            </CButton>
          </CCol>
          <CCol>
            <CButton block color="primary" onClick={toggleTraceModal}>
              {t('actions.trace')}
            </CButton>
          </CCol>
        </CRow>
        <CRow className="my-1">
          <CCol>
            <CButton block color="primary" onClick={toggleScanModal}>
              {t('actions.wifi_scan')}
            </CButton>
          </CCol>
          <CCol>
            <CButton block color="primary" onClick={toggleFactoryResetModal}>
              {t('actions.factory_reset')}
            </CButton>
          </CCol>
        </CRow>
        <CRow className="my-1">
          <CCol>
            <LoadingButton
              isLoading={connectLoading}
              label={t('actions.connect')}
              isLoadingLabel={t('actions.connecting')}
              action={getRttysInfo}
            />
          </CCol>
          <CCol>
            <CButton block color="primary" onClick={toggleConfigModal}>
              {t('actions.configure')}
            </CButton>
          </CCol>
        </CRow>
        <CRow className="my-1">
          <CCol>
            <CButton block color="primary" onClick={toggleQueueModal}>
              {t('commands.event_queue')}
            </CButton>
          </CCol>
          <CCol>
            <CButton block color="primary" onClick={toggleTelemetryModal}>
              {t('actions.telemetry')}
            </CButton>
          </CCol>
        </CRow>
      </CCardBody>
      <RebootModal show={showRebootModal} toggleModal={toggleRebootModal} />
      <BlinkModal show={showBlinkModal} toggleModal={toggleBlinkModal} />
      <DeviceFirmwareModal
        t={t}
        endpoints={endpoints}
        currentToken={currentToken}
        device={device}
        show={showUpgradeModal}
        toggleFirmwareModal={toggleUpgradeModal}
        setUpgradeStatus={setUpgradeStatus}
        upgradeStatus={upgradeStatus}
      />
      <TraceModal show={showTraceModal} toggleModal={toggleTraceModal} />
      <WifiScanModal show={showScanModal} toggleModal={toggleScanModal} />
      <ConfigureModal show={showConfigModal} toggleModal={toggleConfigModal} />
      <FactoryResetModal show={showFactoryModal} toggleModal={toggleFactoryResetModal} />
      <EventQueueModal show={showQueueModal} toggle={toggleQueueModal} />
      <TelemetryModal show={showTelemetryModal} toggle={toggleTelemetryModal} />
    </CCard>
  );
};

export default DeviceActions;
