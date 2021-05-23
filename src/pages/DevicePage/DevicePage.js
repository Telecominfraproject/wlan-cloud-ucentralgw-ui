import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { CRow, CCol } from '@coreui/react';
import DeviceHealth from './DeviceHealth';
import DeviceConfiguration from './DeviceConfiguration';
import DeviceActions from './DeviceActions';
import DeviceCommands from './DeviceCommands';
import DeviceLogs from './DeviceLogs';

const DevicePage = () => {
  const dispatch = useDispatch();

  const { deviceId } = useParams();

  useEffect(() => {
    if (deviceId) dispatch({ type: 'set', selectedDeviceId: deviceId });
  }, [deviceId]);

  return (
    <>
      <div className="App">
        <CRow>
          <CCol xs="12" sm="6">
            <DeviceConfiguration selectedDeviceId={deviceId} />
          </CCol>
          <CCol xs="12" sm="6">
            <DeviceLogs selectedDeviceId={deviceId} />
            <DeviceHealth selectedDeviceId={deviceId} />
            <DeviceActions selectedDeviceId={deviceId} />
          </CCol>
        </CRow>
        <CRow>
          <CCol>
            <DeviceCommands selectedDeviceId={deviceId} />
          </CCol>
        </CRow>
      </div>
    </>
  );
};

export default DevicePage;
