import { CCard, CCardTitle, CCardBody, CDataTable, CCardHeader } from '@coreui/react';
import React from 'react';
import PropTypes from 'prop-types';
import 'react-widgets/styles.css';

const WifiChannelCard = ({ channel }) => {
  const columns = [{ key: 'SSID', _style: { width: '70%' } }, { key: 'Signal' }];

  return (
    <CCard>
      <CCardHeader>
        <CCardTitle style={{ color: 'black' }}>Channel #{channel.channel}</CCardTitle>
      </CCardHeader>
      <CCardBody>
        <div className="overflow-auto" style={{ height: '250px' }}>
          <CDataTable items={channel.devices} fields={columns} style={{ color: 'white' }} />
        </div>
      </CCardBody>
    </CCard>
  );
};

WifiChannelCard.propTypes = {
  channel: PropTypes.instanceOf(Object).isRequired,
};

export default WifiChannelCard;
