import React from 'react';
import { Flex } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import DevicePageWrapper from './Wrapper';
import { useAuth } from 'contexts/AuthProvider';

const DevicePage = () => {
  const { id } = useParams();
  const { isUserLoaded } = useAuth();

  return (
    <Flex flexDirection="column" pt="75px">
      {isUserLoaded && id !== undefined && <DevicePageWrapper serialNumber={id} />}
    </Flex>
  );
};

export default DevicePage;
