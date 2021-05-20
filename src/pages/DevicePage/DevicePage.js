import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { CRow, CCol } from '@coreui/react';
import DeviceHealth from './DeviceHealth';
import DeviceConfiguration from './DeviceConfiguration';
import DeviceActions from './DeviceActions';
import DeviceCommands from './DeviceCommands';
import DeviceLogs from './DeviceLogs';

const DevicePage = () => {
  const dispatch = useDispatch();

  // Storing the deviceId in the store
  let selectedDeviceId = useSelector((state) => state.selectedDeviceId);
  const { deviceId } = useParams();
  if (!selectedDeviceId || selectedDeviceId !== deviceId) {
    dispatch({ type: 'set', selectedDeviceId: deviceId });
    selectedDeviceId = deviceId;
  }

  useEffect(() => {
    dispatch({ type: 'set', selectedDevice: null, selectedDeviceId: null });
  }, []);

  return (
    <>
      <div className="App">
        <CRow>
          <CCol xs="12" sm="6">
            <DeviceConfiguration />
            <DeviceCommands/>
          </CCol>
          <CCol xs="12" sm="6">
            <DeviceLogs />
            <DeviceHealth />
            <DeviceActions />
          </CCol>
        </CRow>
      </div>
    </>
  );
};

export default DevicePage;
