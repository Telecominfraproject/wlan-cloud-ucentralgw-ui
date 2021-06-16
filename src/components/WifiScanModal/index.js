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
} from '@coreui/react';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { getToken } from 'utils/authHelper';
import axiosInstance from 'utils/axiosInstance';
import eventBus from 'utils/eventBus';
import LoadingButton from 'components/LoadingButton';
import WifiChannelTable from 'components/WifiScanResultModal/containers/WifiChannelTable';
import 'react-widgets/styles.css';
import styles from './index.module.scss';

const WifiScanModal = ({ show, toggleModal }) => {
  const { t } = useTranslation();
  const [hadSuccess, setHadSuccess] = useState(false);
  const [hadFailure, setHadFailure] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [choseVerbose, setVerbose] = useState(true);
  const [activeScan, setActiveScan] = useState(false);
  const [channelList, setChannelList] = useState([]);
  const selectedDeviceId = useSelector((state) => state.selectedDeviceId);

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

    const token = getToken();

    const parameters = {
      serialNumber: selectedDeviceId,
      verbose: choseVerbose,
      activeScan,
    };
    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };

    axiosInstance
      .post(`/device/${encodeURIComponent(selectedDeviceId)}/wifiscan`, parameters, { headers })
      .then((response) => {
        const scanList = response?.data?.results?.status?.scan;

        if (scanList) {
          setChannelList(parseThroughList(scanList));
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
        <div className={styles.spacedRow} hidden={!hadSuccess && !hadFailure}>
          <WifiChannelTable channels={channelList} />
        </div>
      </CModalBody>
      <CModalFooter>
        <LoadingButton
          label={t('common.start')}
          isLoadingLabel={t('common.loading_ellipsis')}
          isLoading={waiting}
          action={doAction}
          variant="outline"
          block={false}
          disabled={waiting}
        />
        <CButton color="secondary" onClick={toggleModal}>
          {t('common.cancel')}
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
