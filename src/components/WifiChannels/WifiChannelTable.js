import {
    CCol,
    CRow
  } from '@coreui/react';
import React from 'react';
import WifiChannelCard from './WifiChannelCard';

const WifiChannelTable = ({channels}) => (
    <CRow>
        <CCol>
            {
                channels.map((channel, index) => {
                    if(index % 2 === 0) return <WifiChannelCard channel={channel}/>;
                    return <></>
                })
            }
        </CCol>
        <CCol>
            {
                channels.map((channel, index) => {
                    if(index % 2 === 1) return <WifiChannelCard channel={channel}/>;
                    return <></>
                })
            }
        </CCol>
    </CRow>
)


export default WifiChannelTable;