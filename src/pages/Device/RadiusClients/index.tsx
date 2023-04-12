import * as React from 'react';
import { Box } from '@chakra-ui/react';
import DeviceRadiusClientsTable from './Table';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { useGetDeviceRadiusSessions } from 'hooks/Network/Radius';

type Props = {
  serialNumber: string;
};

const RadiusClientsCard = ({ serialNumber }: Props) => {
  const getRadiusClients = useGetDeviceRadiusSessions({ serialNumber });

  if (!getRadiusClients.data || getRadiusClients.data.length === 0) return null;

  return (
    <Card mb={4}>
      <CardBody>
        <Box w="100%">
          <DeviceRadiusClientsTable
            sessions={getRadiusClients.data}
            refetch={getRadiusClients.refetch}
            isFetching={getRadiusClients.isFetching}
          />
        </Box>
      </CardBody>
    </Card>
  );
};

export default RadiusClientsCard;
