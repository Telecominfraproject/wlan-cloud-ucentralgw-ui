import { CCol, CRow } from '@coreui/react';
import React, { useEffect } from 'react';
import { v4 as createUuid } from 'uuid';
import WifiChannelCard from './WifiChannelCard';

const WifiChannelTable = ({ channels }) => {
  const sortChannels = () => {
    channels.sort((a, b) => (a.channel > b.channel ? 1 : -1));
  };

  useEffect(() => {
    if (channels) sortChannels();
  }, [channels]);

  return (
    <CRow>
      <CCol>
        {channels.map((channel, index) => {
          if (index % 2 === 0) return <WifiChannelCard key={createUuid()} channel={channel} />;
          return <div key={createUuid()} />;
        })}
      </CCol>
      <CCol>
        {channels.map((channel, index) => {
          if (index % 2 === 1) return <WifiChannelCard key={createUuid()} channel={channel} />;
          return <div key={createUuid()} />;
        })}
      </CCol>
    </CRow>
  );
};

export default WifiChannelTable;
