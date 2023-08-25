import * as React from 'react';
import { SimpleGrid, Spacer } from '@chakra-ui/react';
import { v4 as uuid } from 'uuid';
import { RefreshButton } from '../../components/Buttons/RefreshButton';
import SystemTile from './MonitoringSystemCard';
import { useAuth } from 'contexts/AuthProvider';
import { useGetEndpoints } from 'hooks/Network/Endpoints';
import { Card } from 'components/Containers/Card';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { axiosSec } from 'constants/axiosInstances';

type MonitoringPageProps = {
  isOnlySec?: boolean;
};

const MonitoringPage = ({ isOnlySec }: MonitoringPageProps) => {
  const { token } = useAuth();
  const { data: endpoints, refetch, isFetching } = useGetEndpoints({ onSuccess: () => {} });

  const endpointsList = React.useMemo(() => {
    if (!token || (!isOnlySec && !endpoints)) return null;

    const endpointList = endpoints ? [...endpoints] : [];
    endpointList.push({
      uri: axiosSec.defaults.baseURL?.split('/api/v1')[0] ?? '',
      type: isOnlySec ? '' : 'owsec',
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
  }, [endpoints, token]);

  return (
    <>
      <Card mb="20px">
        <CardHeader variant="unstyled" px={4} py={2}>
          <Spacer />
          <RefreshButton onClick={refetch} isFetching={isFetching} />
        </CardHeader>
      </Card>
      <SimpleGrid minChildWidth="1000px" spacing="20px">
        {endpointsList}
      </SimpleGrid>
    </>
  );
};

export default MonitoringPage;
