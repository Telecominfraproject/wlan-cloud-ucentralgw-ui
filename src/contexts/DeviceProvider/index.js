import React, { useState } from 'react';
import PropTypes from 'prop-types';

const DeviceContext = React.createContext();

export const DeviceProvider = ({ serialNumber, children }) => {
  const [deviceSerialNumber, setDeviceSerialNumber] = useState(serialNumber);

  return (
    <DeviceContext.Provider value={{ deviceSerialNumber, setDeviceSerialNumber }}>
      {children}
    </DeviceContext.Provider>
  );
};

DeviceProvider.propTypes = {
  serialNumber: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export const useDevice = () => React.useContext(DeviceContext);
