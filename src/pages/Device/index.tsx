import React from 'react';
import { useParams } from 'react-router-dom';
import DevicePageWrapper from './Wrapper';

const DevicePage = () => {
  const { id } = useParams();

  return id !== undefined ? <DevicePageWrapper serialNumber={id.toLowerCase()} /> : null;
};

export default DevicePage;
