import React from 'react';
import { Flex, Heading, SimpleGrid, Spacer } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import SystemTile from './SystemTile';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { Card } from 'components/Containers/Card';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { axiosSec } from 'constants/axiosInstances';
import { useAuth } from 'contexts/AuthProvider';
import { useGetEndpoints } from 'hooks/Network/Endpoints';

const SystemPage = () => {
  const { t } = useTranslation();
  const { token, isUserLoaded } = useAuth();
  const { data: endpoints, refetch, isFetching } = useGetEndpoints({ onSuccess: () => {} });

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

  if (!isUserLoaded) return null;

  return (
    <Flex flexDirection="column" pt="75px">
      <Card mb={4} py={2} px={4}>
        <CardHeader>
          <Heading size="md" my="auto">
            {t('controller.firmware.endpoints')}
          </Heading>
          <Spacer />
          <RefreshButton onClick={refetch} isFetching={isFetching} />
        </CardHeader>
      </Card>
      <SimpleGrid minChildWidth="500px" spacing="20px" mb={3}>
        {endpointsList}
      </SimpleGrid>
    </Flex>
  );
};
export default SystemPage;
