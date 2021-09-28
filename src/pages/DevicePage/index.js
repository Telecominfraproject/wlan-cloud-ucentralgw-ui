import React from 'react';
import { useParams } from 'react-router-dom';
import { CRow, CCol } from '@coreui/react';
import DeviceHealth from 'components/DeviceHealth';
import DeviceStatusCard from 'components/DeviceStatusCard';
import CommandHistory from 'components/CommandHistory';
import DeviceLogs from 'components/DeviceLogs';
import DeviceStatisticsCard from 'components/InterfaceStatistics';
import DeviceActionCard from 'components/DeviceActionCard';
import axiosInstance from 'utils/axiosInstance';
import { DeviceProvider } from 'ucentral-libs';

const DevicePage = () => {
  const { deviceId } = useParams();

  return (
    <div className="App">
      <DeviceProvider axiosInstance={axiosInstance} serialNumber={deviceId}>
        <CRow>
          <CCol>
            <DeviceStatusCard />
          </CCol>
        </CRow>
        <CRow>
          <CCol lg="12" xl="6">
            <CommandHistory />
          </CCol>
          <CCol lg="12" xl="6">
            <DeviceActionCard />
          </CCol>
        </CRow>
        <CRow>
          <CCol lg="12" xl="6">
            <DeviceStatisticsCard />
          </CCol>
          <CCol lg="12" xl="6">
            <DeviceHealth />
            <DeviceLogs />
          </CCol>
        </CRow>
      </DeviceProvider>
    </div>
  );
};

export default DevicePage;
