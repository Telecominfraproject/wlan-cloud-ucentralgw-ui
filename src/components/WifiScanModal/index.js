import {
  CAlert,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CRow,
  CForm,
  CSwitch,
  CCol,
  CSpinner,
  CPopover,
  CSelect,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCloudDownload, cilGauge, cilX } from '@coreui/icons';
import React, { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import axiosInstance from 'utils/axiosInstance';
import eventBus from 'utils/eventBus';
import { prettyDateForFile } from 'utils/helper';
import { useAuth, useDevice } from 'ucentral-libs';
import WifiChannelTable from 'components/WifiScanResultModal/WifiChannelTable';
import 'react-widgets/styles.css';
import { CSVLink } from 'react-csv';

const WifiScanModal = ({ show, toggleModal }) => {
  const { t } = useTranslation();
  const { currentToken, endpoints } = useAuth();
  const { deviceSerialNumber } = useDevice();
  const [hadSuccess, setHadSuccess] = useState(false);
  const [hadFailure, setHadFailure] = useState(false);
  const [errorCode, setErrorCode] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [dfs, setDfs] = useState(true);
  const [bandwidth, setBandwidth] = useState('');
  const [activeScan, setActiveScan] = useState(false);
  const [hideOptions, setHideOptions] = useState(false);
  const [channelList, setChannelList] = useState([]);
  const [csvData, setCsvData] = useState(null);

  const toggleDfs = () => {
    setDfs(!dfs);
  };

  const toggleActiveScan = () => {
    setActiveScan(!activeScan);
  };

  useEffect(() => {
    setHadSuccess(false);
    setHadFailure(false);
    setWaiting(false);
    setChannelList([]);
    setCsvData(null);
    setBandwidth('');
    setDfs(true);
    setActiveScan(false);
    setHideOptions(false);
    setErrorCode(0);
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
          if (device.ssid && device.ssid.length > 0) deviceToAdd.SSID = device.ssid;
          else {
            deviceToAdd.SSID = device.meshid && device.meshid.length > 0 ? device.meshid : 'N/A';
          }
          deviceToAdd.Signal = (dbmNumber - device.signal) * -1;
          channel.devices.push(deviceToAdd);
        }
      });

      finalList.push(channel);
    });
    return finalList;
  };

  const getData = useCallback((scanResults) => {
    if (scanResults === null || scanResults.length === 0) return [];
    const dbmNumber = 4294967295;
    const listOfChannels = [];
    const listCsv = [];

    scanResults.forEach((scan) => {
      if (!listOfChannels.includes(scan.channel)) {
        listOfChannels.push(scan.channel);
      }
    });

    listOfChannels.forEach((channelNumber) => {
      const channel = {
        channel: channelNumber,
        devices: [],
      };

      scanResults.forEach((device) => {
        if (device.channel === channelNumber) {
          const deviceToAdd = {};
          if (device.ssid && device.ssid.length > 0) deviceToAdd.SSID = device.ssid;
          else {
            deviceToAdd.SSID = device.meshid && device.meshid.length > 0 ? device.meshid : 'N/A';
          }
          deviceToAdd.Signal = (dbmNumber - device.signal) * -1;
          channel.devices.push(deviceToAdd);
          listCsv.push({ ...deviceToAdd, ...device });
        }
      });
    });
    return listCsv;
  }, []);

  const doAction = () => {
    setHadFailure(false);
    setHadSuccess(false);
    setWaiting(true);

    const parameters = {
      serialNumber: deviceSerialNumber,
      override_dfs: dfs,
      bandwidth: bandwidth !== '' ? bandwidth : undefined,
      activeScan,
    };
    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${currentToken}`,
    };

    axiosInstance
      .post(
        `${endpoints.owgw}/api/v1/device/${encodeURIComponent(deviceSerialNumber)}/wifiscan`,
        parameters,
        { headers },
      )
      .then((response) => {
        const scanList = response?.data?.results?.status?.scan;

        if (scanList) {
          setChannelList(parseThroughList(scanList));
          setCsvData(getData(scanList));
          setErrorCode(response.data.errorCode ?? 0);
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
      <CModalHeader className="p-1">
        <CModalTitle className="pl-1 pt-1">{t('actions.wifi_scan')}</CModalTitle>
        <div className="text-right">
          {csvData !== null ? (
            <CPopover content={t('common.download')}>
              <CSVLink
                filename={`wifi_scan_${deviceSerialNumber}_${prettyDateForFile(
                  new Date().getTime() / 1000,
                )}.csv`}
                data={csvData}
              >
                <CButton color="primary" variant="outline" className="ml-2">
                  <CIcon content={cilCloudDownload} />
                </CButton>
              </CSVLink>
            </CPopover>
          ) : (
            <CButton color="primary" variant="outline" className="ml-2" disabled>
              <CIcon content={cilCloudDownload} />
            </CButton>
          )}
          <CPopover content={t('scan.scan')}>
            <CButton
              color="primary"
              variant="outline"
              className="ml-2"
              onClick={doAction}
              disabled={waiting}
            >
              <CIcon content={cilGauge} />
            </CButton>
          </CPopover>
          <CPopover content={t('common.close')}>
            <CButton color="primary" variant="outline" className="ml-2" onClick={toggleModal}>
              <CIcon content={cilX} />
            </CButton>
          </CPopover>
        </div>
      </CModalHeader>
      <CModalBody>
        <div hidden={hideOptions || waiting}>
          <h6>{t('scan.directions')}</h6>
          <CRow className="mt-3">
            <CCol md="3">
              <p className="pl-2">{t('wifi_analysis.override_dfs')}:</p>
            </CCol>
            <CCol>
              <CForm className="pl-4">
                <CSwitch
                  color="primary"
                  defaultChecked={dfs}
                  onClick={toggleDfs}
                  labelOn={t('common.on')}
                  labelOff={t('common.off')}
                />
              </CForm>
            </CCol>
          </CRow>
          <CRow className="mt-3">
            <CCol md="3">
              <p className="pl-2">{t('scan.active')}:</p>
            </CCol>
            <CCol>
              <CForm className="pl-4">
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
          <CRow className="mt-3">
            <CCol md="3">
              <p className="pl-2">Bandwidth:</p>
            </CCol>
            <CCol>
              <CForm className="pl-4">
                <CSelect
                  custom
                  value={bandwidth}
                  onChange={(e) => setBandwidth(e.target.value)}
                  style={{ width: '100px' }}
                >
                  <option value="">Default</option>
                  <option value="20">20 MHz</option>
                  <option value="40">40 MHz</option>
                  <option value="80">80 MHz</option>
                </CSelect>
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
            <CCol className="d-flex align-middle justify-content-center">
              <CSpinner />
            </CCol>
          </CRow>
        </div>
        <div hidden={!hadSuccess && !hadFailure}>
          <CRow className="mb-2">
            <CCol>
              <h6>{t('scan.result_directions')}</h6>
            </CCol>
          </CRow>
          {errorCode === 1 && (
            <CRow className="mb-2">
              <CCol>
                <CAlert color="warning">{t('wifi_analysis.scan_warning')}</CAlert>
              </CCol>
            </CRow>
          )}
          <WifiChannelTable channels={channelList} />
        </div>
      </CModalBody>
    </CModal>
  );
};

WifiScanModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
};

export default WifiScanModal;
