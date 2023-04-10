import * as React from 'react';
import DurationCell from 'components/TableCells/DurationCell';
import { DeviceWithStatus } from 'hooks/Network/Devices';

type Props = {
  device: DeviceWithStatus;
};
const DeviceUptimeCell = ({ device }: Props) => {
  if (!device.connected || device.started === 0) return <span>-</span>;

  // Get the uptime in seconds from device.started which is UNIX timestamp
  const uptime = Math.floor(Date.now() / 1000 - device.started);

  return <DurationCell seconds={uptime} />;
};

export default DeviceUptimeCell;
