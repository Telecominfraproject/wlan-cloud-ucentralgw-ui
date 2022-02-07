/* eslint-disable-rule prefer-destructuring */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CButton, CModal, CModalHeader, CModalBody, CModalTitle, CPopover } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilX } from '@coreui/icons';
import PropTypes from 'prop-types';
import { prettyDate } from 'utils/helper';
import WifiChannelTable from './WifiChannelTable';

const WifiScanResultModal = ({ show, toggle, scanResults, date }) => {
  const { t } = useTranslation();

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
  return (
    <CModal size="lg" show={show} onClose={toggle}>
      <CModalHeader>
        <CModalTitle className="text-dark">
          {date !== '' ? prettyDate(date) : ''} {t('scan.results')}
        </CModalTitle>
        <div className="text-right">
          <CPopover content={t('common.close')}>
            <CButton color="primary" variant="outline" className="ml-2" onClick={toggle}>
              <CIcon content={cilX} />
            </CButton>
          </CPopover>
        </div>
      </CModalHeader>
      <CModalBody>
        {scanResults === null ? null : (
          <WifiChannelTable channels={parseThroughList(scanResults)} />
        )}
      </CModalBody>
    </CModal>
  );
};

WifiScanResultModal.propTypes = {
  show: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  scanResults: PropTypes.instanceOf(Array),
  date: PropTypes.string.isRequired,
};

WifiScanResultModal.defaultProps = {
  scanResults: [],
};

export default WifiScanResultModal;
