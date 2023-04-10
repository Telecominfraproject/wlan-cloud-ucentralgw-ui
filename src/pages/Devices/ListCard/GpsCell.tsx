import * as React from 'react';
import { Center } from '@chakra-ui/react';
import { DeviceWithStatus } from 'hooks/Network/Devices';
import LocationDisplayButton from 'pages/Device/LocationDisplayButton';

type Props = {
  device: DeviceWithStatus;
};
const DeviceTableGpsCell = ({ device }: Props) => {
  if (!device.hasGPS) return <Center>-</Center>;

  return (
    <Center>
      <LocationDisplayButton serialNumber={device.serialNumber} isCompact />
    </Center>
  );
};

export default DeviceTableGpsCell;
