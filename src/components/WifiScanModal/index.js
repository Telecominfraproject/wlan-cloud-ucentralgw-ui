import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CForm,
  CSwitch,
  CCol,
  CSpinner,
} from '@coreui/react';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useAuth } from 'contexts/AuthProvider';
import { useDevice } from 'contexts/DeviceProvider';
import axiosInstance from 'utils/axiosInstance';
import eventBus from 'utils/eventBus';
import LoadingButton from 'components/LoadingButton';
import WifiChannelTable from 'components/WifiScanResultModal/WifiChannelTable';
import 'react-widgets/styles.css';
import styles from './index.module.scss';

const WifiScanModal = ({ show, toggleModal }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { deviceSerialNumber } = useDevice();
  const [hadSuccess, setHadSuccess] = useState(false);
  const [hadFailure, setHadFailure] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [choseVerbose, setVerbose] = useState(true);
  const [activeScan, setActiveScan] = useState(false);
  const [hideOptions, setHideOptions] = useState(false);
  const [channelList, setChannelList] = useState([]);

  const toggleVerbose = () => {
    setVerbose(!choseVerbose);
  };

  const toggleActiveScan = () => {
    setActiveScan(!activeScan);
  };

  useEffect(() => {
    setHadSuccess(false);
    setHadFailure(false);
    setWaiting(false);
    setChannelList([]);
    setVerbose(true);
    setActiveScan(false);
    setHideOptions(false);
  }, [show]);

  const parseThroughList = (scanList) => {
    const dbmNumber = 4294967295;
    const listOfChannels = [];

    scanList.forEach((scan) => {
      if (!listOfChannels.includes(scan.channel)) {
        listOfChannels.push(scan.channel);
      }
    });

    const finalList = [];
    listOfChannels.forEach((channelNumber) => {
      const channel = {
        channel: channelNumber,
        devices: [],
      };

      scanList.forEach((device) => {
        if (device.channel === channelNumber) {
          const deviceToAdd = {};
          deviceToAdd.SSID = device.ssid ?? 'N/A';
          deviceToAdd.Signal = (dbmNumber - device.signal) * -1;
          channel.devices.push(deviceToAdd);
        }
      });

      finalList.push(channel);
    });
    return finalList;
  };

  const doAction = () => {
    setHadFailure(false);
    setHadSuccess(false);
    setWaiting(true);

    const parameters = {
      serialNumber: deviceSerialNumber,
      verbose: choseVerbose,
      activeScan,
    };
    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .post(
        `${endpoints.ucentralgw}/api/v1/device/${encodeURIComponent(deviceSerialNumber)}/wifiscan`,
        parameters,
        { headers },
      )
      .then((response) => {
        const scanList = response?.data?.results?.status?.scan;

        if (scanList) {
          setChannelList(parseThroughList(scanList));
          setHideOptions(true);
          setHadSuccess(true);
        } else {
          setHadFailure(true);
        }
      })
      .catch(() => {
        setHadFailure(true);
      })
      .finally(() => {
        setWaiting(false);
        eventBus.dispatch('actionCompleted', { message: 'An action has been completed' });
      });
  };

  return (
    <CModal size="lg" show={show} onClose={toggleModal}>
      <CModalHeader closeButton>
        <CModalTitle>{t('actions.wifi_scan')}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div hidden={hideOptions || waiting}>
          <h6>{t('scan.directions')}</h6>
          <CRow className={styles.spacedRow}>
            <CCol md="3">
              <p className={styles.spacedText}>Verbose:</p>
            </CCol>
            <CCol>
              <CForm className={styles.spacedSwitch}>
                <CSwitch
                  color="primary"
                  defaultChecked={choseVerbose}
                  onClick={toggleVerbose}
                  labelOn={t('common.on')}
                  labelOff={t('common.off')}
                />
              </CForm>
            </CCol>
          </CRow>
          <CRow className={styles.spacedRow}>
            <CCol md="3">
              <p className={styles.spacedText}>{t('scan.active')}:</p>
            </CCol>
            <CCol>
              <CForm className={styles.spacedSwitch}>
                <CSwitch
                  color="primary"
                  defaultChecked={activeScan}
                  onClick={toggleActiveScan}
                  labelOn={t('common.on')}
                  labelOff={t('common.off')}
                />
              </CForm>
            </CCol>
          </CRow>
        </div>
        <div hidden={!waiting}>
          <CRow>
            <CCol>
              <h6>{t('scan.waiting_directions')}</h6>
            </CCol>
          </CRow>
          <CRow>
            <CCol className={styles.centerDiv}>
              <CSpinner />
            </CCol>
          </CRow>
        </div>
        <div hidden={!hadSuccess && !hadFailure}>
          <CRow className={styles.bottomSpace}>
            <CCol>
              <h6>{t('scan.result_directions')}</h6>
            </CCol>
          </CRow>
          <WifiChannelTable channels={channelList} />
        </div>
      </CModalBody>
      <CModalFooter>
        <LoadingButton
          label={!hadSuccess && !hadFailure ? t('scan.scan') : t('scan.re_scan')}
          isLoadingLabel={t('scan.scanning')}
          isLoading={waiting}
          action={doAction}
          variant="outline"
          block={false}
          disabled={waiting}
        />
        <CButton color="secondary" onClick={toggleModal}>
          {!hadSuccess && !hadFailure ? t('common.cancel') : t('common.exit')}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

WifiScanModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
};

export default WifiScanModal;
