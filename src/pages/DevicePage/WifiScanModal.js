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
  CCol
} from '@coreui/react';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import WifiChannelTable from './WifiChannelTable';
import 'react-widgets/styles.css';
import { getToken } from '../../utils/authHelper';
import axiosInstance from '../../utils/axiosInstance';
import eventBus from '../../utils/EventBus';
import LoadingButton from '../../components/LoadingButton';

const WifiScanModal = ({ show, toggleModal }) => {
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
  }

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
      activeScan
    };
    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };

    axiosInstance
      .post(`/device/${encodeURIComponent(selectedDeviceId)}/wifiscan`, parameters, { headers })
      .then((response) => {
        const scanList = response.data.results.status.scan;

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
        <CModalTitle>Wifi Scan</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <h6>Launch a wifi scan of this device, which should take approximately 25 seconds.</h6>
        <CRow style={{ marginTop: '20px' }}>
          <CCol md="3">
            <p style={{ paddingLeft: '2%' }}>Verbose:</p>
          </CCol>
          <CCol>
            <CForm style={{ paddingLeft: '5%' }}>
              <CSwitch
                color="primary"
                defaultChecked={choseVerbose}
                onClick={() => toggleVerbose()}
                labelOn="On"
                labelOff="Off"
              />
            </CForm>
          </CCol>
        </CRow>
        <CRow style={{ marginTop: '20px' }}>
          <CCol md="3">
            <p style={{ paddingLeft: '2%' }}>Enable active scan:</p>
          </CCol>
          <CCol>
            <CForm style={{ paddingLeft: '5%' }}>
              <CSwitch
                color="primary"
                defaultChecked={activeScan}
                onClick={() => toggleActiveScan()}
                labelOn="On"
                labelOff="Off"
              />
            </CForm>
          </CCol>
        </CRow>
        <div style={{ marginTop: '3%' }} hidden={!hadSuccess && !hadFailure}>
          <WifiChannelTable channels={channelList} />
        </div>
      </CModalBody>
      <CModalFooter>
        <LoadingButton
          label="Start"
          isLoadingLabel="Loading..."
          isLoading={waiting}
          action={doAction}
          variant="outline"
          block={false}
          disabled={waiting}
        />
        <CButton color="secondary" onClick={toggleModal}>
          Cancel
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
