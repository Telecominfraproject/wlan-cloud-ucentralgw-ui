import * as React from 'react';
import { Link } from '@chakra-ui/react';
import { DeviceWithStatus } from 'hooks/Network/Devices';
import { useGetProvUi } from 'hooks/Network/Endpoints';
import { useGetTag } from 'hooks/Network/Inventory';

type Props = {
  device: DeviceWithStatus;
};
const ProvisioningStatusCell = ({ device }: Props) => {
  const getProvUi = useGetProvUi();
  const getTag = useGetTag({ serialNumber: device.serialNumber });
  const goToProvUi = (dir: string) => `${getProvUi.data}/#/${dir}`;

  if (getTag.data?.extendedInfo?.entity?.name) {
    return (
      <Link isExternal href={goToProvUi(`entity/${getTag.data?.entity}`)}>
        {getTag.data?.extendedInfo?.entity?.name}
      </Link>
    );
  }
  if (getTag.data?.extendedInfo?.venue?.name) {
    return (
      <Link isExternal href={goToProvUi(`venue/${getTag.data?.venue}`)}>
        {getTag.data?.extendedInfo?.venue?.name}
      </Link>
    );
  }
  if (getTag.data?.extendedInfo?.subscriber?.name) {
    return (
      <Link isExternal href={goToProvUi(`venue/${getTag.data?.subscriber}`)}>
        {getTag.data?.extendedInfo?.subscriber?.name}
      </Link>
    );
  }

  return <span>-</span>;
};

export default ProvisioningStatusCell;
