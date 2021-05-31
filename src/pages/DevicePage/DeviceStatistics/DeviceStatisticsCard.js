import React from 'react';
import PropTypes from 'prop-types';
import { 
    CCard, 
    CCardHeader, 
    CCardBody
} from '@coreui/react';
import StatisticsChartList from './StatisticsChartList';

const DeviceStatisticsCard = ({ selectedDeviceId }) => (
    <CCard>
        <CCardHeader>Statistics</CCardHeader>
        <CCardBody style={{padding: '5%'}}>
            <StatisticsChartList selectedDeviceId={selectedDeviceId}/>
        </CCardBody>
    </CCard>
);

DeviceStatisticsCard.propTypes = {
    selectedDeviceId: PropTypes.string.isRequired,
};

export default DeviceStatisticsCard;