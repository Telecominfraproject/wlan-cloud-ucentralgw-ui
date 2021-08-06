import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CButton,
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CToast,
  CToastBody,
  CToaster,
  CToastHeader,
} from '@coreui/react';
import axiosInstance from 'utils/axiosInstance';
import { LoadingButton, useAuth, useDevice } from 'ucentral-libs';
import RebootModal from 'components/RebootModal';
import DeviceFirmwareModal from 'components/DeviceFirmwareModal';
import ConfigureModal from 'components/ConfigureModal';
import TraceModal from 'components/TraceModal';
import WifiScanModal from 'components/WifiScanModal';
import BlinkModal from 'components/BlinkModal';
import FactoryResetModal from 'components/FactoryResetModal';

import styles from './index.module.scss';

const DeviceActions = () => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { deviceSerialNumber } = useDevice();
  const [upgradeStatus, setUpgradeStatus] = useState({
    loading: false,
  });
  const [toast, setToast] = useState({
    show: false,
    success: true,
    text: '',
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
  };

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
        `${endpoints.ucentralgw}/api/v1/device/${encodeURIComponent(deviceSerialNumber)}/rtty`,
        options,
      )
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

  const getDeviceInformation = () => {
    const options = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    };

    axiosInstance
      .get(`${endpoints.ucentralgw}/api/v1/device/${deviceSerialNumber}`, options)
      .then((response) => {
        setDevice(response.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (upgradeStatus.result !== undefined) {
      setToast({
        show: true,
        success: upgradeStatus.result.success,
        text: upgradeStatus.result.success
          ? t('firmware.upgrade_command_submitted')
          : upgradeStatus.result.error,
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
      <CCardHeader>
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
        <CRow className={styles.spacedRow}>
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
        <CRow className={styles.spacedRow}>
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
        <CRow className={styles.spacedRow}>
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
      <CToaster>
        <CToast
          autohide={5000}
          fade
          color={toast.success ? 'success' : 'danger'}
          className="text-white align-items-center"
          show={toast.show}
        >
          <CToastHeader closeButton>
            {toast.success ? t('common.success') : t('common.error')}
          </CToastHeader>
          <div className="d-flex">
            <CToastBody>{toast.text}</CToastBody>
          </div>
        </CToast>
      </CToaster>
    </CCard>
  );
};

export default DeviceActions;
