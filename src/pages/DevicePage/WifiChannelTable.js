import {
    CCol,
    CRow
  } from '@coreui/react';
import React from 'react';
import { v4 as createUuid } from 'uuid';
import WifiChannelCard from './WifiChannelCard';

const WifiChannelTable = ({channels}) => (
    <CRow>
        <CCol>
            {
                channels.map((channel, index) => {
                    if(index % 2 === 0) return <WifiChannelCard key={createUuid()} channel={channel}/>;
                    return <></>
                })
            }
        </CCol>
        <CCol>
            {
                channels.map((channel, index) => {
                    if(index % 2 === 1) return <WifiChannelCard key={createUuid()} channel={channel}/>;
                    return <></>
                })
            }
        </CCol>
    </CRow>
)


export default WifiChannelTable;