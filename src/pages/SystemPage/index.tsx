import React from 'react';
import { Flex, SimpleGrid } from '@chakra-ui/react';
import { v4 as uuid } from 'uuid';
import SystemTile from './SystemTile';
import { useGetEndpoints } from 'hooks/Network/Endpoints';
import { useAuth } from 'contexts/AuthProvider';
import { axiosSec } from 'constants/axiosInstances';

const SystemPage = () => {
  const { token, isUserLoaded } = useAuth();
  const { data: endpoints } = useGetEndpoints({ onSuccess: () => {} });

  const endpointsList = React.useMemo(() => {
    if (!endpoints || !token || !isUserLoaded) return null;

    const endpointList = [...endpoints];
    endpointList.push({
      uri: axiosSec.defaults.baseURL?.split('/api/v1')[0] ?? '',
      type: 'owsec',
      id: 0,
      vendor: 'owsec',
      authenticationType: '',
    });

    return endpointList
      .sort((a, b) => {
        if (a.type < b.type) return -1;
        if (a.type > b.type) return 1;
        return 0;
      })
      .map((endpoint) => <SystemTile key={uuid()} endpoint={endpoint} token={token} />);
  }, [endpoints, token, isUserLoaded]);

  return (
    <Flex flexDirection="column" pt="75px">
      {isUserLoaded ? (
        <SimpleGrid minChildWidth="500px" spacing="20px" mb={3}>
          {endpointsList}
        </SimpleGrid>
      ) : null}
    </Flex>
  );
};

export default SystemPage;
