import React from 'react';
import { useParams } from 'react-router-dom';
import { CRow, CCol } from '@coreui/react';
import DeviceHealth from 'components/DeviceHealth';
import DeviceConfiguration from 'components/DeviceConfiguration';
import CommandHistory from 'components/CommandHistory';
import DeviceLogs from 'components/DeviceLogs';
import DeviceStatisticsCard from 'components/InterfaceStatistics';
import DeviceActionCard from 'components/DeviceActionCard';
import DeviceStatusCard from 'components/DeviceStatusCard';
import { DeviceProvider } from 'ucentral-libs';

const DevicePage = () => {
  const { deviceId } = useParams();

  return (
    <div className="App">
      <DeviceProvider serialNumber={deviceId}>
        <CRow>
          <CCol xs="12" sm="6">
            <DeviceStatusCard />
            <DeviceConfiguration />
          </CCol>
          <CCol xs="12" sm="6">
            <DeviceLogs />
            <DeviceHealth />
            <DeviceActionCard />
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <DeviceStatisticsCard />
            <CommandHistory />
          </CCol>
        </CRow>
      </DeviceProvider>
    </div>
  );
};

export default DevicePage;
