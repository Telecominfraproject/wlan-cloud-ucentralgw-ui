/* eslint-disable-rule prefer-destructuring */
import React from 'react';
import {
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalTitle,
  CModalFooter,
} from '@coreui/react';
import WifiChannelTable from './WifiChannelTable';
import { prettyDate } from '../../utils/helper';

const WifiScanResultModalWidget = ({ show, toggle, scanResults, date }) => {
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
  return (
    <CModal size="lg" show={show} onClose={toggle}>
      <CModalHeader closeButton>
        <CModalTitle style={{ color: 'black' }}>
          {date !== '' ? prettyDate(date) : ''} Wifi Scan Results
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        {scanResults === null ? null : (
          <WifiChannelTable channels={parseThroughList(scanResults)} />
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={toggle}>
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  );
};
export default WifiScanResultModalWidget;
