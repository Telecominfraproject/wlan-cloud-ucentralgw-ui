import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { CCard, CCardHeader, CCardBody, CPopover, CRow, CCol } from '@coreui/react';
import { cilSync } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import StatisticsChartList from './StatisticsChartList';

const DeviceStatisticsCard = ({ selectedDeviceId }) => {
  const [lastRefresh, setLastRefresh] = useState('');

  const refresh = () => {
    setLastRefresh(new Date().toString());
  };

  return (
    <CCard>
      <CCardHeader>
        <CRow>
          <CCol>Statistics</CCol>
          <CCol style={{ textAlign: 'right' }}>
            <CPopover content="Refresh">
              <CIcon
                onClick={refresh}
                name="cil-sync"
                content={cilSync}
                size="lg"
                color="primary"
              />
            </CPopover>
          </CCol>
        </CRow>
      </CCardHeader>
      <CCardBody style={{ padding: '5%' }}>
        <StatisticsChartList selectedDeviceId={selectedDeviceId} lastRefresh={lastRefresh} />
      </CCardBody>
    </CCard>
  );
};

DeviceStatisticsCard.propTypes = {
  selectedDeviceId: PropTypes.string.isRequired,
};

export default DeviceStatisticsCard;
