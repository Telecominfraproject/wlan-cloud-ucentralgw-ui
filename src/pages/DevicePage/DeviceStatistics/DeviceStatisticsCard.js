import React from 'react';
import PropTypes from 'prop-types';
import { 
    CCard, 
    CCardHeader, 
    CCardBody
} from '@coreui/react';
import DeviceStatisticsChart from './DeviceStatisticsChart';

const DeviceStatisticsCard = ({ selectedDeviceId }) => (
    <CCard>
        <CCardHeader>Device Statistics</CCardHeader>
        <CCardBody>
            <DeviceStatisticsChart selectedDeviceId={selectedDeviceId} />
        </CCardBody>
    </CCard>
);

DeviceStatisticsCard.propTypes = {
    selectedDeviceId: PropTypes.string.isRequired,
};

export default DeviceStatisticsCard;