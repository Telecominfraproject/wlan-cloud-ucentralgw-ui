import React from 'react';
import { Flex } from '@chakra-ui/react';
import DefaultConfigurationsList from './List';
import { useAuth } from 'contexts/AuthProvider';

const DefaultConfigurationsPage = () => {
  const { isUserLoaded } = useAuth();
  return (
    <Flex flexDirection="column" pt="75px">
      {isUserLoaded && <DefaultConfigurationsList />}
    </Flex>
  );
};

export default DefaultConfigurationsPage;
